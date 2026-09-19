const Flight = require("../models/Flight");

const sampleFlights = [
  { airline: "Aerora", flightNumber: "AR 101", from: "DEL", to: "BOM", departureTime: "07:15", arrivalTime: "09:20", duration: "2h 05m", stops: "Non-stop", price: 5299 },
  { airline: "Aerora", flightNumber: "AR 215", from: "DEL", to: "BOM", departureTime: "12:40", arrivalTime: "14:55", duration: "2h 15m", stops: "Non-stop", price: 6180 },
  { airline: "Aerora", flightNumber: "AR 304", from: "DEL", to: "BLR", departureTime: "09:10", arrivalTime: "11:55", duration: "2h 45m", stops: "Non-stop", price: 6899 },
  { airline: "Aerora", flightNumber: "AR 412", from: "BOM", to: "BLR", departureTime: "16:25", arrivalTime: "18:10", duration: "1h 45m", stops: "Non-stop", price: 4575 },
  { airline: "Aerora", flightNumber: "AR 509", from: "BOM", to: "DEL", departureTime: "19:30", arrivalTime: "21:40", duration: "2h 10m", stops: "Non-stop", price: 5490 },
  { airline: "Aerora", flightNumber: "AR 623", from: "BLR", to: "DEL", departureTime: "06:50", arrivalTime: "09:35", duration: "2h 45m", stops: "Non-stop", price: 6599 },
];

const seedFlights = async () => {
  if (await Flight.countDocuments() === 0) {
    await Flight.insertMany(sampleFlights);
    console.log("Sample flights added to MongoDB.");
  }
};

const searchFlights = async (req, res) => {
  try {
    const from = req.query.from?.toUpperCase();
    const to = req.query.to?.toUpperCase();
    const filters = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    const flights = await Flight.find(filters).sort({ price: 1 });
    res.status(200).json({ flights });
  } catch (error) {
    res.status(500).json({ message: "Could not load flights." });
  }
};

module.exports = { seedFlights, searchFlights };
