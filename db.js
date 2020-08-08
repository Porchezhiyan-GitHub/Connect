const config = require("config");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(config.get("mongoHost"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to DB");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
