//Exports the entity controllers in a single object

const productController = require('./product');
const categoryController = require('./category');

module.exports = {
  productController,
  categoryController,
};