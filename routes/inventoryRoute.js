const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");
const {
    verifyLoggedIn,
    restrictedAccess,
  } = require("../utilities/authMiddleware");
const {
  validateInventory,
  validateClassification,
  handleValidationErrors,
} = require("../utilities/validation");

router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
  );

router.get(
  "/detail/:inventoryId",
  utilities.handleErrors(invController.getInventoryById)
);

router.get(
  "/management",
  verifyLoggedIn, 
  restrictedAccess,
  utilities.handleErrors(invController.renderManagementView)
);

router.get(
  "/add-classification",
  verifyLoggedIn, 
  restrictedAccess,
  utilities.handleErrors(invController.renderAddClassificationView)
);

router.post(
  "/classification",
  verifyLoggedIn, 
  restrictedAccess,
  validateClassification,
  handleValidationErrors,
  utilities.handleErrors(invController.addClassification)
);

router.get(
  "/add-inventory",
  verifyLoggedIn, 
  restrictedAccess,
  utilities.handleErrors(invController.renderAddInventoryView)
);

router.post(
  "/add",
  verifyLoggedIn, 
  restrictedAccess,
  validateInventory,
  handleValidationErrors,
  utilities.handleErrors(invController.addInventoryItem)
);

module.exports = router;