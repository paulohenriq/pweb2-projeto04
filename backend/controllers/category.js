const { Category } = require('../models');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middlewares/auth');
const redis = require('../config/redisClient');
const categoryQueue = require('../queue/category');

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da categoria
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       500:
 *         description: Erro no servidor
 */
const createCategory = async (req, res) => {
  // Transformação dos dados
  const transformedData = {
    ...req.body,
    id: uuidv4(),
  };

  try {
    const job = await categoryQueue.add({ operation: 'create', data: transformedData });

    return res.status(201).json({ message: 'Categoria em processamento', jobId: job.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retorna todas as categorias
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID da categoria
 *                   name:
 *                     type: string
 *                     description: Nome da categoria
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Data de criação
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Data da última atualização
 *       500:
 *         description: Erro no servidor
 */
const getAllCategories = async (req, res) => {
  try {
    const cacheKey = 'categories:list';
    const cacheData = await redis.get(cacheKey);

    if (cacheData) {
      console.log('Dados do cache de categoria obtidos');
      return res.status(200).json(JSON.parse(cacheData));
    }

    const categories = await Category.findAll({
      order: [['createdAt', 'DESC']],
    });

    // Salva em cache por 1 hora
    await redis.set(cacheKey, JSON.stringify(categories), 'EX', 3600);
    console.log('Dados das categorias armazenados em cache');

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Retorna uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da categoria
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoria encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID da categoria
 *                 name:
 *                   type: string
 *                   description: Nome da categoria
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Data de criação
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Data da última atualização
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro no servidor
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id: id },
      order: [['createdAt', 'DESC']],
    });

    if (category) {
      return res.status(200).json(category);
    }

    return res
      .status(404)
      .send('Category with the specified ID does not exist');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da categoria a ser atualizada
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da categoria
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       400:
 *         description: Dados inválidos fornecidos para a atualização
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro no servidor
 */
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const updatedData = {
    ...req.body,
  };

  try {
    const job = await categoryQueue.add({ operation: 'update', data: { id, updatedData } });

    return res.status(201).json({ message: 'Atualização de categoria em processamento', jobId: job.id });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Deleta uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da categoria a ser deletada
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Categoria deletada com sucesso
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro no servidor
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.destroy({
      where: {
        id: id,
      },
    });

    if (deleted) {
      await redis.del('categories:list');
      console.log("invalidado cache de categorias");

      return res.status(204).send('Category deleted');
    }

    throw new Error('Category not found ');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  createCategory,
  getAllCategories: [authMiddleware, getAllCategories],
  getCategoryById,
  updateCategory,
  deleteCategory,
};