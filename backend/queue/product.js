const Queue = require('bull');
const { Product } = require('../models');
const redis = require('../config/redisClient');

// Criar uma fila chamada "productQueue"
const productQueue = new Queue('productQueue', {
  redis: redis.options,
});

// Processador da fila
productQueue.process(async (job) => {
  const { operation, data } = job.data;

  switch (operation) {
    case 'create': {
      const product = await Product.create(data);

      await redis.del('products:list');

      console.log("Produto criado e cache invalidado");
      return product;
    }
    case 'update': {
      const { id, updatedData } = data;
      let product = await Product.findOne({ where: { id } });
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      await product.update(updatedData);
      await redis.del('products:list');
      console.log("Produto atualizado e cache invalidado");
      return product;
    }
    default:
      throw new Error('Operação inválida');
  }
});

// Monitorar eventos de fila
productQueue.on('completed', (job, result) => {
  console.log(`O job do produto ${job.id} foi concluído com o resultado: ${result}`);
});

productQueue.on('failed', (job, error) => {
  console.log(`O job do produto ${job.id} falhou com o erro: ${error}`);
});

productQueue.on('stalled', (job) => {
  console.log(`O job do produto ${job.id} foi parado`);
});

productQueue.on('active', (job) => {
  console.log(`O job do produto ${job.id} está agora ativo`);
});

productQueue.on('waiting', (jobId) => {
  console.log(`O job do produto ${jobId} está aguardando`);
});

productQueue.on('delayed', (jobId, delay) => {
  console.log(`O job do produto ${jobId} está atrasado por ${delay} ms`);
});

productQueue.on('removed', (job) => {
  console.log(`O job do produto ${job.id} foi removido`);
});

module.exports = productQueue;