import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

export default function App() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [imageUrl, setImageUrl] = useState("")

  // Fetch users (Supabase test)
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*")
      if (error) setError(error.message)
      else setUsers(data)
    }
    fetchUsers()
  }, [])

  // Upload image to Cloudinary
  const uploadImage = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    )

    const data = await res.json()
    setImageUrl(data.secure_url)
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Marketplace Starter</h1>

      <h2>Users:</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <pre>{JSON.stringify(users, null, 2)}</pre>

      <h2>Upload Product Image:</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadImage}>Upload</button>

      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" width={200} />
        </div>
      )}
    </div>
  )
}