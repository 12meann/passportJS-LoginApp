const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  googleId: String,
  facebookId: String,
  email: String,
  password: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("user", userSchema);

module.exports = User;
