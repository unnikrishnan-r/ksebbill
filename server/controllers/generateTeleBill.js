const db = require("../database/models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const telescopicController = require("./telescopicController");

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

    totalUnits = req.body.finalReading - req.body.startingReading ;
    monthlyConsumption = Math.ceil(totalUnits / 2);
    billObject.monthlySummary.monthlyConsumption = monthlyConsumption;
    billObject.details.meterRent.meterRentCharge = req.body.singlePhase
      ? 6
      : 12;
    billObject.details.meterRent.meterRentCess =
      billObject.details.meterRent.meterRentCharge * meterCess;
    billObject.details.meterRent.meterRentCGST =
      billObject.details.meterRent.meterRentCharge * gstRate;
    billObject.details.meterRent.meterRentSGST =
      billObject.details.meterRent.meterRentCharge * gstRate;

    billObject.monthlySummary.meterRentTotal =
      billObject.details.meterRent.meterRentCharge +
      billObject.details.meterRent.meterRentCess +
      billObject.details.meterRent.meterRentSGST +
      billObject.details.meterRent.meterRentCGST;

    billObject.bimonthlySummary.totalConsumption = totalUnits;
    billObject.bimonthlySummary.meterRentTotal =
      billObject.monthlySummary.meterRentTotal * 2;

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

        billObject.monthlySummary.energyCharge += chargeForTheSlab;
        billObject.monthlySummary.fuelSurCharge = parseFloat(
          (billObject.monthlySummary.energyCharge * fuelSurChargeRate).toFixed(
            2
          )
        );
        billObject.monthlySummary.fixedCharge = parseInt(
          tariffSlab.fixedCharge
        );

        billObject.bimonthlySummary.energyCharge =
          billObject.monthlySummary.energyCharge * 2;
        billObject.bimonthlySummary.fuelSurCharge =
          billObject.monthlySummary.fuelSurCharge * 2;
        billObject.bimonthlySummary.fixedCharge =
          billObject.monthlySummary.fixedCharge * 2;

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

      billObject.monthlySummary.totalAmount = 
      billObject.monthlySummary.energyCharge+
      billObject.monthlySummary.fuelSurCharge+
      billObject.monthlySummary.fixedCharge+
      billObject.monthlySummary.meterRentTotal

      billObject.bimonthlySummary.totalAmount = Math.ceil(billObject.monthlySummary.totalAmount * 2)

  
      res.json(billObject);
    } else {
      res.status(422).json("Wrong API, try non telescopic billing");
    }
  },
};
