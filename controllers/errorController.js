const errorCont = {};

errorCont.triggerError = async function (req, res, next) {
  next(new Error("This is a simulated status 500 internal server error."));
};

module.exports = errorCont;