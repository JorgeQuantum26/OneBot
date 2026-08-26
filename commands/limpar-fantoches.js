// Criar um comando rápido para consertar:

const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
  
db.delete(`pais_irã.anexadoPor`);
db.set(`pais_irã.controladoPor`, 'brasil');
db.set(`pais_irã.governoFantoche`, true);
db.set(`pais_irã.tributo`, 0.30);
db.set(`pais_irã.tributoPara`, 'brasil');
db.set(`pais_irã.status`, 'fantoche');
db.set(`pais_irã.isNPC`, false);

return message.channel.send(`ok`)
}