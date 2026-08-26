const Discord = require("discord.js");

const db = require('../systems/firestore');

const ms = require("parse-ms");



exports.run = async (bot, message, args) => {


    let user = message.author;
 let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nAgora você pode utilizar o comando \`\`\`B!suporte <motivo>\`\`\` para apelar a respeito de seu banimento. `)

   let criminal = await db.fetch(`crime_${user.id}`)

if(criminal < 1) return message.channel.send(`<a:nao:868232161289986128>|Você não é criminoso e não pode roubar`);
        

    let timeout = 600000;


  let autor_money = await db.fetch(`sujo_${user.id}`);

    let daily = await db.fetch(`rob_${user.id}`);



    if (daily !== null && timeout - (Date.now() - daily) > 0) {



        let time = ms(timeout - (Date.now() - daily));

  

        let timeEmbed = new Discord.EmbedBuilder()

        .setColor("#000001")

        .setDescription(`<a:nao:868232161289986128>|Você já realizou um roubo hoje!\n\nTente novamente daqui a **${time.hours}h ${time.minutes}m ${time.seconds}s**`);

        

        message.channel.send({ embeds: [timeEmbed] });

    } else {

        

        let sorte = Math.floor(Math.random() * 4) + 1;

        

        if(sorte == 2) {

            

            let amount = Math.floor(Math.random() * autor_money) + 1;

          const crimes = "Procurado";  

            let moneyEmbed = new Discord.EmbedBuilder()

            .setTitle("👮 Seu roubo falhou e você foi preso!")

            .setColor("#000001")

            .setDescription(`Você realizou um roubo e foi descoberto!\nE você perdeu um total de **${amount} Dinheiro Sujo**, Agora você está como procurado!`);

           

            message.channel.send({ embeds: [moneyEmbed] });

            db.subtract(`sujo_${user.id}`, amount);

            db.set(`proc_${user.id}`, crimes);

        }else{

            

            let amount = Math.floor(Math.random() * 500) + 1;

            

            let moneyEmbed = new Discord.EmbedBuilder()

            .setTitle("🔫 Roubo Realizado Com sucesso!")

            .setColor("#000001")

            .setDescription(`Você roubou o Banco!\nE você conseguiu uma quantia de **${amount} Dinheiro Sujo**!`);

            

            message.channel.send({ embeds: [moneyEmbed] });

            db.add(`sujo_${user.id}`, amount);

            db.set(`rob_${user.id}`, Date.now());

        };

    };

}






    
            