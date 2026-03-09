// server.js
import express from "express";
import cloudinary from "cloudinary";
import cors from "cors";

// Configure Cloudinary with your VITE environment variables
cloudinary.v2.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // support JSON body with base64 images

// -----------------------------
// Upload image
// -----------------------------
app.post("/api/uploadImage", async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ error: "No image provided" });

    const result = await cloudinary.v2.uploader.upload(base64, {
      folder: "products",
    });

    res.status(200).json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Delete image
// -----------------------------
app.post("/api/deleteImage", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ error: "No publicId provided" });

    const result = await cloudinary.v2.uploader.destroy(publicId);
    res.status(200).json({ result });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});