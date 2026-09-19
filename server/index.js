require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDatabase = require("./config/db");
const apiRoutes = require("./routes/apiRoutes");
const { seedFlights } = require("./controllers/flightController");
const { seedIndianAirports } = require("./controllers/airportController");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.use("/api", apiRoutes);

const startServer = async () => {
  try {
    await connectDatabase();
    await seedFlights();
    await seedIndianAirports();
  } catch (error) {
    console.warn(`Database not connected: ${error.message}`);
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
