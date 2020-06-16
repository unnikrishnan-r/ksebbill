const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const dbController = require("./dbController");

module.exports = {
    calculateTeleBill: async function(req, res) {
      var billObject = {
        connectionDetails: {
          telescopic: true,
          singlePhase: true,
        },
        bimonthlySummary: {
          totalConsumption: 0,
          totalAmount: 0,
          fixedCharge: 0,
          energyCharge: 0,
          fuelSurCharge: 0,
          meterRentTotal: 0,
        },
        monthlySummary: {
          monthlyConsumption: 0,
          totalAmount: 0,
          fixedCharge: 0,
          energyCharge: 0,
          fuelSurCharge: 0,
          meterRentTotal: 0,
        },
        details: {
          slabs: [],
          meterRent: {
            meterRentCharge: 0,
            meterRentCess: 0,
            meterRentCGST: 0,
            meterRentSGST: 0,
          },
        },
      };
      unitsCharged = 0;
      unitsSofar = 0;
      meterCess = 0.01;
      gstRate = 0.09;
      unitsCalculated = 50;
      fuelSurChargeRate = 0.1;
  
    }};  