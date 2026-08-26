const piadas = ['Por que o computador foi ao médico? Porque estava com vírus.', 'O que o zero disse para o oito? Belo cinto.'];
exports.run = async (client, message) => message.channel.send(piadas[Math.floor(Math.random() * piadas.length)]);
