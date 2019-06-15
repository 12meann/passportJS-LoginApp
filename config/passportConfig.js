const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
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
      callbackURL:
        "/auth/google/redirect" ||
        "https://loginappwithpassport.herokuapp.com/auth/google/redirect",
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    (accessToken, refreshToken, profile, done) => {
      //check if user exists in db
      console.log("google profile:", profile);
      User.findOne({ email: profile.emails[0].value }).then(emailTaken => {
        console.log("emailTaken:", emailTaken);
        if (emailTaken) {
          return done(null, false, {
            message: "That email address is already registered."
          });
        } else {
          User.findOne({ googleId: profile.id }).then(currentUser => {
            if (currentUser) {
              // found user in db
              done(null, currentUser);
            } else {
              // no user in db so create new one
              new User({
                name: profile.displayName,
                googleId: profile.id,
                email: profile.emails[0].value
              })
                .save()
                .then(newUser => {
                  done(null, newUser);
                })
                .catch(err => {
                  console.log(err);
                });
            }
          });
        }
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      callbackURL:
        "http://localhost:3000/auth/facebook/redirect" ||
        "https://loginappwithpassport.herokuapp.com/auth/facebook/redirect",
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      profileFields: ["id", "displayName", "photos", "emails"]
    },
    (accessToken, refreshToken, profile, done) => {
      //check if user exists in db
      console.log("facebook profile:", profile);
      User.findOne({ email: profile.emails[0].value }).then(emailTaken => {
        if (emailTaken) {
          return done(null, false, {
            message: "That email address is already registered."
          });
        } else {
          User.findOne({ facebookId: profile.id }).then(currentUser => {
            if (currentUser) {
              // found user in db
              console.log("user is:", currentUser);
              done(null, currentUser);
            } else {
              // no user in db so create new one
              new User({
                name: profile.displayName,
                facebookId: profile.id,
                email: profile.emails[0].value
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
      });
    }
  )
);

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    // find user
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return done(null, false, {
            message: "That email is not registered."
          });
        }
        if (!user.password) {
          return done(null, false, {
            message:
              "That email might be used with other login method. Try to login using your Google or Facebook account."
          });
        }
        // check password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect password" });
          }
        });
      })
      .catch(err => console.log(err));
  })
);
