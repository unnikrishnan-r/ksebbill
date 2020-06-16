const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const dbController = require("./dbController");

const meterCess = 0.01;
const gstRate = 0.09;

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
  },

  calculateBiMonthlyTotals: async function(monthlySummaryObj) {
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
  },

  calculateMeterCharges: async function(singlePhase) {
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
  },
};
