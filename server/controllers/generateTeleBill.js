const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const telescopicController = require("./telescopicController");

module.exports = {
  calculateTeleBill: async function(req, res) {
    var billObject = {
      summary: {
        telescopic: true,
        singlePhase: true,
        monthlyConsumption: 0,
        energyCharge: 0,
        fuelSurCharge: 0,
        fixedCharge: 0
      },
      details: {
        slabs: [],
      },
    };
    unitsCharged = 0;
    unitsSofar = 0;
    monthlyConsumption = Math.ceil(req.body.consumedUnits / 2);
    billObject.summary.monthlyConsumption= monthlyConsumption;
    unitsCalculated = 50;
    fuelSurChargeRate = .1;

    var tariffCard = await telescopicController.getTeleScopicBill(
      req.body.telescopic,
      req.body.singlePhase,
      monthlyConsumption
    );

    if (monthlyConsumption <= 250) {
      numberOfSlabs =
        monthlyConsumption % unitsCalculated == 0
          ? Math.floor(monthlyConsumption / unitsCalculated)
          : Math.floor(monthlyConsumption / unitsCalculated) + 1;

      tariffCard.forEach((element, index) => {
        tariffSlab = element.dataValues;
        unitsCharged =
          numberOfSlabs == index + 1 ? monthlyConsumption - unitsSofar : 50;
        unitsSofar += unitsCharged;
        chargeForTheSlab = unitsCharged * tariffSlab.perUnitCharge;
        billObject.summary.energyCharge+= chargeForTheSlab;
        billObject.summary.fuelSurCharge = parseFloat((billObject.summary.energyCharge * fuelSurChargeRate).toFixed(2))
        billObject.summary.fixedCharge = parseInt(tariffSlab.fixedCharge);
        console.log(index + 1, unitsCharged, unitsSofar);

        switch (index + 1) {
          case 1:
            billObject.details.slabs.push({
              "0 - 50": chargeForTheSlab,
            });
            break;
          case 2:
            billObject.details.slabs.push({
              "51 - 100": chargeForTheSlab,
            });
            break;
          case 3:
            billObject.details.slabs.push({
              "101 - 150": chargeForTheSlab,
            });
            break;
          case 4:
            billObject.details.slabs.push({
              "151 - 200": chargeForTheSlab,
            });
            break;
          case 5:
            billObject.details.slabs.push({
              "200 - 50": chargeForTheSlab,
            });
            break;
        }
      });
            res.json(billObject);
    } else {
      res.status(422).json("Wrong API, try non telescopic billing");
    }
  },
};
