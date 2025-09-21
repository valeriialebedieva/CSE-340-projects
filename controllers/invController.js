const invModel = require("../models/inventory-model");
const utilities = require("../utilities/index");

const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = req.params.classificationId;
        const data = await invModel.getInventoryByClassificationId(
          classification_id
        );
        console.log("Data from invModel.getInventoryByClassificationId:", data);
    
       
        if (!data || data.length === 0) {
          return next({
            status: 404,
            message: "No vehicles found for the given classification.",
          });
        }
    
        const grid = await utilities.buildClassificationGrid(data);
        let nav = await utilities.getNav();
        const className = data[0].classification_name;
    
        res.render("layouts/layout", {
            title: `${className} Vehicles`,
          nav,
          body: grid,
        });
      } catch (error) {
        console.error("Error in buildByClassificationId:", error);
        next({
          status: error.status || 500,
          message: "Something went wrong while fetching classification data.",
        });
      }
    };


invCont.getInventoryById = async function (req, res, next) {
    try {
      const inventory_id = req.params.inventoryId;
      const data = await invModel.getInventoryById(inventory_id);
  
      if (!data) {
        return next({
          status: 404,
          message: "No inventory record found for the given ID.",
        });
      }
  
      const nav = await utilities.getNav();
      const vehicleHtml = utilities.buildVehicleHtml(data);
  
      res.render("layouts/layout", {
        title: `${data.inv_make} ${data.inv_model} (${data.inv_year})`,
        nav,
        body: vehicleHtml,
      });
    } catch (error) {
      console.error("Error in getInventoryById:", error);
      next({
        status: error.status || 500,
        message: "Something went wrong while fetching inventory data.",
      });
    }
  };

  invCont.renderManagementView = async function (req, res) {
    const nav = await utilities.getNav();
    const flashMessage = req.flash("info");
  
    res.render("layouts/layout", {
      title: "Inventory Management",
      nav,
      body: utilities.buildManagementView(flashMessage),
    });
  };
  
  invCont.renderAddClassificationView = async function (req, res) {
    const nav = await utilities.getNav();
    const flashMessage = req.flash("error");
    const formData = req.flash("formData")[0] || {}; // Retrieve stored form data
  
    res.render("layouts/layout", {
      title: "Add New Classification",
      nav,
      body: utilities.buildAddClassificationView(flashMessage, formData),
    });
  };
  
  invCont.addClassification = async function (req, res, next) {
    try {
      const newClassification = await invModel.addClassification(
        req.body.classification_name
      );
  
      if (newClassification) {
        req.flash("info", "Classification added successfully!");
        return res.redirect("/inv/management");
      } else {
        req.flash("error", "Failed to add classification.");
        return res.redirect("/inv/add-classification");
      }
    } catch (error) {
      console.error("Error in addClassification:", error);
      next({ status: 500, message: "Error adding classification." });
    }
  };
  

  invCont.renderAddInventoryView = async function (req, res) {
    const nav = await utilities.getNav();
    const flashMessage = req.flash("error");
    const formData = req.flash("formData")[0] || {}; // Retrieve stored form data
  
    res.render("layouts/layout", {
      title: "Add New Vehicle",
      nav,
      body: await utilities.buildAddInventoryView(flashMessage, formData),
    });
  };

  invCont.addInventoryItem = async function (req, res, next) {
    try {
      const itemData = req.body; // Capture form input values
      const newItem = await invModel.addInventoryItem(itemData);
  
      if (newItem) {
        req.flash("info", "Vehicle added successfully!");
        return res.redirect("/inv/management");
      } else {
        req.flash("error", "Failed to add vehicle.");
        return res.render("layouts/layout", {
          title: "Add New Vehicle",
          nav: await utilities.getNav(),
          body: await utilities.buildAddInventoryView(
            req.flash("error"),
            itemData
          ),
        });
      }
    } catch (error) {
      console.error("Error in addInventoryItem:", error);
      req.flash("error", "Error adding inventory item.");
      return res.render("layouts/layout", {
        title: "Add New Vehicle",
        nav: await utilities.getNav(),
        body: await utilities.buildAddInventoryView(req.flash("error"), req.body), // Preserve input
      });
    }
  };
  

module.exports = invCont;