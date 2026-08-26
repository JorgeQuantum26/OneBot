const Discord = require("discord.js");
const compromise = require('compromise');

const perguntasRespostas = {
  'qual é o seu nome?': {
    resposta: 'Meu nome é Bot.',
    detalhes: 'Sou um bot Discord criado para interagir com os usuários e responder perguntas.'
  },
  // outras perguntas e respostas aqui
};

async function processarPergunta(pergunta) {
  for (const perguntaPredefinida in perguntasRespostas) {
    if (compromise(pergunta).normalize().text() === compromise(perguntaPredefinida).normalize().text()) {
      return perguntasRespostas[perguntaPredefinida];
    }
  }

  let respostaInteligente = 'Desculpe, não tenho uma resposta para essa pergunta.';

  const textoAnalisado = compromise(pergunta);
  const entidades = textoAnalisado.entities().data(); 

  if (entidades && entidades.length > 0) {
    for (const entidade of entidades) {
      if (entidade.type === "Value") {
        respostaInteligente = `Você perguntou sobre a expressão: ${entidade.text}`; 
        break;
      }
    }
  }

  return { resposta: respostaInteligente };
}

exports.run = async (client, message, args) => {
  const filter = m => m.author.id === message.author.id;

  message.channel.send('Olá! Qual é a sua pergunta?');

    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
    const pergunta = collected.first().content.toLowerCase().trim();

    const resposta = await processarPergunta(pergunta);
    message.channel.send(resposta.resposta.detalhes);
};