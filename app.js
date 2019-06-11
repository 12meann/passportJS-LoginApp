const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const passport = require("passport");
const passportConfig = require("./config/passportConfig");
const cookieSession = require("cookie-session");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//set view engine
app.set("view engine", "ejs");

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    keys: [process.env.cookieKey]
  })
);
// initialize passport
app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.mongoURI, { useNewUrlParser: true })
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch(err => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

//routes
app.use("/users", require("./routes/users"));
app.use("/profile", require("./routes/profile"));

//set port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server listening at port ${PORT}`);
});
