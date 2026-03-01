export default function SearchFilter({ setSearch }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Search products..."
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
        }}
      />
    </div>
  )
}