const mongoose = require('mongoose');

/**
 * Establish a connection to MongoDB using MONGO_URI from the environment.
 * Exits the process on failure so the app never runs without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
