exports.run = async (client, message) => message.channel.send(`🧩 Shard ${message.guild?.shardId ?? 0} ativa.`);
