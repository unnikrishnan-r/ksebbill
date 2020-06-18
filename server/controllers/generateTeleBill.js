const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const dbController = require("./dbController");
const calculations = require("./calculationFunctions");
const telescopicLimit = 250;
var telescopicBilling = false;

module.exports = {
  calculateTeleBill: async function(req, res) {
    var billObject = {
      connectionDetails: {
        telescopicBilling: false,
        singlePhase: true,
      },
      bimonthlySummary: {},
      monthlySummary: {},
      meterRent: {},
      fixedCharge: {},
    };

    totalUnits = req.body.finalReading - req.body.startingReading;
    monthlyConsumption = totalUnits / req.body.numberOfMonths;
    telescopicBilling = monthlyConsumption <= telescopicLimit ? true : false;
    billObject.connectionDetails.telescopicBilling = telescopicBilling;

    if (totalUnits > 0) {
      billObject.meterRent = await calculations.calculateMeterCharges(
        req.body.singlePhase,
        req.body.customerMeter
      );

      billObject.fixedCharge = await calculations.calculateFixedCharges(
        telescopicBilling,
        req.body.singlePhase,
        monthlyConsumption
      );

      if (telescopicBilling) {
        billObject.energyCharge = await calculations.calculateTelescopicCharges(
          telescopicBilling,
          req.body.singlePhase,
          monthlyConsumption
        );
      } else {
        billObject.energyCharge = await calculations.calculateNonTelescopicCharges(
          telescopicBilling,
          req.body.singlePhase,
          monthlyConsumption
        );
      }

      billObject.monthlySummary = await calculations.calculateMonthlyTotals(
        billObject.meterRent,
        billObject.energyCharge,
        billObject.fixedCharge,
        monthlyConsumption
      );

      billObject.bimonthlySummary = await calculations.calculateBiMonthlyTotals(
        billObject.monthlySummary,
        req.body.numberOfMonths,
        req.body.doorlockbillamount,
        req.body.doorlockpaidamount
      );

      res.json(billObject);
    }else{
      res.json({error:"Consumption is in negative,please validate inputs"})
    }
  },
};
