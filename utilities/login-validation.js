const { body, validationResult } = require("express-validator");
const validate = {};

validate.loginRules = () => {
  return [
    
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

   
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email, 
    });
    return;
  }
  next();
};

module.exports = validate;