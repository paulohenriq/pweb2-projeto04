'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
      });
    }
  }

  Product.init(
    {
      name: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      inStock: DataTypes.BOOLEAN,
      productImage: DataTypes.STRING,
      price: DataTypes.INTEGER,
      expiryDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Product',
    }
  );
  return Product;
};