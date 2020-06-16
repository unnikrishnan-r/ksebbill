const router = require("express").Router();
const telescopicBillRoute = require("./telescopicbill");
// const nontelescopicBillRoute = require("./nontelescopicbill");

router.use("/telescopicbill", telescopicBillRoute);
// router.use("/nontelescopicbill", nontelescopicBillRoute);

module.exports = router;
