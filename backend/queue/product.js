const Queue = require('bull');
const { Product } = require('../models');
const redisConfig = require('../config/redisClient');

// Criar uma fila chamada "productQueue"
const productQueue = new Queue('productQueue', {
  redis: redisConfig.options,
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
        throw new Error('Product not found');
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

module.exports = productQueue;