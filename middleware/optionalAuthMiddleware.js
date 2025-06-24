const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");

const optionalAuth = async (req, res, next) => {
  let token;
  // req.user = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next();
  }
  try {
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    const currentUser = await userService.findUserById(decoded.id);

    if (!currentUser || currentUser.changePasswordAfter(decoded.iat)) {
      return next();
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next();
  }
};

module.exports = optionalAuth;
