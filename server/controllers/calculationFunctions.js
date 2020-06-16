const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const dbController = require("./dbController");

const meterCess = 0.01;
const gstRate = 0.09;
const unitsCalculated = 50;
const fuelSurchargeRate = 0.1;
const electricityDutyRate = 0.1;

module.exports = {
  calculateMonthlyTotals: async function(
    meterObject,
    energyChargesObj,
    fixedChargeObj,
    monthlyConsumption
  ) {
    var monthlySummaryObj = {
      monthlyConsumption: 0,
      totalAmount: 0,
      fixedCharge: 0,
      meterCharge: 0,
      energyCharge: 0,
      energyDuty: 0,
      fuelSurcharge: 0,
    };
    monthlySummaryObj.monthlyConsumption = monthlyConsumption;
    monthlySummaryObj.fixedCharge = fixedChargeObj.fixedCharge;
    monthlySummaryObj.meterCharge = meterObject.total;
    monthlySummaryObj.energyCharge = energyChargesObj.consumptionCharge;
    monthlySummaryObj.energyDuty = energyChargesObj.electricityDuty;
    monthlySummaryObj.fuelSurcharge = energyChargesObj.fuelSurcharge;
    monthlySummaryObj.totalAmount = parseFloat(
      (
        monthlySummaryObj.fixedCharge +
        monthlySummaryObj.meterCharge +
        monthlySummaryObj.energyCharge +
        monthlySummaryObj.energyDuty +
        monthlySummaryObj.fuelSurcharge
      ).toFixed(2)
    );

    return monthlySummaryObj;
  },

  calculateBiMonthlyTotals: async function(monthlySummaryObj) {
    var bimonthlySummaryObj = {
      totalConsumption: 0,
      totalAmount: 0,
      fixedCharge: 0,
      meterCharge: 0,
      energyCharge: 0,
      energyDuty: 0,
      fuelSurcharge: 0,
    };
    bimonthlySummaryObj.totalConsumption =
      monthlySummaryObj.monthlyConsumption * 2;
    bimonthlySummaryObj.fixedCharge = monthlySummaryObj.fixedCharge * 2;
    bimonthlySummaryObj.meterCharge = monthlySummaryObj.meterCharge * 2;
    bimonthlySummaryObj.energyCharge = monthlySummaryObj.energyCharge * 2;
    bimonthlySummaryObj.energyDuty = monthlySummaryObj.energyDuty * 2;
    bimonthlySummaryObj.totalAmount = monthlySummaryObj.totalAmount * 2;
    bimonthlySummaryObj.fuelSurcharge = monthlySummaryObj.fuelSurcharge * 2;

    return bimonthlySummaryObj;
  },

  calculateMeterCharges: async function(singlePhase, customerMeter) {
    var meterObject = {
      total: 0,
      meterRentDetails: {
        rent: 0,
        cess: 0,
        cgst: 0,
        sgst: 0,
      },
    };
    if (!customerMeter) {
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
    }
    return meterObject;
  },

  calculateFixedCharges: async function(
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
    console.log("monthlyConsumption", monthlyConsumption);
    console.log(fixedChargeSlab.dataValues);
    return fixedChargeObj;
  },

  calculateTelescopicCharges: async function(
    telescopic,
    singlePhase,
    monthlyConsumption
  ) {
    var unitsCharged = 0;
    var unitsSofar = 0;

    var numberOfSlabs =
      monthlyConsumption % unitsCalculated == 0
        ? Math.floor(monthlyConsumption / unitsCalculated)
        : Math.floor(monthlyConsumption / unitsCalculated) + 1;

    var energyChargesObj = {
      total: 0,
      consumptionCharge: 0,
      fuelSurcharge: 0,
      electricityDuty: 0,
      slabs: [],
    };

    var tariffCard = await dbController.getTariffCard(
      telescopic,
      singlePhase,
      monthlyConsumption
    );

    tariffCard.forEach((element, index) => {
      tariffSlab = element.dataValues;
      unitsCharged =
        numberOfSlabs == index + 1 ? monthlyConsumption - unitsSofar : 50;
      unitsSofar += unitsCharged;
      chargeForTheSlab = parseFloat(
        (unitsCharged * tariffSlab.perUnitCharge).toFixed(2)
      );

      energyChargesObj.consumptionCharge += chargeForTheSlab;

      console.log(index + 1, unitsCharged, unitsSofar);
      var stringToPush =
        unitsCharged + " units @ Rs" + tariffSlab.perUnitCharge + "/unit";
      console.log(stringToPush);
      energyChargesObj.slabs.push({ [stringToPush]: chargeForTheSlab });
    });
    energyChargesObj.fuelSurcharge = parseFloat(
      (monthlyConsumption * fuelSurchargeRate).toFixed(2)
    );
    energyChargesObj.electricityDuty = parseFloat(
      (energyChargesObj.consumptionCharge * electricityDutyRate).toFixed(2)
    );

    energyChargesObj.total = parseFloat(
      (
        energyChargesObj.consumptionCharge +
        energyChargesObj.fuelSurcharge +
        energyChargesObj.electricityDuty
      ).toFixed(2)
    );
    return energyChargesObj;
  },
  calculateNonTelescopicCharges: async function(
    telescopic,
    singlePhase,
    monthlyConsumption
  ) {
    var energyChargesObj = {
      total: 0,
      consumptionCharge: 0,
      fuelSurcharge: 0,
      electricityDuty: 0,
      slabs: [],
    };

    var tariffCard = await dbController.getFixedCharge(
      telescopic,
      singlePhase,
      monthlyConsumption
    );

    tariffSlab = tariffCard.dataValues;
    energyChargesObj.consumptionCharge = parseFloat(
      (monthlyConsumption * tariffSlab.perUnitCharge).toFixed(2)
    );
    energyChargesObj.fuelSurcharge = parseFloat(
      (monthlyConsumption * fuelSurchargeRate).toFixed(2)
    );
    energyChargesObj.electricityDuty = parseFloat(
      (energyChargesObj.consumptionCharge * electricityDutyRate).toFixed(2)
    );
    energyChargesObj.total = parseFloat(
      (
        energyChargesObj.consumptionCharge +
        energyChargesObj.fuelSurcharge +
        energyChargesObj.electricityDuty
      ).toFixed(2)
    );
    var stringToPush =
      monthlyConsumption + " units @ Rs" + tariffSlab.perUnitCharge + "/unit";
    energyChargesObj.slabs.push({
      [stringToPush]: energyChargesObj.consumptionCharge,
    });

    return energyChargesObj;
  },
};
