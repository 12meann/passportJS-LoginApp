const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash");

require("dotenv").config();

const passport = require("passport");
const passportConfig = require("./config/passportConfig");
const cookieSession = require("cookie-session");

//init express
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//set view engine
app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    keys: [process.env.COOKIE_KEY]
  })
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

//initialize flash
app.use(flash());

//global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//connect db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch(err => {
    console.log(err);
  });

//home route
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

//routes
app.use("/auth", require("./routes/users"));
app.use("/forgot", require("./routes/forgot"));
app.use("/profile", require("./routes/profile"));

//set port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server listening at port ${PORT}`);
});
