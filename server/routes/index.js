const path = require("path");
const router = require("express").Router();
const apiRoutes = require("./api");

const db = require("../database/models");
// var Sequelize = require("sequelize");

// API Routes
router.use("/api", apiRoutes);

// This is temporary. For somereason the API route is not hitting the above code, hence altered it this way
// router.get("/api/projects", function (req, res) {
//   db.Projects.findAll({})
//     .then((projectList) => res.json(projectList))
//     .catch((err) => res.status(422).json(err));
// });

// If no API routes are hit, send the React app
router.use(function (req, res) {
  console.log("No Routes are hit", req.url, req.method);
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
  // res.send("No Routes were hit")
});

module.exports = router;
