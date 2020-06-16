const router = require("express").Router();
const generateTeleBill = require("../../controllers/generateTeleBill");

// Matches with "/api/projects"
router.route("/").post(generateTeleBill.calculateTeleBill);

module.exports = router;
