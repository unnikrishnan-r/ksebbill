const router = require("express").Router();
const telescopicBillRoute = require("./telescopicbill");

console.log("test")
router.use("/telescopicbill", telescopicBillRoute);

module.exports = router;
