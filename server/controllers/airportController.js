const { getAirportByCountryCode } = require("airport-data-js");
const Airport = require("../models/Airport");

const cityFromAirportName = (name) =>
  name
    .replace(/\s+(international|domestic|civil enclave)\s+airport$/i, "")
    .replace(/\s+airport$/i, "")
    .trim();

const seedIndianAirports = async () => {
  const sourceAirports = await getAirportByCountryCode("IN");
  const airports = sourceAirports
    .filter((airport) => /^[A-Z]{3}$/.test(airport.iata || ""))
    .map((airport) => ({
      city: cityFromAirportName(airport.airport),
      name: airport.airport,
      iataCode: airport.iata,
      icaoCode: airport.icao,
      countryCode: airport.country_code,
      latitude: airport.latitude,
      longitude: airport.longitude,
      timezone: airport.time,
    }));

  await Airport.bulkWrite(
    airports.map((airport) => ({
      updateOne: { filter: { iataCode: airport.iataCode }, update: { $set: airport }, upsert: true },
    }))
  );
  console.log(`${airports.length} Indian airports synced to MongoDB.`);
};

const listAirports = async (req, res) => {
  try {
    const airports = await Airport.find({ countryCode: "IN" })
      .select("city name iataCode icaoCode")
      .sort({ city: 1, name: 1 });
    res.status(200).json({ airports });
  } catch (error) {
    res.status(500).json({ message: "Could not load airports." });
  }
};

module.exports = { seedIndianAirports, listAirports };
