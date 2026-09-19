const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
  {
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true, unique: true },
    from: { type: String, required: true, uppercase: true },
    to: { type: String, required: true, uppercase: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    stops: { type: String, default: "Non-stop" },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flight", flightSchema);
