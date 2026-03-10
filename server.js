// server.js
import express from "express";
import { v2 as cloudinary } from "cloudinary";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Delete specific images by public_id
app.post("/delete-product-images", async (req, res) => {
  const { publicIds } = req.body;
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all images in a folder (per-product folder)
app.post("/delete-folder", async (req, res) => {
  const { folder } = req.body;
  try {
    const result = await cloudinary.api.delete_resources_by_prefix(folder + "/");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Cloudinary server running"));