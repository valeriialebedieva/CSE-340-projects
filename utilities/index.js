const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
  });
  list += "</ul>";
  return list;
};

module.exports = Util;


/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildManagementView = function (flashMessage = "") {
    return `
      <div class="management-container">
        <h1>Inventory Management</h1>
        ${
          flashMessage
            ? `<div class="flash-message"><p>${flashMessage}</p></div>`
            : ""
        }
        <ul class="management-links">
          <li><a href="/inv/add-classification">Add New Classification</a></li>
          <li><a href="/inv/add-inventory">Add New Vehicle</a></li>
        </ul>
      </div>
    `;
  };
  
  /* ******************************
   * Build Classification Addition View
   ****************************** */
  Util.buildAddClassificationView = function (flashMessage = "") {
    return `
      <div class="form-container">
        <h1>Add a New Classification</h1>
        <p>Classification names cannot contain spaces or special characters.</p>
        ${
          flashMessage
            ? `<div class="flash-message"><p>${flashMessage}</p></div>`
            : ""
        }
        
        <form action="/inv/classification" method="POST">
          <label for="classification_name" class="login-label">Classification Name:</label>
          <input type="text" id="classification_name" name="classification_name" class="login-input" required pattern="^[a-zA-Z0-9]+$">
          <button type="submit" class="login-button">Add Classification</button>
        </form>
      </div>
    `;
  };
  
  /* ******************************
   * Build Inventory Addition View
   ****************************** */
  Util.buildAddInventoryView = async function (flashMessage = "", itemData = {}) {
    let classificationList = await Util.buildClassificationList(
      itemData.classification_id
    );
  
    return `
      <div class="form-container">
        <h1>Add a New Vehicle</h1>
        ${
          flashMessage.length > 0
            ? `<div class="flash-message"><ul>${flashMessage
                .map((msg) => `<li>${msg}</li>`)
                .join("")}</ul></div>`
            : ""
        }
        
        <form action="/inv/add" method="POST">
          <label for="classification_id" class="login-label">Vehicle Classification:</label>
          ${classificationList}
  
          <label for="inv_make" class="login-label">Make:</label>
          <input type="text" id="inv_make" name="inv_make" class="login-input" required value="${
            itemData.inv_make || ""
          }">
  
          <label for="inv_model" class="login-label">Model:</label>
          <input type="text" id="inv_model" name="inv_model" class="login-input" required value="${
            itemData.inv_model || ""
          }">
  
          <label for="inv_year" class="login-label">Year:</label>
          <input type="number" id="inv_year" name="inv_year" class="login-input" required min="1900" value="${
            itemData.inv_year || ""
          }">
  
          <label for="inv_price" class="login-label">Price:</label>
          <input type="number" id="inv_price" name="inv_price" class="login-input" required value="${
            itemData.inv_price || ""
          }">
  
          <label for="inv_miles" class="login-label">Miles:</label>
          <input type="number" id="inv_miles" name="inv_miles" class="login-input" required value="${
            itemData.inv_miles || ""
          }">
  
          <label for="inv_color" class="login-label">Color:</label>
          <input type="text" id="inv_color" name="inv_color" class="login-input" required value="${
            itemData.inv_color || ""
          }">
  
          <label for="inv_description" class="login-label">Description:</label>
          <textarea id="inv_description" name="inv_description" class="login-input" required>${
            itemData.inv_description || ""
          }</textarea>
  
          <label for="inv_image" class="login-label">Vehicle Image (URL):</label>
          <input type="text" id="inv_image" name="inv_image" class="login-input" required value="${
            itemData.inv_image || ""
          }">
  
          <label for="inv_thumbnail" class="login-label">Thumbnail Image (URL):</label>
          <input type="text" id="inv_thumbnail" name="inv_thumbnail" class="login-input" required value="${
            itemData.inv_thumbnail || ""
          }">
  
          <button type="submit" class="login-button">Add Vehicle</button>
        </form>
      </div>
    `;
  };
  
  /* ******************************
   * Build Classification Dropdown List
   ****************************** */
  Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications();
    let classificationList = `<select name="classification_id" id="classificationList" class="login-input" required>`;
    classificationList += `<option value="">Choose a Classification</option>`;
  
    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}" ${
        classification_id && row.classification_id == classification_id
          ? "selected"
          : ""
      }>${row.classification_name}</option>`;
    });
  
    classificationList += "</select>";
    return classificationList;
  };

  
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
         const imageSrc = vehicle.inv_image.startsWith('/images/vehicles/')
           ? vehicle.inv_image
           : '/images/vehicles/' + vehicle.inv_image.replace('/images/', '');
         grid += `<li>
         <a href="/inv/detail/${vehicle.inv_id}" title="View ${
         vehicle.inv_make
       } ${vehicle.inv_model} details">
           <img src="${imageSrc}" alt="Image of ${vehicle.inv_make} ${
         vehicle.inv_model
       }" />
         </a>
        <div class="namePrice">
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${
        vehicle.inv_make
      } ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(
            vehicle.inv_price
          )}</span>
        </div>
      </li>`;
        });
        grid+="</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.buildVehicleHtml = (vehicle) => {
    const imageSrc = vehicle.inv_image.startsWith('/images/vehicles/')
      ? vehicle.inv_image
      : '/images/vehicles/' + vehicle.inv_image.replace('/images/', '');
    return `
      <div class="vehicle-detail">
        <img src="${imageSrc}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="vehicle-info">
          <p><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(
            vehicle.inv_price
          )}</p>
          <p><strong>Miles:</strong> ${new Intl.NumberFormat("en-US").format(
            vehicle.inv_miles
          )}</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        </div>
      </div>`;
  };
  

Util.handleErrors = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);