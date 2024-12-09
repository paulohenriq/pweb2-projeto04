const { Category, Product } = require('../models');
const { v4: uuidv4 } = require('uuid');
const transporter = require('../config/nodemailer');
const authMiddleware = require('../middlewares/auth');
const redis = require('../config/redisClient');

/**
 * Creates a new category
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
const createCategory = async (req, res) => {
  try {
    const category = await Category.create({...req.body, id: uuidv4()});

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

    return res.status(201).json(
      category,
    );
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
  try {
    const { id } = req.params;
    const [updated] = await Category.update(req.body, { where: { id: id } });

    if (updated) {
      const updatedCategory = await Category.findOne({
        where: { id: id },
        include: [
          {
            model: Product,
          },
        ],
      });
      return res.status(200).json(updatedCategory);
    }

    throw new Error('Category not found ');
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