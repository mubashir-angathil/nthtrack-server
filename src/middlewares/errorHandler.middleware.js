const { formattedError } = require("../utils/helpers/helpers");

module.exports.errorHandler = (error, req, res, next) => {
  return res.status(error?.httpCode ?? 400).json(formattedError(error));
};
