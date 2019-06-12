const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
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
      callbackURL: "/auth/google/redirect",
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
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

passport.use(
  new FacebookStrategy(
    {
      callbackURL: "http://localhost:3000/auth/facebook/redirect",
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      profileFields: ["id", "displayName", "photos", "email"]
    },
    (accessToken, refreshToken, profile, done) => {
      //check if user exists in db
      console.log(profile);
      User.findOne({ facebookId: profile.id }).then(currentUser => {
        if (currentUser) {
          // found user in db
          console.log("user is:", currentUser);
          done(null, currentUser);
        } else {
          // no user in db so create new one
          new User({
            displayName: profile.displayName,
            facebookId: profile.id
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
