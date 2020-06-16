const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  getTariffCard: async function(telescopic,singlePhase,monthlyConsumption) {
    return db.TariffCard.findAll({
      where: {
        telescopic: telescopic,
        singlePhase: singlePhase,
        startingUnit: { [Op.lte]: monthlyConsumption },
      },
    })
  },
  getFixedCharge: async function(telescopic,singlePhase,monthlyConsumption) {
    return db.TariffCard.findOne({
      where: {
        telescopic: telescopic,
        singlePhase: singlePhase,
        startingUnit: { [Op.lte]: monthlyConsumption },
        endingUnit: { [Op.gte]: monthlyConsumption },
      },
    })
  }
};
