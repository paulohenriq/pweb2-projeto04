const Queue = require('bull');
const { Category, Product } = require('../models');
const redis = require('../config/redisClient');
const transporter = require('../config/nodemailer');

// Criar uma fila chamada "categoryQueue"
const categoryQueue = new Queue('categoryQueue', {
  redis: redis.options,
});

// Processador da fila
categoryQueue.process(async (job) => {
  const { operation, data } = job.data;

  switch (operation) {
    case 'create': {
      const category = await Category.create(data);

      await redis.del('categories:list');
      console.log("invalidado cache de categorias");

      // Enviar email de notificação para o administrador
      const mailOptions = {
        from: 'paulo.gomes@uncisal.edu.br',
        to: 'paulohenriquegomessilva1@gmail.com',
        subject: 'Nova categoria criada',
        text: `Uma nova categoria foi criada na aula do dia 18/11/2024: ${category.name}`,
        html: `<p>Uma nova categoria foi criada na aula do dia 18/11/2024: ${category.name}</p>`,
      };

      // Enviar email
      await transporter.sendMail(mailOptions);

      return category;
    }
    case 'update': {
      const { id, updatedData } = data;
      let category = await Category.findOne({ where: { id },
        include: [
          {
            model: Product,
          },
        ],
      });
      if (!category) {
        throw new Error('Categoria não encontrada');
      }
      await category.update(updatedData);
      await redis.del('categories:list');
      console.log("Categoria atualizada e cache invalidado");
      return category;
    }
    default:
      throw new Error('Operação inválida');
  }
});

// Monitorar eventos de fila
categoryQueue.on('completed', (job, result) => {
  console.log(`O job de categoria ${job.id} foi concluído com o resultado: ${result}`);
});

categoryQueue.on('failed', (job, error) => {
  console.log(`O job de categoria ${job.id} falhou com o erro: ${error}`);
});

categoryQueue.on('stalled', (job) => {
  console.log(`O job de categoria ${job.id} foi parado`);
});

categoryQueue.on('active', (job) => {
  console.log(`O job de categoria ${job.id} está agora ativo`);
});

categoryQueue.on('waiting', (jobId) => {
  console.log(`O job de categoria ${jobId} está aguardando`);
});

categoryQueue.on('delayed', (jobId, delay) => {
  console.log(`O job de categoria ${jobId} está atrasado por ${delay} ms`);
});

categoryQueue.on('removed', (job) => {
  console.log(`O job de categoria ${job.id} foi removido`);
});

module.exports = categoryQueue;