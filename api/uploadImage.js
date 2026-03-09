// /api/uploadImage.js
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const data = await req.json();
    const fileBase64 = data.base64; // we'll send base64 string from client
    const result = await cloudinary.v2.uploader.upload(fileBase64, {
      folder: "products",
    });
    return new Response(JSON.stringify({ url: result.secure_url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}