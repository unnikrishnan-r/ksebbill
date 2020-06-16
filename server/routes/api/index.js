const router = require("express").Router();
const telescopicBillRoute = require("./telescopicbill");

router.use("/telescopicbill", telescopicBillRoute);

module.exports = router;
