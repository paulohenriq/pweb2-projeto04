const { Product } = require('../models');
const multer = require('multer');
const uploadToCloudinary = require('../middlewares/upload-cloud');
const upload = multer({ storage: multer.memoryStorage() });
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const redis = require('../config/redisClient');

/**
 * Creates a new product
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
const createProduct = [
  // Upload de arquivo em disco
  upload.single('productImage'),

  // Upload de arquivo em nuvem
  uploadToCloudinary,
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('price').isNumeric().withMessage('O preço deve ser numérico'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Transformação dos dados
    const transformedData = {
      ...req.body,
      id: uuidv4(),
      name: req.body.name.toLowerCase(),
      // productImage: req.file ? req.file.filename : null, // Upload de arquivo em disco
      productImage: req.cloudinaryUrl || null, // Upload de arquivo em nuvem
      expiryDate: new Date()
    };

    try {
      const product = await Product.create(transformedData);

      await redis.del('products:list');
      console.log("invalidado cache de produtos");

      return res.status(201).json(
        product
      );
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
];


/**
 * Fetches all products
 * @param {*} req
 * @param {*} res
 * @returns Object
 */
const getAllProducts = async (req, res) => {
  try {
    const cacheKey = 'products:list';
    const cacheData = await redis.get(cacheKey);

    if (cacheData) {
      console.log('Dados do cache de produto obtidos');
      return res.status(200).json(JSON.parse(cacheData));
    }

    const products = await Product.findAll({ order: [['createdAt', 'DESC']] })

    // Salva em cache por 1 hora
    await redis.set(cacheKey, JSON.stringify(products), 'EX', 3600);
    console.log('Dados dos produtos armazenados em cache');

    return res.status(200).json( products )
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

/**
 * Gets a single product by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findOne({
      where: { id: id }
    })

    if (product) {
      return res.status(200).json( product )
    }

    return res.status(404).send('Product with the specified ID does not exist')
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
/**
 * Updates a single product by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
 */
const updateProductById = [
  // Upload de arquivo em disco
  upload.single('productImage'),

  // Upload de arquivo em nuvem
  uploadToCloudinary,

  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('price').optional().isNumeric().withMessage('O preço deve ser numérico'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      let product = await Product.findOne({ where: { id: id } });

      if (!product) {
        return res.status(404).send('Product not found');
      }

      // Transformação de dados antes de atualizar
      const updatedData = req.body;
      if (updatedData.name) {
        updatedData.name = updatedData.name.toLowerCase(); // Converter nome para minúsculo

        // updatedData.productImage = req.file.filename || null; // Upload de arquivo em disco
        updatedData.productImage = req.cloudinaryUrl || null; // Upload de arquivo em nuvem

        updatedData.updatedAt = new Date();
      }

      await product.update(updatedData);

      await redis.del('products:list');
      console.log("invalidado cache de produtos");

      return res.status(200).json( product );
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
];

/**
 * Deletes a single product by it's id
 * @param {*} req
 * @param {*} res
 * @returns boolean
 */
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params

    const deletedProduct = await Product.destroy({
      where: { id: id }
    })

    if (deletedProduct) {
      await redis.del('products:list');
      console.log("invalidado cache de produtos");
      
      return res.status(204).send('Product deleted successfully ')
    }

    throw new Error('Product not found')
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  updateProductById
}