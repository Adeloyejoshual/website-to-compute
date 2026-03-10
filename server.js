// server.js
import express from "express";
import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

// Initialize Express
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Allow your frontend domain

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Health check
app.get("/", (req, res) => res.send("Cloudinary server running"));

// Delete multiple images by publicIds
app.post("/delete-product-images", async (req, res) => {
  const { publicIds } = req.body;

  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return res.status(400).json({ error: "Invalid publicIds" });
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    console.log("Deleted images:", publicIds);
    res.status(200).json({ message: "Images deleted", result });
  } catch (err) {
    console.error("Cloudinary deletion error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete all images in a folder
app.post("/delete-folder", async (req, res) => {
  const { folder } = req.body;
  if (!folder) return res.status(400).json({ error: "Missing folder name" });

  try {
    const result = await cloudinary.api.delete_resources_by_prefix(folder + "/");
    console.log(`Deleted all images in folder: ${folder}`);
    res.status(200).json({ message: `Deleted all images in ${folder}`, result });
  } catch (err) {
    console.error("Cloudinary folder deletion error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cloudinary server running on port ${PORT}`));