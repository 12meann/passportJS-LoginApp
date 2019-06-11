const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  //mongo db id
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/users/google/redirect",
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret
    },
    (accessToken, refreshToken, profile, done) => {
      //check if user exists in db
      User.findOne({ googleId: profile.id }).then(currentUser => {
        if (currentUser) {
          // found user in db
          console.log("user is:", currentUser);
          done(null, currentUser);
        } else {
          // no user in db so create new one
          new User({
            displayName: profile.displayName,
            googleId: profile.id
          })
            .save()
            .then(newUser => {
              console.log("newUser created:", newUser);
              done(null, newUser);
            })
            .catch(err => {
              console.log(err);
            });
        }
      });
    }
  )
);
