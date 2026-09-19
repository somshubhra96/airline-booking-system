const express = require("express");
const { searchFlights } = require("../controllers/flightController");
const { listAirports } = require("../controllers/airportController");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Airline reservation API is running.",
  });
});

router.get("/flights", searchFlights);
router.get("/airports", listAirports);
router.post("/auth/register", register);
router.post("/auth/login", login);

module.exports = router;
