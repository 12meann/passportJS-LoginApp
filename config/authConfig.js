module.exports = {
  authCheck: (req, res, next) => {
    if (!req.user) {
      req.flash("error_msg", "Please log in to view your profile.");
      res.redirect("/auth/login");
    } else {
      next();
    }
  }
};
