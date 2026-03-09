// server.js
import express from "express";
import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

// Initialize Express
const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors()); // Allow your frontend domain if needed

// Cloudinary config - use environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Health check
app.get("/", (req, res) => res.send("Cloudinary server running"));

// Delete multiple product images
app.post("/delete-product-images", async (req, res) => {
  const { publicIds } = req.body;

  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return res.status(400).json({ error: "Invalid publicIds" });
  }

  try {
    // Delete images from Cloudinary
    const result = await cloudinary.api.delete_resources(publicIds);
    console.log("Deleted images:", publicIds);
    res.status(200).json({ message: "Images deleted", result });
  } catch (err) {
    console.error("Cloudinary deletion error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Optional: Delete a single image
app.post("/delete-single-image", async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) return res.status(400).json({ error: "Missing publicId" });

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted single image:", publicId);
    res.status(200).json({ message: "Image deleted", result });
  } catch (err) {
    console.error("Cloudinary deletion error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cloudinary server running on port ${PORT}`);
});