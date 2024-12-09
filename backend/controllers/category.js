const { Category } = require('../models');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middlewares/auth');
const redis = require('../config/redisClient');
const categoryQueue = require('../queue/category');

/**
 * Creates a new category
 * @param {*} req
 * @param {*} res
 * @returns Object
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
 * Fetches all categories
 * @param {*} req
 * @param {*} res
 * @returns Object
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
 * Gets a single category by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
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
 * Updates a single category by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
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
 * Deletes a single category by it's id
 * @param {*} req
 * @param {*} res
 * @returns Boolean
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