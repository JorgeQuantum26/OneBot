const Discord = require('discord.js');
const config = require('../config.json');

exports.run = async (client, message, args) => {
    const prefix = config.prefix;
    const author = message.author;
    const bot = client.user;
    const authorAvatar = author.displayAvatarURL({ dynamic: true });
    const botAvatar = bot.displayAvatarURL({ dynamic: true });

    if (message.author.bot) return;

    let embed;

    if (!args[0]) {
        embed = new Discord.EmbedBuilder()
            .setTitle('Painel de Ajuda')
            .setDescription(`Olá ${author}, eu sou o __${bot.username}__!\nVeja meus comandos abaixo:\n\n\`\`\`js\n${prefix}ajuda "{mod} / {util} / {div} / {eco} / {info} / {music} / {dev} / {premium} / {rpg}"\`\`\`\n\n**Categorias:**\n\n:one: - Moderação (use {mod})\n:two: - Utilidade (use {util})\n:three: - Economia (use {eco})\n:four: - Informação (use {info})\n:five: - Música (use {music})\n:six: - Desenvolvedor (use {dev})\n:seven: - Premium (use {premium})\n:eight: - RPG (use {rpg})\n:nine: - Diversão (use {div})`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 1/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{mod}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de Administração')
            .setDescription(`**Olá ${author}, veja os comandos de ADMINISTRAÇÃO abaixo:**\n\n**${prefix}lock** <:online:806557394779504670>\nTranque um chat\n\n**${prefix}unlock** <:online:806557394779504670>\nDestranque um chat\n\n**${prefix}clear** <:online:806557394779504670>\nDelete uma quantidade de mensagens\n\n**${prefix}ban** <:manuteno:1011055405151047730>\nBane um usuário\n\n**${prefix}say** <:online:806557394779504670>\nFaça o bot falar algo\n\n**${prefix}kick** <:manuteno:1011055405151047730>\nExpulse um usuário\n\n**${prefix}slowmode** <:online:806557394779504670>\nAtive o modo lento\n\n**${prefix}slowmode off** <:online:806557394779504670>\nDesative o modo lento\n\n**${prefix}warn** <:online:806557394779504670>\nDê um aviso a um usuário\n\n**${prefix}unwarn** <:online:806557394779504670>\nRemova um aviso de um usuário\n\n**${prefix}warnlist** <:online:806557394779504670>\nVeja a lista de avisos de um usuário\n\n**${prefix}setnickname** <:online:806557394779504670>\nAltere o nome de um usuário\n\n**${prefix}setentrada** <:online:806557394779504670>\nDefina um canal de boas-vindas\n\n**${prefix}setsaida** <:online:806557394779504670>\nDefina um canal de despedida\n\n**${prefix}setautorole** <:online:806557394779504670>\nDefina um cargo como autorole\n\n**${prefix}aviso** <:manuteno:1011055405151047730>\nAvise algo em algum chat`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 2/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{util}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de Utilidade')
            .setDescription(`**Olá ${author}, veja os comandos de UTILIDADE abaixo:**\n\n**${prefix}ping** <:online:806557394779504670>\nVeja meu ping\n\n**${prefix}uptime** <:off:806557496969789480>\nVeja meu uptime\n\n**${prefix}jokenpo** <:online:806557394779504670>\nJogue Pedra, Papel e Tesoura\n\n**${prefix}avatar** <:online:806557394779504670>\nVeja o avatar de um usuário\n\n**${prefix}playstore** <:off:806557496969789480>\nPesquise um aplicativo na Play Store\n\n**${prefix}coinflip** <:off:806557496969789480>\nJogue cara ou coroa\n\n**${prefix}reportbug** <:online:806557394779504670>\nReporte um bug para os desenvolvedores`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 3/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{div}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de Diversão')
            .setDescription(`**Olá ${author}, veja os comandos de DIVERSÃO abaixo:**\n\n**${prefix}tapa** <:online:806557394779504670>\nDê um tapa em um usuário\n\n**${prefix}hug** <:off:806557496969789480>\nAbrace um usuário\n\n**${prefix}corno** <:online:806557394779504670>\nVeja se um usuário é corno\n\n**${prefix}gay** <:online:806557394779504670>\nVeja se um usuário é gay`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 4/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{info}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de Informação')
            .setDescription(`**Olá ${author}, veja os comandos de INFORMAÇÃO abaixo:**\n\n**${prefix}botinfo** <:online:806557394779504670>\nVeja minhas informações\n\n**${prefix}userinfo** <:manuteno:1011055405151047730>\nVeja as informações de um usuário`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 5/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{eco}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de Economia')
            .setDescription(`**Olá ${author}, veja os comandos de ECONOMIA abaixo:**\n\n**${prefix}bal** <:online:806557394779504670>\nVeja seus OneCoins ou de outros usuários\n\n**${prefix}trabalhar** <:online:806557394779504670>\nTrabalhe e ganhe dinheiro\n\n**${prefix}daily** <:online:806557394779504670>\nColete seu bônus diário\n\n**${prefix}dep <quantidade/all>** <:online:806557394779504670>\nDeposite seus Coins\n\n**${prefix}sacar <quantidade/all>** <:online:806557394779504670>\nSaque seus Coins\n\n**${prefix}cassino** <:online:806557394779504670>\nVeja os jogos de cassino disponíveis\n\n**${prefix}pay <usuario> <quantidade>** <:online:806557394779504670>\nFaça uma transferência para o banco de um usuário\n\n**${prefix}roubo <@usuario>** <:online:806557394779504670>\nRoube o banco de um usuário\n\n**${prefix}criarBanco <nome do Banco> <nome da conta>** <:online:806557394779504670>\nCrie uma conta bancária\n\n**${prefix}banco** <:online:806557394779504670>\nVeja suas informações bancárias\n\n**${prefix}loja** <:manuteno:1011055405151047730>\nVeja os itens disponíveis e compre o que precisar`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 6/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{music}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de Música')
            .setDescription(`**Olá ${author}, os comandos de música estão em desenvolvimento! Fique atento para novidades.**\n\n[Novidades do OneBot](https://discord.gg/TfwX4jN3Sn)`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 7/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{dev}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos do Desenvolvedor')
            .setDescription(`**Olá ${author}, os comandos do desenvolvedor estão em desenvolvimento!**`)
                        .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 8/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{premium}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos Premium')
            .setDescription(`**Olá ${author}, os comandos premium estão disponíveis para assinantes!**\n\n[Adquira Premium](https://discord.gg/TfwX4jN3Sn)`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 9/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{rpg}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de RPG 🌍 — Página 1/2')
            .setDescription(`**Olá ${author}, veja os comandos de RPG abaixo:**\n\n**🏴 PAÍSES — BASE**\n**${prefix}criarpais <nome>** — Cria um país\n**${prefix}nomeargovernador @user** — Nomeia governador\n**${prefix}registrar-cidadao <país>** — Torna-se cidadão e paga impostos automaticamente\n**${prefix}pagarimposto <valor>** — Paga imposto ao tesouro\n**${prefix}investir <valor>** — Investe no tesouro com juros\n**${prefix}coletar-recursos <recurso>** — Coleta ouro/comida/madeira/pedra\n**${prefix}melhorarinfraestrutura** — Melhora infraestrutura (máx 5)\n**${prefix}relatorio-investimentos <pais>** — Relatório econômico\n**${prefix}ranking-paises** — Ranking dos países\n\n**🏛️ GOVERNO & MINISTÉRIOS**\n**${prefix}nomear-funcionario <cargo> [@user]** — Nomeia funcionário (IA ou real)\n**${prefix}demitir-funcionario <cargo>** — Demite funcionário\n**${prefix}ver-funcionarios [país]** — Lista funcionários\n**${prefix}abrir-ministerio <nome> <orçamento>** — Abre ministério\n**${prefix}deletar-ministerio <nome>** — Dissolve ministério\n**${prefix}contratar-ministerio @user <min>** — Contrata para ministério\n**${prefix}ver-ministerios [país]** — Lista ministérios\n**${prefix}orcamento [país]** — Ver orçamento, gastos e receita\n\n**📜 PARLAMENTO & LEIS**\n**${prefix}enviar-lei "título" descrição** — Propõe uma lei\n**${prefix}ver-leis [país]** — Lista leis pendentes/aprovadas/vetadas\n**${prefix}aprovar-lei <id>** — Governador aprova uma lei\n**${prefix}vetar-lei <id>** — Governador veta uma lei\n\nUse \`${prefix}ajuda {rpg2}\` para ver mais comandos!`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 10/11 • ${prefix}ajuda {rpg2} para continuar`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{rpg2}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de RPG 🌍 — Página 2/2')
            .setDescription(`**🚢 COMÉRCIO & EMBARGOS**\n**${prefix}abrir-rota <país>** — Abre rota comercial bilateral\n**${prefix}fechar-rota <país>** — Fecha rota comercial\n**${prefix}embargo declarar/remover <país>** — Embargo econômico\n**${prefix}sancao-economica aplicar/remover <país>** — Sanções econômicas\n**${prefix}sancao-militar aplicar/remover <país>** — Sanções militares\n\n**⚔️ OPERAÇÕES MILITARES**\n**${prefix}operacao-militar ameacar <país>** — Ameaça formal\n**${prefix}operacao-militar debate <país> <motivo>** — Debate na ONU\n**${prefix}operacao-militar votar <id> favor/contra** — Vota na ONU\n**${prefix}operacao-militar atacar <país>** — Ataque militar\n**${prefix}operacao-militar status** — Ver votações ativas\n\n**🌾 POPULAÇÃO & ECONOMIA**\n**${prefix}investir-populacao <valor>** — Investe no crescimento populacional\n**${prefix}investir-agricultura <valor>** — Investe na produção agrícola\n**${prefix}cambio** — Ranking das moedas e câmbio\n\n**📰 NOTÍCIAS**\n**${prefix}noticias-internacionais [pág]** — Notícias globais\n**${prefix}noticias-nacionais <país> [pág]** — Notícias nacionais\n\n**⚙️ CONFIGURAÇÃO**\n**${prefix}setar-canal-noticias global/nacional [#canal]** — Configura canal de notícias\n\n**📈 BOLSA DE VALORES**\n**${prefix}iniciar-bolsa** | **${prefix}ver-bolsa** | **${prefix}comprar-acao <ação> <qtd>**\n**${prefix}vender-acoes <ação> <qtd>** | **${prefix}acoes** | **${prefix}resetar-bolsa**`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 10/11 • ${prefix}ajuda {rpg} para voltar`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else if (args[0] === '{dev2}') {
        embed = new Discord.EmbedBuilder()
            .setTitle('Comandos de Desenvolvimento')
            .setDescription(`**Olá ${author}, os comandos de desenvolvimento são acessíveis apenas para desenvolvedores!**\n\nPara mais informações sobre desenvolvimento, visite [nosso servidor](https://discord.gg/TfwX4jN3Sn).`)
            .setThumbnail(authorAvatar)
            .setFooter({ text: `Página 11/11`, iconURL: botAvatar })
            .setColor(Math.floor(Math.random() * 0xffffff));
    } else {
        embed = new Discord.EmbedBuilder()
            .setTitle('Erro')
            .setDescription(`Comando inválido ou inexistente. Use \`${prefix}ajuda\` para ver as opções disponíveis.`)
            .setThumbnail(authorAvatar)
            .setColor('#e74c3c');
    }

    message.channel.send({ embeds: [embed] });
};

            