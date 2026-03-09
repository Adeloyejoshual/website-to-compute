require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Cloudinary auto-config via CLOUDINARY_URL
// No need to call cloudinary.config if CLOUDINARY_URL is set in .env

app.post("/delete-image", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ error: "publicId is required" });

    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));