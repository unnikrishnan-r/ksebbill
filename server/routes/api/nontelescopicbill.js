const router = require("express").Router();
const generateNonTeleBill = require("../../controllers/generateNonTeleBill");

// Matches with "/api/projects"
router.route("/").post(generateNonTeleBill.calculateNonTeleBill);

module.exports = router;
