const jwt = require("jsonwebtoken");

function verifyLoggedIn(req, res, next) {
  try {
    if (!req.cookies.jwt) {
      req.flash("error", "Please log in to access this page.");
      return res.redirect("/account/login");
    }

    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("error", "Session expired. Please log in again.");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }

        res.locals.accountData = accountData; // Make user data accessible in views
        next(); // Proceed to the requested route
      }
    );
  } catch (error) {
    console.error("Authorization error:", error);
    req.flash("error", "Unexpected error occurred.");
    return res.redirect("/account/login");
  }
}

function restrictedAccess(req, res, next) {
  try {
    if (!req.cookies.jwt) {
      req.flash("error", "Please log in to access this page.");
      return res.redirect("/account/login");
    }

    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("error", "Session expired. Please log in again.");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }

        if (
          accountData.account_type !== "Employee" &&
          accountData.account_type !== "Admin"
        ) {
          req.flash("error", "Access denied. Insufficient permissions.");
          return res.redirect("/account/login");
        }

        res.locals.accountData = accountData;
        next();
      }
    );
  } catch (error) {
    console.error("Authorization error:", error);
    req.flash("error", "Unexpected error occurred.");
    return res.redirect("/account/login");
  }
}

module.exports = { verifyLoggedIn, restrictedAccess };