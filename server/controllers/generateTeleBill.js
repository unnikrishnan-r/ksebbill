const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const dbController = require("./dbController");
var unitsCharged = 0;
var unitsSofar = 0;
const meterCess = 0.01;
const gstRate = 0.09;
const unitsCalculated = 50;
const fuelSurChargeRate = 0.1;

function calculateMonthlyTotals(
  meterObject,
  energyChargesObj,
  fixedChargeObj,
  monthlyConsumption
) {
  var monthlySummaryObj = {
    monthlyConsumption: 0,
    totalAmount: 0,
    fixedCharge: 0,
    energyCharge: 0,
    meterCharge: 0,
  };
  monthlySummaryObj.monthlyConsumption = monthlyConsumption;
  monthlySummaryObj.fixedCharge = fixedChargeObj.fixedCharge;
  monthlySummaryObj.meterCharge = meterObject.total;
  monthlySummaryObj.energyCharge = energyChargesObj.total;
  monthlySummaryObj.totalAmount = parseFloat(
    (
      monthlySummaryObj.fixedCharge +
      monthlySummaryObj.meterCharge +
      monthlySummaryObj.energyCharge
    ).toFixed(2)
  );

  return monthlySummaryObj;
}

function calculateBiMonthlyTotals(monthlySummaryObj) {
  var bimonthlySummaryObj = {
    totalConsumption: 0,
    totalAmount: 0,
    fixedCharge: 0,
    energyCharge: 0,
    meterCharge: 0,
  };
  bimonthlySummaryObj.totalConsumption =
    monthlySummaryObj.monthlyConsumption * 2;
  bimonthlySummaryObj.fixedCharge = monthlySummaryObj.fixedCharge * 2;
  bimonthlySummaryObj.meterCharge = monthlySummaryObj.meterCharge * 2;
  bimonthlySummaryObj.energyCharge = monthlySummaryObj.energyCharge * 2;
  bimonthlySummaryObj.totalAmount = monthlySummaryObj.totalAmount * 2;

  return bimonthlySummaryObj;
}

function calculateMeterCharges(singlePhase) {
  var meterObject = {
    total: 0,
    meterRentDetails: {
      rent: 0,
      cess: 0,
      cgst: 0,
      sgst: 0,
    },
  };
  meterObject.meterRentDetails.rent = singlePhase ? 6 : 12;
  meterObject.meterRentDetails.cess =
    meterObject.meterRentDetails.rent * meterCess;
  meterObject.meterRentDetails.cgst =
    meterObject.meterRentDetails.rent * gstRate;
  meterObject.meterRentDetails.sgst =
    meterObject.meterRentDetails.rent * gstRate;

  meterObject.total =
    meterObject.meterRentDetails.rent +
    meterObject.meterRentDetails.cess +
    meterObject.meterRentDetails.cgst +
    meterObject.meterRentDetails.sgst;
  return meterObject;
}

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
          "200 - 50": chargeForTheSlab,
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

    billObject.meterRent = calculateMeterCharges(req.body.singlePhase);

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

    billObject.monthlySummary = await calculateMonthlyTotals(
      billObject.meterRent,
      billObject.energyCharge,
      billObject.fixedCharge,
      monthlyConsumption
    );

    billObject.bimonthlySummary = await calculateBiMonthlyTotals(
      billObject.monthlySummary
    );

    if (monthlyConsumption <= 250) {
      res.json(billObject);
    } else {
      res.status(422).json("Wrong API, try non telescopic billing");
    }
  },
};
