const mySecret = process.env['TOKEN'];
const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./systems/rpg-db');

const Discord = require('discord.js'); //Conexão com a livraria Discord.js
const { GatewayIntentBits, Partials, ActivityType, MessageFlags } = Discord;
const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
}); //Criação de um novo Client
const config = require('./config.json'); //Pegando o prefixo do bot para respostas de comandos
const commandsDirectory = path.join(__dirname, 'commands');
const commandAliases = {
    noticias: 'noticias-internacionais',
    notícias: 'noticias-internacionais',
    famtoches: 'fantoches'
};

function sendToConfiguredChannel(channelId, payload, context) {
    if (!channelId) return Promise.resolve(false);

    const channel = client.channels.cache.get(String(channelId));
    if (!channel || typeof channel.send !== 'function') {
        console.warn(`[${context}] Canal ${channelId} não está disponível. Verifique a configuração do canal.`);
        return Promise.resolve(false);
    }

    return channel.send(payload).catch((error) => {
        console.error(`[${context}] Não foi possível enviar mensagem para o canal ${channelId}:`, error);
        return false;
    });
}

function sendUnknownCommand(message, command) {
    const emoji = '<a:nao:868232161289986128>';
    const prefix = db.get(`ferinha_prefixo_${message.guild.id}`) || config.prefix;
    const commandText = `${prefix}${command}`;

    return message.channel
        .send(
            `${emoji} | ${message.author} O comando \`${commandText}\` não existe! Utilize **${prefix}ajuda** para mais informações!`
        )
        .then((sentMessage) => {
            setTimeout(() => sentMessage.delete().catch(console.error), 5000);
            return sentMessage;
        })
        .catch(console.error);
}

