const express = require("express");
const router = express.Router();
const utilities = require("../utilities/index");
const { verifyLoggedIn } = require("../utilities/authMiddleware");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const loginValidate = require("../utilities/login-validation");

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);
router.post(
    "/login",
    loginValidate.loginRules(),
    loginValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  );

  router.get(
    "/management",
    verifyLoggedIn, 
    utilities.handleErrors(accountController.buildManagement)
  );
  
  router.get(
    "/update/:id",
    verifyLoggedIn, 
    utilities.handleErrors(accountController.buildAccountUpdateView)
  );

  router.post(
    "/update/:id",
    verifyLoggedIn, 
    regValidate.updateRules(),
    utilities.handleErrors(accountController.updateAccount)
  );
  
  router.post(
    "/update-password/:id",
    verifyLoggedIn, 
    regValidate.checkPasswordStrength,
    utilities.handleErrors(accountController.updatePassword)
  );
  
  router.get("/logout", utilities.handleErrors(accountController.logout));
  
  module.exports = router;