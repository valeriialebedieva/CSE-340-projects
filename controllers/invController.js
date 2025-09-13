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
    
        res.render("./inventory/classification", {
          title: className + " vehicles",
          nav,
          grid,
        });
      } catch (error) {
        console.error("Error in buildByClassificationId:", error);
        next({
          status: error.status || 500,
          message: "Something went wrong while fetching classification data.",
        });
      }
    };

module.exports = invCont;