// commands/resetar-npc.js
const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
    // 🔒 SEGURANÇA MÁXIMA: Substitua pelo SEU ID de desenvolvedor do Discord
    const ID_DESENVOLVEDOR = '758473669658935328';

    if (message.author.id !== ID_DESENVOLVEDOR) {
        return message.channel.send('❌ Apenas o Desenvolvedor do OneBot pode rodar este comando de infraestrutura.');
    }

    const nomePais = args[0] ? args[0].toLowerCase() : null;
    if (!nomePais) {
        return message.channel.send(
            '⚠️ Informe o ID do país que deseja resetar para NPC! Exemplo: `B!resetar-npc brasil`'
        );
    }

    // 1. Puxa o documento atual guardado em cache/memória
    const paisAtual = db.get(`pais_${nomePais}`);
    if (!paisAtual) {
        return message.channel.send(`❌ O país \`${nomePais}\` não foi encontrado no sistema.`);
    }

    const dadosOriginais = getDadosPais(nomePais);
    const donoAntigoId = paisAtual.governador;

    // 2. Limpa o vínculo antigo do usuário se houver um id registrado nele
    if (donoAntigoId) {
        db.delete(`${donoAntigoId}.pais`);
    }

    // 3. Reseta cirurgicamente os campos de controle para forçar o retorno à IA
    db.set(`pais_${nomePais}.governador`, null);
    db.set(`pais_${nomePais}.isNPC`, true);

    // 4. Força uma aprovação popular base padrão para os NPCs operarem sem crises imediatas
    db.set(`pais_${nomePais}.aprovacaoPopular`, 60);

    // 5. Publica os boletins informativos nas centrais de notícias do jogo
    const noticia = {
        titulo: `🏛️ Intervenção Federal em ${dadosOriginais ? dadosOriginais.nomeFormal : nomePais}`,
        descricao: `O governo de **${dadosOriginais ? dadosOriginais.nomeFormal : nomePais}** foi restaurado para o controle civil da Inteligência Artificial por decreto administrativo.`,
        tipo: 'governo',
        impacto: 'neutro',
        timestamp: Date.now(),
        pais: nomePais
    };

    if (client.paisEngine) {
        client.paisEngine.publicarNoticiaGlobal(noticia);
        client.paisEngine.publicarNoticiaNacional(nomePais, noticia);
    }

    return message.channel.send(
        `✅ **Sucesso!** O país \`${nomePais}\` foi limpo e devolvido com sucesso para a IA (NPC).`
    );
};
