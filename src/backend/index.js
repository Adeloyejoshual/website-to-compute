const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use("/products", productsRouter);

// Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));