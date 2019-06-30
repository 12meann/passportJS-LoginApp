const router = require("express").Router();
const passport = require("passport");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const async = require("async");
const nodemailer = require("nodemailer");

//forgot render
router.get("/", (req, res) => {
  res.render("forgot", { user: req.user });
});

// post forgot
router.post("/", (req, res, next) => {
  async.waterfall(
    [
      done => {
        crypto.randomBytes(20, (err, buf) => {
          let token = buf.toString("hex");
          done(err, token);
        });
      },
      (token, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (!user) {
            req.flash(
              "error_msg",
              "No account with that email address exists."
            );
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(err => {
            done(err, token, user);
          });
        });
      },

      (token, user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD
          }
        });
        const mailOptions = {
          to: user.email,
          from: process.env.GMAIL_EMAIL,
          subject: "Login App Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/forgot/reset/" +
            token +
            "\n\n" +
            "You only have one hour to reset your password. After an hour, your request will expire." +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n"
        };
        smtpTransport.sendMail(mailOptions, err => {
          req.flash(
            "success_msg",
            "An e-mail has been sent to " +
              user.email +
              " with further instructions."
          );

          done(err, "done");
        });
      }
    ],
    err => {
      if (err) return next(err);
      res.redirect("/forgot");
    }
  );
});

router.get("/reset/:token", (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    (err, user) => {
      if (!user) {
        req.flash(
          "error_msg",
          "Password reset token is invalid or has expired."
        );
        return res.redirect("/forgot");
      }
      res.render("reset", {
        user: req.user,
        token: req.params.token
      });
    }
  );
});

router.post("/reset/:token", (req, res) => {
  let errors = [];
  const { password, password2 } = req.body;
  async.waterfall(
    [
      done => {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          (err, user) => {
            if (err) throw err;
            if (!user) {
              req.flash(
                "error_msg",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("/forgot");
            }
            if (password !== password2) {
              req.flash("error_msg", "Passwords do not match.");
              return res.redirect("back");
              // errors.push({ msg: "Passwords doesn't match" });
            }
            if (password.length < 6) {
              req.flash(
                "error_msg",
                "Password should be at least 6 characters."
              );
              return res.redirect("back");
            }
            //hash password
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                // password is now hash
                user.password = hash;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(err => {
                  if (err) throw err;
                  req.logIn(user, err => {
                    if (err) throw err;
                    done(err, user);
                    req.flash(
                      "success_msg",
                      "Password has been reset and you are now logged in."
                    );
                    return res.redirect("/");
                  });
                });
              });
            });
          }
        );
      },

      (user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD
          }
        });
        const mailOptions = {
          to: user.email,
          from: process.env.GMAIL_EMAIL,
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n"
        };
        smtpTransport.sendMail(mailOptions, err => {
          req.flash("success_msg", "Success! Your password has been changed.");
          done(err);
        });
      }
    ],
    err => {
      res.redirect("/");
    }
  );
});

module.exports = router;
