const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const sequelize = require("./config/db");

const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/categories", require("./routes/category.routes"));

// DO NOT AUTHENTICATE HERE AGAIN
// sequelize.authenticate() is already called inside db.js

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
