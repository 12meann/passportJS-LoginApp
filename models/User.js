const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  googleId: String,
  facebookId: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  date: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

const User = mongoose.model("user", userSchema);

module.exports = User;
