const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  displayName: String,
  googleId: String,
  facebookId: String,
  twitterId: String
});

const User = mongoose.model("user", userSchema);

module.exports = User;
