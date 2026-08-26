const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    
    if (!nomePais) return message.channel.send('❌ Você não possui um país!');
    
    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send('❌ País não encontrado.');
    
    const engine = client.paisEngine;
    if (!engine) return message.channel.send('❌ Engine não disponível.');
    
    // Dados do acidente que ocorreu
    const mortos = 21402396;
    const feridos = 49938925;
    const evacuados = 71341321;
    
    message.channel.send('⏳ Aplicando consequências do acidente nuclear...');
    
    // Aplicar as consequências reais
    engine.aplicarConsequenciasReais(nomePais, pais, 'grave', mortos, feridos, evacuados);
    
    message.channel.send('✅ Consequências aplicadas! Verifique as notícias.');
};