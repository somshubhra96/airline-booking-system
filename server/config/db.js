const mongoose = require("mongoose");

const connectDatabase = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it to server/.env before starting the API.");
  }

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

module.exports = connectDatabase;
