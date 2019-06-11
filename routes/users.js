const router = require("express").Router();
const passport = require("passport");
const User = require("../models/User");

//login
router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//auth with google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
    prompt: "select_account" // user will be able to select account
  })
);

// cb with google
router.get(
  "/google/redirect",

  passport.authenticate("google"),
  (req, res) => {
    //now have access to req.user
    res.redirect("/profile/");
  }
);

module.exports = router;
