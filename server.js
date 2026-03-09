
// COMPLETE SERVER CODE - Deploy this to fix Cloudinary deletion
require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());  // ✅ Allow frontend requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cloudinary config (auto from CLOUDINARY_URL)
console.log("✅ Cloudinary configured");

// ✅ ENDPOINT 1: Multiple images (for Settings page)
app.post("/delete-product-images", async (req, res) => {
  console.log("📥 Delete request:", req.body);
  
  try {
    const { publicIds } = req.body;
    
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      console.log("❌ No publicIds provided");
      return res.status(400).json({ error: "publicIds array required" });
    }

    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: "image"
    });
    
    console.log("✅ Cloudinary deleted:", result);
    res.json({ 
      success: true, 
      deleted_count: result.deleted_count || 0,
      result 
    });
  } catch (err) {
    console.error("❌ Cloudinary ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ENDPOINT 2: Single image (keep your original)
app.post("/delete-image", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ error: "publicId is required" });

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("✅ Single image deleted:", result);
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Server running ✅", endpoints: ["/delete-product-images", "/delete-image"] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Endpoints: POST /delete-product-images, POST /delete-image`);
});