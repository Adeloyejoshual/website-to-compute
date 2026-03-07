import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "marketplace");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ insert product
    const { data: product, error } = await supabase
      .from("products")
      .insert([{ name, price: Number(price) }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    // 2️⃣ upload image
    const imageUrl = await uploadImage();

    // 3️⃣ save image
    await supabase.from("product_images").insert([
      {
        product_id: product.id,
        image_url: imageUrl,
        is_primary: true,
        position: 1,
      },
    ]);

    alert("Product added!");
  };

  return (
    <div>
      <h2>Add Product</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Product name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}