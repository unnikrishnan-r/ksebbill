const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const dbController = require("./dbController");
const calculations = require("./calculationFunctions");
const unitsCalculated = 50;
const fuelSurChargeRate = 0.1;

async function calculateFixedCharges(
  telescopic,
  singlePhase,
  monthlyConsumption
) {
  var fixedChargeObj = {
    fixedCharge: 0,
  };
  var fixedChargeSlab = await dbController.getFixedCharge(
    telescopic,
    singlePhase,
    monthlyConsumption
  );
  fixedChargeObj.fixedCharge = parseFloat(
    fixedChargeSlab.dataValues.fixedCharge
  );
  return fixedChargeObj;
}

async function calculateEnergyCharges(
  telescopic,
  singlePhase,
  monthlyConsumption
) {
  var unitsCharged = 0;
  var unitsSofar = 0;

  var energyChargesObj = {
    total: 0,
    consumptionCharge: 0,
    fuelSurCharge: 0,
    slabs: [],
  };

  var tariffCard = await dbController.getTariffCard(
    telescopic,
    singlePhase,
    monthlyConsumption
  );
  numberOfSlabs =
    monthlyConsumption % unitsCalculated == 0
      ? Math.floor(monthlyConsumption / unitsCalculated)
      : Math.floor(monthlyConsumption / unitsCalculated) + 1;

  console.log("numberOfSlabs", numberOfSlabs);

  tariffCard.forEach((element, index) => {
    tariffSlab = element.dataValues;
    unitsCharged =
      numberOfSlabs == index + 1 ? monthlyConsumption - unitsSofar : 50;
    unitsSofar += unitsCharged;
    chargeForTheSlab = unitsCharged * tariffSlab.perUnitCharge;

    energyChargesObj.consumptionCharge += chargeForTheSlab;
    energyChargesObj.fuelSurCharge = parseFloat(
      (energyChargesObj.consumptionCharge * fuelSurChargeRate).toFixed(2)
    );

    console.log(index + 1, unitsCharged, unitsSofar);

    switch (index + 1) {
      case 1:
        energyChargesObj.slabs.push({
          "0 - 50": chargeForTheSlab,
        });
        break;
      case 2:
        energyChargesObj.slabs.push({
          "51 - 100": chargeForTheSlab,
        });
        break;
      case 3:
        energyChargesObj.slabs.push({
          "101 - 150": chargeForTheSlab,
        });
        break;
      case 4:
        energyChargesObj.slabs.push({
          "151 - 200": chargeForTheSlab,
        });
        break;
      case 5:
        energyChargesObj.slabs.push({
          "200 - 250": chargeForTheSlab,
        });
        break;
    }
  });
  energyChargesObj.total =
    energyChargesObj.consumptionCharge + energyChargesObj.fuelSurCharge;
  return energyChargesObj;
}
module.exports = {
  calculateTeleBill: async function(req, res) {
    var billObject = {
      connectionDetails: {
        telescopic: true,
        singlePhase: true,
      },
      bimonthlySummary: {},
      monthlySummary: {},
      meterRent: {},
      fixedCharge: {},
    };

    totalUnits = req.body.finalReading - req.body.startingReading;
    monthlyConsumption = Math.floor(totalUnits / 2);

    billObject.meterRent = await calculations.calculateMeterCharges(
      req.body.singlePhase
    );

    billObject.fixedCharge = await calculateFixedCharges(
      req.body.telescopic,
      req.body.singlePhase,
      monthlyConsumption
    );

    billObject.energyCharge = await calculateEnergyCharges(
      req.body.telescopic,
      req.body.singlePhase,
      monthlyConsumption
    );

    billObject.monthlySummary = await calculations.calculateMonthlyTotals(
      billObject.meterRent,
      billObject.energyCharge,
      billObject.fixedCharge,
      monthlyConsumption
    );

    billObject.bimonthlySummary = await calculations.calculateBiMonthlyTotals(
      billObject.monthlySummary
    );

    if (monthlyConsumption <= 250) {
      res.json(billObject);
    } else {
      res.status(422).json("Wrong API, try non telescopic billing");
    }
  },
};