client.queue = new Map();
client.interaction = {};
const DiscordButtons = Discord;

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
    const id = interaction.customId || '';
    const userId = interaction.user.id;

    try {
        if (id.startsWith('rpg_operacao:')) {
            const partes = id.split(':');
            const acao = partes[1];
            const nomePais = String(db.get(`${userId}.pais`) || '').toLowerCase();
            if (!nomePais || nomePais !== String(partes[2] || '').toLowerCase()) {
                return interaction.reply({ content: '❌ Esta operação não pertence ao seu país.', ephemeral: true });
            }
            const pais = db.get(`pais_${nomePais}`);
            if (!pais || pais.governador !== userId) {
                return interaction.reply({
                    content: '❌ Apenas o governador pode comandar operações.',
                    ephemeral: true
                });
            }
            const operacao = require('./commands/operacao-militar');
            if (acao === 'alvo' && interaction.isStringSelectMenu()) {
                const alvo = interaction.values[0];
                const paisAlvo = db.get(`pais_${alvo}`);
                if (!paisAlvo) return interaction.reply({ content: '❌ País-alvo indisponível.', ephemeral: true });
                return interaction.update(operacao.criarSelecaoOperacao(nomePais, alvo, pais));
            }
            if (acao === 'tipo' && interaction.isStringSelectMenu()) {
                const alvo = partes[3];
                const tipo = interaction.values[0];
                const paisAlvo = db.get(`pais_${alvo}`);
                if (!paisAlvo)
                    return interaction.reply({ content: '❌ Teatro de operações indisponível.', ephemeral: true });
                return interaction.update(operacao.criarConfirmacaoOperacao(nomePais, alvo, tipo, pais, paisAlvo));
            }
            if (acao === 'confirmar' && interaction.isButton()) {
                const alvo = partes[3];
                const tipo = partes[4];
                await interaction.deferUpdate();
                const mensagemVirtual = {
                    author: interaction.user,
                    channel: { send: (payload) => interaction.followUp(payload) }
                };
                await operacao.run(client, mensagemVirtual, ['atacar', alvo, tipo]);
                return interaction.message.edit({ components: [] }).catch((error) => {
                    console.error('[Interaction] Falha ao encerrar confirmação militar:', error);
                });
            }
            if (acao === 'cancelar' && interaction.isButton()) {
                const paises = (db.get('lista_paises') || []).filter(
                    (paisDisponivel) => paisDisponivel !== nomePais && db.get(`pais_${paisDisponivel}`)
                );
                return interaction.update(operacao.criarPainelOperacao(nomePais, pais, paises));
            }
            return interaction.reply({ content: '❌ Ação de operação inválida.', ephemeral: true });
        }

        if (id.startsWith('rpg_hub:')) {
            const { handleButton } = require('./systems/rpg-hub');
            await handleButton(interaction, userId);
            return;
        }

        if (id.startsWith('rpg_diplomacia:')) {
            const [, acao, nomePaisId, propostaId] = id.split(':');
            const nomePais = String(db.get(`${userId}.pais`) || '').toLowerCase();
            if (!nomePais || nomePais !== String(nomePaisId || '').toLowerCase())
                return interaction.reply({ content: '❌ Este painel não pertence ao seu país.', ephemeral: true });
            const pais = db.get(`pais_${nomePais}`);
            if (!pais || pais.governador !== userId) {
                return interaction.reply({ content: '❌ Apenas o governador pode usar este painel.', ephemeral: true });
            }
            const propostas = (db.get(`propostas_${nomePais}`) || []).filter(
                (proposta) => proposta.status === 'pendente' && Number(proposta.expiraEm) > Date.now()
            );
            const painel = require('./commands/painel-diplomatico');
            if (acao === 'ver') {
                const proposta = propostas.find((item) => item.id === propostaId);
                if (!proposta)
                    return interaction.reply({
                        content: '❌ Proposta inexistente, expirada ou já respondida.',
                        ephemeral: true
                    });
                return interaction.update({
                    ...painel.renderizarDetalheProposta(nomePais, proposta),
                    flags: MessageFlags.IsComponentsV2
                });
            }
            return interaction.update({
                ...painel.criarPainelInterativo(nomePais, pais, propostas),
                flags: MessageFlags.IsComponentsV2
            });
        }

        if (id.startsWith('aceitar_') || id.startsWith('recusar_')) {
            const { handlePropostaButton } = require('./systems/propostas-engine');
            await handlePropostaButton(client, interaction);
            return;
        }

        if (id.startsWith('imposto_')) {
            const partes = id.split('_');
            const taxa = parseInt(partes[1]);
            const nomePais = partes.slice(2).join('_');
            const nomePaisUser = (db.get(`${userId}.pais`) || '').toLowerCase();
            if (nomePaisUser !== nomePais)
                return interaction.reply({ content: '❌ Este botão não é para o seu país!', ephemeral: true });
            const pais = db.get(`pais_${nomePais}`);
            if (!pais || pais.governador !== userId)
                return interaction.reply({ content: '❌ Apenas o governador pode alterar impostos!', ephemeral: true });
            const anterior = ((pais.taxaImposto || 0.1) * 100).toFixed(1);
            db.set(`pais_${nomePais}.taxaImposto`, taxa / 100);
            const impacto = taxa > parseFloat(anterior) ? -3 : +2;
            db.add(`pais_${nomePais}.aprovacaoPopular`, impacto);
            const engine = client.paisEngine;
            if (engine)
                engine.publicarNoticiaNacional(nomePais, {
                    titulo: `💼 Reforma Tributária`,
                    descricao: `Taxa de imposto alterada de **${anterior}%** para **${taxa}%**.`,
                    tipo: 'governo',
                    impacto: taxa > parseFloat(anterior) ? 'negativo' : 'positivo',
                    timestamp: Date.now(),
                    pais: nomePais
                });
            return interaction
                .reply({
                    content: `✅ Taxa de imposto definida em **${taxa}%**! Aprovação popular: ${impacto > 0 ? '+' : ''}${impacto}%`,
                    ephemeral: true
                })
                .catch(console.error);
        }

        if (id.startsWith('rec_')) {
            const partes = id.split('_');
            const tipo = partes[1];
            const qtd = parseInt(partes[2]);
            const nomePais = partes.slice(3).join('_');
            const nomePaisUser = (db.get(`${userId}.pais`) || '').toLowerCase();
            if (nomePaisUser !== nomePais)
                return interaction.reply({ content: '❌ Este botão não é para o seu país!', ephemeral: true });
            const pais = db.get(`pais_${nomePais}`);
            if (!pais || pais.governador !== userId)
                return interaction.reply({ content: '❌ Apenas o governador pode recrutar!', ephemeral: true });
            const CUSTOS = { infantaria: 10, tanques: 500, avioes: 2000, navios: 1500 };
            const MANUTENCAO = { infantaria: 0.05, tanques: 10, avioes: 40, navios: 30 };
            const custo = (CUSTOS[tipo] || 10) * qtd;
            if ((pais.tesouro || 0) < custo)
                return interaction.reply({
                    content: `❌ Tesouro insuficiente! Custo: ${custo.toLocaleString('pt-BR')} moedas.`,
                    ephemeral: true
                });
            db.add(`pais_${nomePais}.exercito.${tipo}`, qtd);
            db.subtract(`pais_${nomePais}.tesouro`, custo);
            db.add(`pais_${nomePais}.gastos`, custo);
            db.add(`pais_${nomePais}.exercito.manutencao`, qtd * (MANUTENCAO[tipo] || 1));
            return interaction.reply({
                content: `✅ **+${qtd} ${tipo}** recrutados! Custo: ${custo.toLocaleString('pt-BR')} moedas.`,
                ephemeral: true
            });
        }

        if (id.startsWith('minfunc_')) {
            const partes = id.split('_');
            const funcao = partes[1];
            const orcamento = parseInt(partes[2]);
            const nomeEnc = partes[3];
            const nomePais = partes.slice(4).join('_');
            const nomeMin = decodeURIComponent(nomeEnc);
            const nomePaisUser = (db.get(`${userId}.pais`) || '').toLowerCase();
            if (nomePaisUser !== nomePais)
                return interaction.reply({ content: '❌ Este botão não é para o seu país!', ephemeral: true });
            const pais = db.get(`pais_${nomePais}`);
            if (!pais || pais.governador !== userId)
                return interaction.reply({
                    content: '❌ Apenas o governador pode criar ministérios!',
                    ephemeral: true
                });
            const ministerios = pais.ministerios || {};
            if (ministerios[nomeMin])
                return interaction.reply({ content: '❌ Já existe um ministério com esse nome!', ephemeral: true });
            if ((pais.tesouro || 0) < orcamento)
                return interaction.reply({
                    content: `❌ Tesouro insuficiente! Custo: ${orcamento.toLocaleString('pt-BR')} moedas.`,
                    ephemeral: true
                });
            ministerios[nomeMin] = { nome: nomeMin, funcao, orcamento, funcionarios: [], criadoEm: Date.now() };
            db.set(`pais_${nomePais}.ministerios`, ministerios);
            db.subtract(`pais_${nomePais}.tesouro`, orcamento);
            db.add(`pais_${nomePais}.gastos`, orcamento);
            const engine = client.paisEngine;
            if (engine)
                engine.publicarNoticiaNacional(nomePais, {
                    titulo: `🏛️ Novo Ministério Criado`,
                    descricao: `**${nomeMin}** foi fundado com função de **${funcao}** e orçamento de ${orcamento.toLocaleString('pt-BR')} moedas/ciclo.`,
                    tipo: 'governo',
                    impacto: 'positivo',
                    timestamp: Date.now(),
                    pais: nomePais
                });
            const embed = new Discord.EmbedBuilder()
                .setTitle('🏛️ Ministério Criado com Sucesso!')
                .setDescription(`**${nomeMin}** foi fundado!`)
                .addFields({ name: '🏷️ Função', value: funcao, inline: true })
                .addFields({
                    name: '💰 Orçamento/Ciclo',
                    value: `${orcamento.toLocaleString('pt-BR')} moedas`,
                    inline: true
                })
                .addFields({ name: '⚙️ Modo', value: 'Automático — atuará a cada ciclo da engine', inline: false })
                .setColor('#2ecc71')
                .setTimestamp();
            await interaction.message.edit({ embeds: [embed], components: [] }).catch(() => {});
            return interaction.reply({ content: '✅ Ministério criado com sucesso!', ephemeral: true });
        }
    } catch (e) {
        console.error('[ButtonHandler]', e);
        const resposta = {
            content: '❌ Não foi possível concluir esta ação. O estado do mundo não foi confirmado.',
            ephemeral: true
        };
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(resposta).catch((followUpError) => {
                console.error('[ButtonHandler] Falha ao enviar erro da interaction:', followUpError);
            });
        } else {
            await interaction.reply(resposta).catch((replyError) => {
                console.error('[ButtonHandler] Falha ao responder interaction:', replyError);
            });
        }
    }
});

