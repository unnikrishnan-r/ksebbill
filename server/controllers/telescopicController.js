const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  getTeleScopicBill: async function(telescopic,singlePhase,monthlyConsumption) {
    console.log(telescopic,singlePhase,singlePhase);

    return db.TariffCard.findAll({
      where: {
        telescopic: telescopic,
        singlePhase: singlePhase,
        startingUnit: { [Op.lte]: monthlyConsumption },
      },
    })
  },
};
