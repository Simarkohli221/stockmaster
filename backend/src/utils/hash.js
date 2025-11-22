const bcrypt = require("bcrypt");

exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

exports.comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};
