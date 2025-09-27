const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

async function buildManagement(req, res, next) {
    let nav = await utilities.getNav();
  
    if (!req.cookies.jwt) {
      req.flash("error", "Please log in to access account management.");
      return res.redirect("/account/login");
    }
  
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, accountData) => {
        if (err) {
          req.flash("error", "Session expired. Please log in again.");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
  
        const fullAccountData = await accountModel.getAccountById(
          accountData.account_id
        );
  
        res.render("account/account", {
          title: "Account Management",
          nav,
          accountData: fullAccountData, 
        });
      }
    );
  }
  
  async function buildAccountUpdateView(req, res, next) {
    let nav = await utilities.getNav();
    const account_id = req.params.id;
    const accountData = await accountModel.getAccountById(account_id);
    let errors = req.flash("error"); // Fetch error messages
  
    if (!accountData) {
      req.flash("error", "Account not found.");
      return res.redirect("/account/management");
    }
  
    res.render("account/update", {
      title: "Update Account",
      nav,
      accountData,
      errors,
    });
  }
  
  async function updateAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_id, account_firstname, account_lastname, account_email } =
      req.body;
  
    const updateSuccess = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
  
    if (updateSuccess) {
      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account/management");
    } else {
      req.flash("error", "Failed to update account information.");
      return res.status(500).render("account/update", {
        title: "Update Account",
        nav,
        accountData: {
          account_id,
          account_firstname,
          account_lastname,
          account_email,
        },
      });
    }
  }
  

  async function updatePassword(req, res) {
    let nav = await utilities.getNav();
    const { account_id, account_password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(account_password, 10);
      const updateSuccess = await accountModel.updatePassword(
        account_id,
        hashedPassword
      );
  
      if (updateSuccess) {
        req.flash("notice", "Password updated successfully.");
        return res.redirect("/account/management");
      } else {
        req.flash("error", "Failed to update password.");
        return res.status(500).render("account/update", {
          title: "Update Account",
          nav,
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      req.flash("error", "Unexpected error updating password.");
      return res.status(500).redirect("/account/update/" + account_id);
    }
  }

async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    return res
      .status(500)
      .render("account/register", { title: "Registration", nav, errors: null });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
    res.status(201).redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}
async function accountLogin(req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);
  
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  
    try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password;
        const accessToken = jwt.sign(
          accountData,
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1h" }
        );
  
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 3600 * 1000,
        });
  
        return res.redirect("/account/management");
      } else {
        req.flash("notice", "Please check your credentials and try again.");
        return res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          account_email,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      req.flash("error", "Unexpected error occurred.");
      return res.redirect("/account/login");
    }
  }
  
  async function logout(req, res) {
    res.clearCookie("jwt"); 
    req.flash("notice", "You have been logged out successfully.");
    res.redirect("/account/login"); 
  }
  
module.exports = {
        buildLogin,
        buildRegister,
        buildManagement,
        buildAccountUpdateView,
        updateAccount,
        updatePassword,
        registerAccount,
        accountLogin,
        logout,
      };