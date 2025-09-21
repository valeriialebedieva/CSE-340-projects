const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");
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
  utilities.handleErrors(invController.renderManagementView)
);

router.get(
  "/add-classification",
  utilities.handleErrors(invController.renderAddClassificationView)
);

router.post(
  "/classification",
  validateClassification,
  handleValidationErrors,
  utilities.handleErrors(invController.addClassification)
);

router.get(
  "/add-inventory",
  utilities.handleErrors(invController.renderAddInventoryView)
);

router.post(
  "/add",
  validateInventory,
  handleValidationErrors,
  utilities.handleErrors(invController.addInventoryItem)
);

module.exports = router;