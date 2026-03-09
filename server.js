require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Cloudinary config (CLOUDINARY_URL handles this automatically)
app.post("/delete-product-images", async (req, res) => {  // ✅ Match frontend URL
  try {
    const { publicIds } = req.body;  // ✅ Array from frontend
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({ error: "publicIds array required" });
    }

    // ✅ Use api.delete_resources for MULTIPLE images
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: "image"
    });
    
    console.log("Cloudinary delete result:", result);
    res.json({ 
      success: true, 
      deleted_count: result.deleted_count || 0,
      result 
    });
  } catch (err) {
    console.error("Cloudinary error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));