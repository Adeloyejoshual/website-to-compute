import express from "express";
import { v2 as cloudinary } from "cloudinary";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Supabase client (server-side)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Delete a product + all its images
app.post("/delete-product", async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId is required" });

  try {
    // Delete all images in product folder
    const cloudRes = await cloudinary.api.delete_resources_by_prefix(
      `chatImages/${productId}/`,
      { invalidate: true }
    );

    console.log("Cloudinary deletion result:", cloudRes);

    // Delete images from Supabase
    await supabase.from("product_images").delete().eq("product_id", productId);

    // Delete product from Supabase
    await supabase.from("products").delete().eq("id", productId);

    res.json({ message: "✅ Product and all images fully deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));