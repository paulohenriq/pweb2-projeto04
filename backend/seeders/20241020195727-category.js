'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Categories',
      [
        {
          id: 'a52467a3-3a71-45c4-bf1c-9ace5ad3668f',
          name: 'Confectionaries',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '33a9e6e0-9395-4f6c-b1cd-3cf1f87e195a',
          name: 'Drinks',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
