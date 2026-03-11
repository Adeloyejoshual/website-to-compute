const express = require("express");
const router = express.Router();

// Example admin route
router.get("/dashboard", (req, res) => {
  res.json({ message: "Admin dashboard working" });
});

module.exports = router;