/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/index");
const errorRoute = require("./routes/errorRoute"); 
const pool = require("./database/");

/* ***********************
 * View Engine 
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts);
app.set("layout", "./layouts/layout")

/* ***********************
 * Static Files - Must be before routes
 *************************/
app.use(express.static("public"));

app.use((req, res, next) => {
  if (req.url.startsWith('/images/') || req.url.startsWith('/css/') || req.url.startsWith('/js/')) {
    console.log(`Static file request: ${req.url}`);
  }
  next();
});

/* ***********************
 * Routes
 *************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.use(flash());

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(utilities.checkJWTToken);

app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", utilities.handleErrors(inventoryRoute));
app.use("/account", require("./routes/accountRoute"));
app.use("/error", utilities.handleErrors(errorRoute));

// Test route for debugging static files
app.get("/test-images", (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  let fileList = '<h1>File Structure Debug</h1>';
  
  try {
    const publicDir = path.join(__dirname, 'public');
    const imagesDir = path.join(publicDir, 'images');
    const vehiclesDir = path.join(imagesDir, 'vehicles');
    
    fileList += `<p>Public directory exists: ${fs.existsSync(publicDir)}</p>`;
    fileList += `<p>Images directory exists: ${fs.existsSync(imagesDir)}</p>`;
    fileList += `<p>Vehicles directory exists: ${fs.existsSync(vehiclesDir)}</p>`;
    
    if (fs.existsSync(vehiclesDir)) {
      const files = fs.readdirSync(vehiclesDir);
      fileList += `<p>Files in vehicles directory: ${files.join(', ')}</p>`;
    }
    
    fileList += `
      <h2>Image Test</h2>
      <p>Testing if images load:</p>
      <img src="/images/vehicles/delorean.jpg" alt="Delorean" style="width: 200px;">
      <img src="/images/vehicles/batmobile.jpg" alt="Batmobile" style="width: 200px;">
      <img src="/images/upgrades/flux-cap.png" alt="Flux Capacitor" style="width: 200px;">
    `;
  } catch (error) {
    fileList += `<p>Error: ${error.message}</p>`;
  }
  
  res.send(fileList);
});

app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "Oops! It looks like this page went on an adventure. 🏔️",
  });
});


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at "${req.originalUrl}": ${err.message}`);

  res.locals.error = err.message || "Oh no! Something went wrong.";

  res.render("errors/error", {
    title: err.status || "Server Error",
    message: res.locals.error,
    nav,
  });
});

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
