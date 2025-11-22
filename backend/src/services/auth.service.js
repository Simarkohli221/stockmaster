const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/token");

exports.register = async (data) => {
  const hashed = await hashPassword(data.password);

  const user = await User.create({
    email: data.email,
    password_hash: hashed,
    name: data.name,
    role: data.role,
    phone: data.phone,
  });

  return user;
};

exports.login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;

  const match = await comparePassword(password, user.password_hash);
  if (!match) return null;

  const token = generateToken(user);
  return { user, token };
};
