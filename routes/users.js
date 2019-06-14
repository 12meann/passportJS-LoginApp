const router = require("express").Router();
const passport = require("passport");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

//register
router.get("/register", (req, res) => {
  res.render("register", { user: req.user });
});

//register handle

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];

  //check password match
  if (password !== password2) {
    errors.push({ msg: "Passwords doesn't match" });
  }
  //check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
      user: req.user
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: "You are already registered using that email!" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
          user: req.user
        });
      } else {
        const newUser = new User({ name, email, password });

        //hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // password is now hash
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                //immediately login users after registration
                req.logIn(user, err => {
                  if (err) throw err;
                });
                req.flash(
                  "success_msg",
                  `Congratulations! You are now registered and logged in, ${
                    user.name
                  }.`
                );
                return res.redirect("/");
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

//login
router.get("/login", (req, res) => res.render("login", { user: req.user }));

// login handle local strategy

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true
  })(req, res, next);
});

//logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You have succesfully logout.");
  res.redirect("/");
});

//*********login with google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account" // user will be able to select account
  })
);

// cb with google
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    failureFlash: true
  }),
  (req, res) => {
    //now have access to req.user
    req.flash(
      "success_msg",
      `You have succesfully logged in, ${req.user.name}.`
    );
    res.redirect("/");
  }
);

//**********login with facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
    authType: "rerequest"
  })
);

// cb with facebook
router.get(
  "/facebook/redirect",
  passport.authenticate("facebook", {
    failureRedirect: "/auth/login",
    failureFlash: true
  }),
  (req, res) => {
    //now have access to req.user
    req.flash(
      "success_msg",
      `You have succesfully logged in, ${req.user.name}.`
    );
    res.redirect("/");
  }
);

module.exports = router;
