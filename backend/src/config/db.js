const path = require("path");

// Load .env from backend/.env (one folder UP from /src/)
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

// DEBUG: Show what dotenv loaded
console.log("ENV DEBUG:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_DIALECT: process.env.DB_DIALECT,
  DB_PORT: process.env.DB_PORT
});

const { Sequelize } = require("sequelize");

// Create Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME,          // database
  process.env.DB_USER,          // username
  process.env.DB_PASSWORD,      // password
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    port: Number(process.env.DB_PORT) || 3306,
    logging: false
  }
);

// Test DB connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("DB error:", err);
  }
}

testConnection();

module.exports = sequelize;
