const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async(client, message, args) => {

       let loja = db.get(`loja`) || { produtos: [] };

      const semProdutos = new Discord.EmbedBuilder()
  .setTitle(`Loja - RPG Mundi`)
  .setColor('Random')
  .setDescription(`Nenhum produto disponível na loja!`)
  .setFooter({ text: `© Venda algum produto usando \`B!add-produto` })
  .setTimestamp();

  if(!loja || !loja.produtos || loja.produtos.length === 0) {
    message.channel.send({ embeds: [semProdutos] });
return;

  }

   let mensagem = 'Produtos Disponíveis na Loja:\n';


for (const produto of loja.produtos) {
  const vendedor = message.guild.members.cache.get(produto.vendedorId);

  const nomeVendedor = vendedor ? vendedor.displayName : "Usuário Desconhecido";

  mensagem = new Discord.MessageEnbed+ ` - Nome: ${produto.nome}\nQuantidade:(${produto.quantidade} unidades por ${produto.valorUnitario} cada). Vendido por: ${nomeVendedor}\n`
}
    message.channel.send(mensagem);

};