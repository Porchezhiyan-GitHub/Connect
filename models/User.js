const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unqiue: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model("user",userSchema);