/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
    var TariffCard = sequelize.define("TariffCard", {
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
      }
    }, {
      tableName: "TariffCard"
    });
    
    return TariffCard;
  };
  