const Redis = require('ioredis');

const redis = new Redis(); // Conecta ao Redis na porta padrão (6379)

redis.on('error', (err) => {
    console.error('Erro na conexão com o Redis:', err);
});

module.exports = redis;