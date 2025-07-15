const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const signToken = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, name: user.name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { id: user._id, name: user.name },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user);

  // Lưu vào database refresh token
  await User.findByIdAndUpdate(
    user._id,
    { refreshToken: token.refresh_token },
    { new: true }
  );

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Trình duyệt không thể truy cập hoặc sửa đổi cookie theo bất kỳ cách nào
    secure: false,
    sameSite: "None",
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("refreshToken", token.refresh_token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

const verifyToken = async (token) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return payload;
};

const verifyFacebookToken = async (accessToken) => {
  const response = await axios.get(
    `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`
  );
  return response.data;
};

const findUser = (email, select = "") => {
  if (select) return User.findOne({ email }).select(select);
  return User.findOne({ email });
};

const findUserByFBId = async (id, select = "") => {
  if (select) return await User.findOne({ facebookId: id }).select(select);
  return await User.findOne({ facebookId: id });
};

const findUserById = async (userId) => {
  return await User.findById(userId).populate({
    path: "role",
    select: "name isActive permission",
    populate: {
      path: "permission",
      model: "Permission",
      select: "name",
    },
  });
};

const updateOne = async (userId, payload, isValidate = false) => {
  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: isValidate ? true : false,
  });

  return user;
};

const getUserInfo = async (userId) => {
  return await User.findById(userId);
};

module.exports = {
  signToken,
  createSendToken,
  verifyToken,
  findUser,
  findUserById,
  updateOne,
  getUserInfo,
  verifyFacebookToken,
  findUserByFBId,
};
