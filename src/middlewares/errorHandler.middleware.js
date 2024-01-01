const { httpStatusCode } = require("../utils/constants/Constants");
const { formattedError } = require("../utils/helpers/helpers");

module.exports.errorHandler = (error, req, res, next) => {
  return res
    .status(error?.httpCode ?? httpStatusCode.BAD_REQUEST)
    .json(formattedError(error));
};