client.on('messageCreate', (msg) => {
    let ferinha_prefixo = config.prefix;
    let ferinha_author = msg.author;
    let ferinha_author_tag = msg.author.tag;

    let ferinha_nome_do_bot = client.user.username;
    let ferinha_bot = client.user;

    let ferinha_avatar = ferinha_author.displayAvatarURL({ dynamic: true });
    let ferinha_bot_avatar = ferinha_bot.displayAvatarURL({ dynamic: true });

    let ferinha_botões = `**Botões:** **[**\`⏩ Próximo\`**], [**\`⏪ Anterior\`**], [**\`❌ Fechar Painel\`**]**`;

    if (msg.author.bot) return;
    if (msg.content === `${ferinha_prefixo}prethelphallowen`) {
        //Coloquem o nome do comando aqui!

        const jorge_1 = new Discord.EmbedBuilder()
            .setTitle('Painel de ajuda')
            .setDescription(
                `**Olá ${ferinha_author}, eu sou o __${ferinha_nome_do_bot}__!\nVeja meus comandos clicando nos botões abaixo:**\n\n${ferinha_botões}\n\nAviso: Os Comandos Que Estiverem em <:online:806557394779504670>  Estão Funcionando, os Comandos Que Estiverem Em <:off:806557496969789480> Não Estão funcionando e os comandos que estiverem em <:manuteno:1011055405151047730> Estão Em Manutenção`
            )
            .setThumbnail(ferinha_avatar)
            .setFooter({ text: 'Página [1/11]', iconURL: ferinha_bot_avatar })
            .setColor(Math.floor(Math.random() * 0xffffff));

        const jorge_2 = new Discord.EmbedBuilder()
            .setTitle('Comandos de Administração')
            .setDescription(
                `**Olá ${ferinha_author}, veja meus comandos de \`ADMINISTRAÇÃO\` abaixo:**\n\nB!lock <:online:806557394779504670>
        Tranque um chat\n\nB!unlock <:online:806557394779504670>
     Destranque um chat\n\nB!clear <:online:806557394779504670>
        Delete uma quantia de mensagens em um chat\n\nB!ban <:manuteno:1011055405151047730>
       Bane um usuário do seu servidor\n\nB!say <:online:806557394779504670>
        Diga algo para o bot falar\n\nB!kick <:manuteno:1011055405151047730>
      Expulse um usuário de seu servidor\n\nB!slowmode <:online:806557394779504670>
 Ative o modo lento em algum chat\n\nB!slowmode off <:online:806557394779504670>
  Desative o modo lento em algum chat\n\nB!warn <:online:806557394779504670>
   Dê warn em algum usuário\n\nB!unwarn <:online:806557394779504670>
  Remova uma quantia de warn de algum usuário\n\nB!warnlist <:online:806557394779504670>
   Veja a lista de warns de algum usuário\n\nB!setnickname <:online:806557394779504670> 
    Altere o nome de algum usuário\n\nB!setentrada <:online:806557394779504670>
    Setar Um Canal de Boas vinda!\n\nB!setsaida <:online:806557394779504670>
    Setar um canal de Adeus\n\nB!setautorole <:online:806557394779504670>
 a   Setar um cargo como Autorole\n\nB!aviso <:manuteno:1011055405151047730> 
Avise algo em Algum Chat!
    \n\n${ferinha_botões}\n`
            )
            .setThumbnail(ferinha_avatar)
            .setFooter({ text: 'Página [2/11]', iconURL: ferinha_bot_avatar })
            .setColor(Math.floor(Math.random() * 0xffffff));

        const jorge_3 = new Discord.EmbedBuilder()
            .setTitle('Comandos de Utilidade')
            .setDescription(
                `\n\n
   B!ping <:online:806557394779504670>
    Veja meu ping\n\nB!uptime <:off:806557496969789480> 
Veja meu uptime\n\nB!jokenpo <:online:806557394779504670>
Jogue Pedra Papel Tesoura\n\nB!avatar <:online:806557394779504670>
Veja o avatar de algum usuário\n\n\n\nB!playstore <:off:806557496969789480> 
Pesquise um aplicativo na playstore\n\nB!coinflip <:off:806557496969789480>
Jogue cara ou coroa\n\nB!reportbug <:online:806557394779504670>\nReporte um bug encontrado para meu Desenvolvedor conseguir resolver!


\n\n${ferinha_botões}\n`
            )
            .setThumbnail(ferinha_avatar)
            .setFooter({ text: 'Página [3/11]', iconURL: ferinha_bot_avatar })
            .setColor(Math.floor(Math.random() * 0xffffff));

        const jorge_4 = new Discord.EmbedBuilder()
            .setTitle('Comandos de Diversão')
            .setDescription(
                `\n\n      B!tapa <:online:806557394779504670>
  Dê um tapa em algum Usuário\n\nB!hug <:off:806557496969789480>
 Abrace algum usuário\n\nB!corno <:online:806557394779504670>
 Veja se um Usuário é corno\n\nB!gay <:online:806557394779504670>
 Veja se um usuário é gay
\n\n${ferinha_botões}\n`
            )
            .setThumbnail(ferinha_avatar)
            .setFooter({ text: 'Página [4/11]', iconURL: ferinha_bot_avatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
        const jorge_5 = new Discord.EmbedBuilder()
            .setTitle(`Comandos De Informação`)
            .setDescription(
                `\n\nB!botinfo <:online:806557394779504670>\nVeja Minhas Informações\n\nB!userinfo <:manuteno:1011055405151047730>\nVeja as informações De algum usuário\n\n${ferinha_botões}\n`
            )
            .setFooter({ text: 'Página [5/11]', iconURL: ferinha_bot_avatar })
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setThumbnail(ferinha_avatar);
        const jorge_6 = new Discord.EmbedBuilder()
            .setTitle(`Comandos De Economia`)
            .setDescription(
                `\n\nB!bal <:online:806557394779504670>\nVeja Seus Coins!\n\nB!cie <:online:806557394779504670>\nTrabalhe Como Cientista!\n\nB!bom <:manuteno:1011055405151047730>\nTrabalhe Como Bombeiro!\n\nB!pol <:online:806557394779504670>\nTrabalhe Como Policial!\n\nB!pro <:off:806557496969789480>\nTrabalhe Como Professor!\n\nB!daily <:online:806557394779504670>\nColete seu Daily Diário\n\n**B!dep <quantidade>** <:manuteno:1011055405151047730>\nDeposite seus Coins!\n\n **B!sacar <quantidade>** <:manuteno:1011055405151047730>\nSaque seus Coins!.\n\n ${ferinha_botões}\n`
            )
            .setThumbnail(ferinha_avatar)
            .setFooter({ text: 'Página [6/11]', iconURL: ferinha_bot_avatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
        const jorge_7 = new Discord.EmbedBuilder()
            .setTitle(`Comandos De Música`)
            .setDescription(
                `\n\nSistema Em Desenvolvimento! Lançará Em breve!\n\n[Novidades do OneBot](https//discord.gg/TfwX4jN3Sn)
    \n\n${ferinha_botões}\n`
            )
            .setThumbnail(ferinha_avatar)
            .setFooter({ text: 'Página [7/11]', iconURL: ferinha_bot_avatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
        const vlad_8 = new Discord.EmbedBuilder()
            .setTitle(`Comandos do Desenvolvedor!`)
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setDescription(`\n\n<Em Desenvolvimento!`)
            .setFooter({ text: 'Página [8/11]', iconURL: ferinha_bot_avatar });

        const vlad_9 = new Discord.EmbedBuilder()
            .setTitle(`🎃 Comandos de Halloween 🎃`)
            .setColor(0xe67e22)
            .setDescription(
                `\n\n**B!buy-cest2** <:online:806557394779504670>\nCompre sua cesta de doces para começar a caça!\n\n**B!candy** <:online:806557394779504670>\nTente caçar um pouco de doces.\n\nO Resto está Sendo criado.\n\n${ferinha_botões}\n`
            )
            .setFooter({ text: 'Página [9/11]', iconURL: ferinha_bot_avatar });

        const vlad_10 = new Discord.EmbedBuilder()
            .setTitle(`Beneficios Premium`)
            .setColor(0x9b59b6)
            .setDescription(`Em Desenvolvimento\n\n${ferinha_botões}`)
            .setFooter({ text: 'Página [10/11]', iconURL: ferinha_bot_avatar });

        const vlad_11 = new Discord.EmbedBuilder()
            .setTitle(`Sistema de RPG`)
            .setColor(0x3498db)
            .setDescription(
                `Abaixo estará os comandos do meu Novo RPG Beta!\n\n**B!loja-rpg** <:online:806557394779504670>\nVeja os itens do RPG A venda! (Não tem como comprar algum deles ainda, pois o RPG não está completo!)\n\n**B!perfil** <:online:806557394779504670>\nVeja seu perfil no RPG!\n\n**B!roubar** <:online:806557394779504670>\nRoube o banco! (Obrigatório ser criminoso para utilizar este comando!)\n\n**B!criminal** <:online:806557394779504670>\nTorne-se Criminoso, Roube realize lavagem de dinheiro entre outros!\n\n**B!curar** <:online:806557394779504670>\nRegenere sua vida (Obrigatório ter pelo menos um Kit médico para se curar!)\n\n**B!treinar** <:online:806557394779504670>\nTreine e aumente sua força! (Obrigatório ter o **Peso** para treinar)\n\n**B!dormir** <:online:806557394779504670>\nDurma e recupere suas energias!\n\n**B!carteira** <:online:806557394779504670>\nVeja seu saldo ou de alguém do RPG!\n\n**B!lavagem <quantia>** <:online:806557394779504670>\n Realize uma lavagem de dinheiro.\n\nPor enquanto somente estes comandos pois o sistema ainda esta sendo desenvolvido.\n\n**B!setcommander** <:online:806557394779504670>\nApenas meu Desenvolvedor pode promover um Comandante!\n\n**B!militar** <:online:806557394779504670>\n Veja seu Status na carreira militar! Possui algumas informações no seu comando de Perfil.\n\n**B!items** <:online:806557394779504670>\nEste comando serve para você Verificar o que cada item faz.\n\n**B!inv** <:online:806557394779504670>\nVeja seu Inventário!\n\n**B!setdelegado** <:online:1011055332753158215>\nAdicione um Novo delegado, funciona apenas para Desenvolvedores.\n\n**B!envenenar** <:online:1011055332753158215>\nEnvenene um usuário, isso irá impedir ele de: Trabalhar, roubar, fazer flexões, dormir e etc...\n\n**B!curar-veneno** <:online:1011055332753158215>\nEste comando serve para você se livrar do envenenamento, ele irá te curar.\n\n**B!lista-magica** <:online:1011055332753158215>\nVeja a lista de magias de qualquer classe mago (Necessário ser de alguma classe de magos para usar esse comando!).\n\n**B!status-magia** <:online:1011055332753158215>\nEste comando é para você ver sua situação em relação à Mágia, etc...\n\n**B!trabalhomilitar** <:online:1011055332753158215>\nEste comando é para o militar trabalhar dentro do exército, neste comando você fará flexões.\n\n**B!items** <:online:1011055332753158215>\nVeja os itens do RPG e seus benefícios.\n\n**B!reset** <:online:1011055332753158215>\nEste comando serve para resetar todo seu progresso dentro do RPG, ao usar este comando, você irá iniciar tudo denovo, do 0. Mas veja o lado bom, você recebe 1 rebirth, com uma certa quantidade de rebirths você pode comprar coisas que irão te ajudar muito, tanto em ficar forte como em questão de dinheiro e etc...

\n\n${ferinha_botões}`
            )

            .setFooter({ text: 'Página [11/11]', iconURL: ferinha_bot_avatar });
        const embedPages = [
            jorge_1,
            jorge_2,
            jorge_3,
            jorge_4,
            jorge_5,
            jorge_6,
            jorge_7,
            vlad_8,
            vlad_9,
            vlad_10,
            vlad_11
        ];
        ButtonPages.createPages(client.interaction, msg, embedPages, 60 * 1000, 'blurple', '⏩', '⏪', '❌');
    }
});

client.on('messageDelete', async (message) => {
    if (!message.guild || !message.author) return;
    const ferinha_canal = db.get(`ferinha_msg_del_${message.guild.id}`);
    if (!ferinha_canal) return;
    if (message.author.bot) return;

    let ferinha_author = message.author;
    let ferinha_canal_2 = message.channel;
    let ferinha_msg_del = message.content;

    let ferinha_msg_embed = new Discord.EmbedBuilder()
        .setTitle(`🗑 Mensagem excluída`)
        .setColor(Math.floor(Math.random() * 0xffffff))
        .addFields(
            {
                name: `Autor da mensagem`,
                value: ferinha_author,
                inline: false
            },
            {
                name: `Canal`,
                value: ferinha_canal_2,
                inline: false
            },
            {
                name: `Mensagem`,
                value: `\`\`\`${ferinha_msg_del}\`\`\``,
                inline: false
            }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() || undefined });

    await sendToConfiguredChannel(ferinha_canal, ferinha_msg_embed, 'messageDelete');
});
client.on('guildMemberAdd', async (member) => {
    let ferinha_canal_de_boas_vindas = db.get(`ferinha_boas_vindas_${member.guild.id}`);

    let ferinha_contador = member.guild.memberCount;
    let ferinha_servidor = member.guild.name;

    if (!ferinha_canal_de_boas_vindas) return;

    let msg_embed_ferinha = new Discord.EmbedBuilder() //mensagem embed
        .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.avatarURL() })
        .setDescription(
            `Boas Vindas ${member.user} ao servidor **${ferinha_servidor}**! \nAtualmente estamos com \`${ferinha_contador}\` membros! Divirta-se No Servidor E Leia As Regras Para não ser punido!!!!`
        )
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setFooter({ text: `SISTEMA` })
        .setTimestamp()
        .setThumbnail(member.user.avatarURL());

    await sendToConfiguredChannel(ferinha_canal_de_boas_vindas, msg_embed_ferinha, 'guildMemberAdd');
});
client.on('guildMemberRemove', (member) => {
    let ferinha_canal_de_saida = db.get(`ferinha_saída_${member.guild.id}`);

    let ferinha_contador = member.guild.memberCount;

    if (!ferinha_canal_de_saida) return;

    let msg_embed_ferinha = new Discord.EmbedBuilder() //mensagem embed
        .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.avatarURL() })
        .setDescription(
            `O usuário ${member.user} saiu do servidor! \nAtualmente estamos com \`${ferinha_contador}\` membros! Espero que ele volte`
        )
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setFooter({ text: `SISTEMA` })
        .setTimestamp()
        .setThumbnail(member.user.avatarURL());

    return sendToConfiguredChannel(ferinha_canal_de_saida, msg_embed_ferinha, 'guildMemberRemove');
});
client.on('guildMemberAdd', async (member) => {
    let ferinha_autorole = db.get(`ferinha_autorole_${member.guild.id}`);
    if (!ferinha_autorole) return;
    await member.roles.add(ferinha_autorole).catch((error) => {
        console.error(`[guildMemberAdd] Não foi possível atribuir o cargo ${ferinha_autorole}:`, error);
    });
});
client.on('messageUpdate', async (oldMessage, message) => {
    if (!message.guild || !message.author) return;
    const ferinha_canal = db.get(`ferinha_msg_edit_${message.guild.id}`);
    if (!ferinha_canal) return;
    if (message.author.bot) return;

    let ferinha_author = message.author;
    let ferinha_canal_2 = message.channel;
    let ferinha_msg_antiga = oldMessage.content || '';
    let ferinha_msg_editada = message.content || '';

    let ferinha_embed = new Discord.EmbedBuilder()
        .setTitle(`📝 Mensagem editada`)
        .setColor(Math.floor(Math.random() * 0xffffff))
        .addFields(
            {
                name: `Autor da mensagem`,
                value: ferinha_author,
                inline: false
            },
            {
                name: `Canal`,
                value: ferinha_canal_2,
                inline: false
            },
            {
                name: `Mensagem antiga`,
                value: `\`\`\`${ferinha_msg_antiga}\`\`\``,
                inline: false
            },
            {
                name: `Mensagem editada`,
                value: `\`\`\`${ferinha_msg_editada}\`\`\``,
                inline: false
            }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() || undefined });

    await sendToConfiguredChannel(ferinha_canal, ferinha_embed, 'messageUpdate');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.type === 'dm') return;

    let prefixo_fera = db.get(`ferinha_prefixo_${message.guild.id}`);
    if (!prefixo_fera) prefixo_fera = config.prefix;
    if (message.author.bot) return;
    if (!message.content.toLowerCase().startsWith(prefixo_fera.toLowerCase())) return;
    if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`))
        return;

    const args = message.content.trim().slice(prefixo_fera.length).split(/ +/g);
    const command = (args.shift() || '').toLowerCase();
    if (!command) return;
    const commandName = commandAliases[command] || command;
    const commandPath = path.join(commandsDirectory, `${commandName}.js`);

    try {
        if (!commandPath.startsWith(`${commandsDirectory}${path.sep}`) || !fs.existsSync(commandPath)) {
            await sendUnknownCommand(message, command);
            return;
        }

        const commandFile = require(commandPath);
        if (!commandFile || typeof commandFile.run !== 'function') {
            throw new TypeError(`O arquivo do comando "${commandName}" não exporta uma função run.`);
        }

        await commandFile.run(client, message, args);
    } catch (err) {
        console.error(`[Comando ${command}]`, err);
        message.channel
            .send('❌ Ocorreu um erro ao executar esse comando. Tente novamente mais tarde.')
            .catch(console.error);
    }
});

const PaisEngine = require('./systems/pais-engine');

client.on('ready', () => {
    const engine = new PaisEngine(client);
    engine.start();
    client.paisEngine = engine;

    let activities = [
            `📦|Utilize ${config.prefix}ajuda para obter ajuda`,
            `🌏|estou em ${client.guilds.cache.size} servidores.`,
            `🎟️|Observando ${client.channels.cache.size} chat's!`,
            `👥|Observando ${client.users.cache.size} Usúarios`,
            `💼|Developer: Vlad II Dracull#3843`,
            `📌|meu prefix é B!`,
            `Veja minhas informações B!botinfo`,
            `🥞|Bolo é a minha comida preferida!`,
            `💘|Nunca desista você é incrivel!`,
            `🛬|Me adicione B!invite`,
            `🍔|Hamburguer é minha segunda comida preferida`,
            `📌|Versão 1.5.8 (beta)`,
            `Sistemas De Proteção Em breve`
        ],
        i = 0;
    setInterval(
        () =>
            client.user.setActivity(`${activities[i++ % activities.length]}`, {
                type: ActivityType.Watching
            }),
        1000 * 60
    );
    client.user.setStatus('online');

    console.log(`(DataBase) Conectando Ao Banco de Dados`);
    console.log(`(DataBase) Conetado Ao Banco de Dados`);
    console.log(`---------`);
    console.log(`Ativando`);
    console.log('Bot iniciado com sucesso');
    let embed = new Discord.EmbedBuilder()
        .setTitle(`📡|Inicialização`)
        .setDescription(
            `<a:sim:868232093556166756>|Estou Online!

Estou Ativo com ${client.guilds.cache.size} Servidores, ${client.users.cache.size} Usúarios!\nDataBase: Conectado\nSistema: <:online:806557394779504670>\n<:server:1256014619965919382> Servidor HTTP: **__Conectado__**\n<:server:1256014619965919382> Servidor WebSocket: **__Conectado__**\n<a:host:1256014664484257803> Porta aberta em **3000**\n`
        )
        .setColor([255, 182, 193]);
    sendToConfiguredChannel('804504431642542093', { embeds: [embed] }, 'ready');
});

db.ready
    .then(() => client.login(process.env.TOKEN))
    .then(() => {})
    .catch((error) => {
        console.error('[Inicialização] Firestore ou Discord indisponível:', error);
        process.exitCode = 1;
    });

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.channel.type == 'ferinha') return;
    if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {
        return message.channel.send(`🎟️ | Olá ${message.author}, veja meus comandos com **${config.prefix}ajuda**!`);
    }
});

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get('/', (req, res) => {
    res.status(200).send('OneBot online');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`[HTTP] Servidor ouvindo na porta ${port}`);
});
