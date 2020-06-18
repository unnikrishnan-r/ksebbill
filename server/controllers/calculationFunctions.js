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

  calculateBiMonthlyTotals: async function(
    monthlySummaryObj,
    numberOfMonths,
    doorlockbillamount,
    doorlockpaidamount
  ) {
    var bimonthlySummaryObj = {
      totalConsumption: 0,
      totalAmount: 0,
      fixedCharge: 0,
      meterCharge: 0,
      energyCharge: 0,
      energyDuty: 0,
      fuelSurcharge: 0,
      doorlockAdj: 0,
      previousDue: 0,
    };
    numberOfMonths = 2;
    bimonthlySummaryObj.totalConsumption =
      monthlySummaryObj.monthlyConsumption * numberOfMonths;
    bimonthlySummaryObj.fixedCharge =
      monthlySummaryObj.fixedCharge * numberOfMonths;
    bimonthlySummaryObj.meterCharge =
      monthlySummaryObj.meterCharge * numberOfMonths;
    bimonthlySummaryObj.energyCharge =
      monthlySummaryObj.energyCharge * numberOfMonths;
    bimonthlySummaryObj.energyDuty =
      monthlySummaryObj.energyDuty * numberOfMonths;
    bimonthlySummaryObj.totalAmount =
      monthlySummaryObj.totalAmount * numberOfMonths;
    bimonthlySummaryObj.fuelSurcharge =
      monthlySummaryObj.fuelSurcharge * numberOfMonths;
    bimonthlySummaryObj.doorlockAdj = numberOfMonths == 4
      ? parseFloat(
          (bimonthlySummaryObj.totalAmount - doorlockbillamount).toFixed(2)
        )
      : 0;
    bimonthlySummaryObj.previousDue = doorlockbillamount - doorlockpaidamount;

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
      meterObject.meterRentDetails.rent = singlePhase ? 6 : 15;
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

      var stringToPush =
        unitsCharged + " units @ Rs" + tariffSlab.perUnitCharge + "/unit";
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
