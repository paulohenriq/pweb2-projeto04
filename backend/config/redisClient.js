const Redis = require('ioredis');

const redis = new Redis({
    host: 'localhost',
    port: 6379,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  }); // Conecta ao Redis na porta padrão (6379)

redis.on('error', (err) => {
    console.error('Erro na conexão com o Redis:', err);
});

module.exports = redis;