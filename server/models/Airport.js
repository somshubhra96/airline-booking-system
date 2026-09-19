const mongoose = require("mongoose");

const airportSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    iataCode: { type: String, required: true, uppercase: true, unique: true },
    icaoCode: { type: String, uppercase: true },
    countryCode: { type: String, required: true, uppercase: true },
    latitude: Number,
    longitude: Number,
    timezone: String,
  },
  { timestamps: true }
);

airportSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model("Airport", airportSchema);
