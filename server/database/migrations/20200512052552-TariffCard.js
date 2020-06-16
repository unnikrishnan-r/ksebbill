"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TariffCard', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      telescopic: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      singlePhase: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      bplCategory: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      startingUnit: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      endingUnit: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      perUnitCharge: {
        type: DataTypes.DECIMAL(10, 2) ,
        allowNull: false
      },
      fixedCharge: {
        type: DataTypes.DECIMAL(10, 2) ,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('TariffCard');
  }
};