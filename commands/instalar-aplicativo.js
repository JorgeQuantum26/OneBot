const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

        const celular = message.content.split(' ')[1];
        const aplicativo = message.content.split(' ')[2].toLowerCase();
        const informacoes = message.content.slice(25 + celular.length + aplicativo.length);

        const aplicativosDisponiveis = {
            'facebook': 3,
            'instagram': 4,
            'twitter': 2,
            'youtube': 5
        };

        if (!aplicativosDisponiveis.hasOwnProperty(aplicativo)) {
            message.channel.send(`O aplicativo ${aplicativo} não está disponível!\nLista de aplicativos disponíveis:\n\n***${aplicativosDisponiveis}`);
            return;
        }

        if (db.get(`${celular}.aplicacoes.${aplicativo}`)) {
            message.channel.send(`O aplicativo ${aplicativo} já está instalado em ${celular}!`);
            return;
        }

        const memoriaGasta = aplicativosDisponiveis[aplicativo];

        if (db.get(`${celular}.memoria_livre`) < memoriaGasta) {
            message.channel.send(`Não há memória suficiente para instalar o aplicativo ${aplicativo} em ${celular}!`);
            return;
        }

        db.set(`${celular}.aplicacoes.${aplicativo}`, { informacoes: informacoes });
        const memoriaLivreAntes = db.get(`${celular}.memoria_livre`);
        db.subtract(`${celular}.memoria_livre`, memoriaGasta);

        message.channel.send(`O aplicativo ${aplicativo} foi instalado com sucesso em ${celular}! Memória livre antes: ${memoriaLivreAntes}GB, memória livre depois: ${db.get(`${celular}.memoria_livre`)}GB`);
    }
