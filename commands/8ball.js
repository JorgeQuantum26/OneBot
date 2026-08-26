const Discord = require("discord.js");
const db = require('../systems/firestore');
const math = require("mathjs");

exports.run = async (client, message, args) => {
    let user = message.author;
    let ban = db.get(`banido_${user.id}`);

    const embed1 = new Discord.EmbedBuilder()
        .setTitle(`ERRO - BLACKLIST`)
        .setColor('Random')
        .setDescription(`${message.author}, Você foi banido! ¯\\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos. Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (com certeza não foi), você pode entrar em contato com a Equipe Do OneBot.\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema. Caso você tenha sido banido(a) injustamente, iremos resolver. Caso contrário, você permanecerá banido(a).\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido](https://discord.gg/sVkB8dtKp7)\n[Site (Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websi""""teonebot)`);

    if (ban) return message.channel.send({ embeds: [embed1] });

    let pergunta = args.join(" ").trim();
    if (!pergunta) return message.channel.send(`Faça uma pergunta primeiro!`);

 // Função para melhorar o texto fornecido pelo usuário
function melhorarTexto(texto) {
    // Substituir gírias e abreviações
    texto = texto
        .replace(/\b(vc)\b/gi, "você")
        .replace(/\b(pq)\b/gi, "porque")
        .replace(/\b(tbm)\b/gi, "também")
        .replace(/\b(q)\b/gi, "que")
        .replace(/\b(n)\b/gi, "não")
        .replace(/\b(tah)\b/gi, "tá")
        .replace(/\b(dps)\b/gi, "depois")
        .replace(/\b(cê)\b/gi, "você")
        .replace(/\b(tu)\b/gi, "você")
        .replace(/\b(oc)\b/gi, "você")
        .replace(/\b(cm)\b/gi, "como")
        .replace(/\b(fzr)\b/gi, "fazer")
        .replace(/\b(kd)\b/gi, "cadê")
        .replace(/\b(ql)\b/gi, "qual");

    // Melhorar pontuação e acentuação
    texto = texto
        .replace(/\b(eu)\b/gi, "Eu")
        .replace(/\b(você|vc|cê|tu|oc)\b/gi, "você")
        .replace(/\b(não|nao)\b/gi, "não")
        .replace(/\b(tá|tah)\b/gi, "tá")
        .replace(/\b(sou)\b/gi, "sou")
        .replace(/\b(bem)\b/gi, "bem")
        .replace(/\b(fazer|fzr)\b/gi, "fazer")
        .replace(/\b(alguma|algm)\b/gi, "alguma")
        .replace(/\b(coisa|cs)\b/gi, "coisa")
        .replace(/\b(pro|pra)\b/gi, "para")
        .replace(/\b(como)\b/gi, "como")
        .replace(/\b(assim)\b/gi, "assim")
        .replace(/\b(você)\b/gi, "você");

    // Melhorar a capitalização
    texto = texto.replace(/(^|\.\s+)([a-z])/g, (match, separator, char) => separator + char.toUpperCase());

    // Correção básica de pontuação
    texto = texto.replace(/(,)([^\s])/g, '$1 $2');  // Adicionar espaço após vírgula se não houver
    texto = texto.replace(/(\.)([^\s])/g, '$1 $2'); // Adicionar espaço após ponto final se não houver
    texto = texto.replace(/(\!)([^\s])/g, '$1 $2'); // Adicionar espaço após exclamação se não houver
    texto = texto.replace(/(\?)([^\s])/g, '$1 $2'); // Adicionar espaço após interrogação se não houver

    return texto;
}
    // Função para realizar cálculos utilizando mathjs
    function calcular(expressao) {
        try {
            return math.evaluate(expressao);
        } catch (e) {
            return 'Desculpe, não consegui calcular isso.';
        }
    }

    // Verificar se a string é uma expressão matemática válida
    function isMathExpression(string) {
        return /^[0-9+\-*/().\s^%]*$/.test(string);
    }

    // Verificar se o comando é para melhorar o texto
    if (pergunta.match(/^(melhore o texto:|corrija o texto:)/i)) {
        const texto = pergunta.replace(/^(melhore o texto:|corrija o texto:)/i, "").trim();
        if (texto) {
            const textoMelhorado = melhorarTexto(texto);
            const embed = new Discord.EmbedBuilder()
                .setColor(Math.floor(Math.random() * 0xffffff))
                .setTitle(`Texto Melhorado`)
                .setDescription(`Texto Original: **${texto}**\n\nTexto Melhorado: **${textoMelhorado}**`);
            return message.channel.send({ embeds: [embed] });
        } else {
            return message.channel.send('Por favor, forneça o texto que você quer que eu melhore.');
        }
    }

    // Biblioteca de respostas
    const respostas = [
        { regex: /tempo|clima/, resposta: 'Eu não tenho acesso ao clima atual, mas você pode verificar um aplicativo de clima ou site de previsão do tempo para informações detalhadas.' },
        { regex: /quem.*(você|cê|tu|oc)/, resposta: 'Eu sou um bot criado para ajudar você a responder perguntas e realizar tarefas. Como posso ajudar?' },
        { regex: /como.*(funciona|trabalha|trampo|trabalha)/, resposta: 'Eu funciono processando comandos que você envia e respondendo com base em informações que tenho disponíveis ou regras predefinidas.' },
        { regex: /dica|sugestão/, resposta: 'Minha sugestão é sempre continuar aprendendo e se adaptando. A vida está sempre mudando, e a capacidade de se ajustar é crucial para o sucesso.' },
        { regex: /ajuda|problema/, resposta: 'Estou aqui para ajudar! Por favor, descreva seu problema com mais detalhes para que eu possa oferecer a melhor assistência possível.' },
        { regex: /programação|código|codar/, resposta: 'Na programação, a prática é fundamental. Experimente resolver problemas em plataformas como HackerRank ou LeetCode para melhorar suas habilidades.' },
        { regex: /python/, resposta: 'Python é uma linguagem de programação de alto nível, interpretada e de propósito geral. Ela é conhecida por sua sintaxe clara e legível e é amplamente utilizada em desenvolvimento web, automação, ciência de dados, aprendizado de máquina e muito mais.' },
        { regex: /javascript/, resposta: 'JavaScript é uma linguagem de programação interpretada, baseada em scripts, que é amplamente utilizada para desenvolver páginas web interativas. Ele permite criar conteúdo dinâmico que pode reagir a eventos do usuário.' },
        { regex: /java\b/, resposta: 'Java é uma linguagem de programação de propósito geral, orientada a objetos, e projetada para ter o menor número possível de dependências de implementação. Ela é amplamente usada em aplicativos corporativos, desenvolvimento Android, e sistemas de grande porte.' },
        // Adicione mais pares regex/resposta conforme necessário para cobrir mais tópicos
    ];

    // Verificar qual resposta usar
    let resposta;

    if (isMathExpression(pergunta)) {
        resposta = `O resultado é: ${calcular(pergunta)}`;
    } else {
        for (let item of respostas) {
            if (item.regex.test(pergunta)) {
                resposta = item.resposta;
                break;
            }
        }
    }

    if (!resposta) {
        resposta = 'Desculpe, não tenho uma resposta específica para essa pergunta. Tente reformular ou perguntar algo diferente!';
    }

    const embed = new Discord.EmbedBuilder()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle(`Pergunta`)
        .setDescription(`Sua pergunta: **${pergunta}**\n\nMinha resposta: **${resposta}**`);

    message.channel.send({ embeds: [embed] });
}