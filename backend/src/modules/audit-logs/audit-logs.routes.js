const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "audit-logs route ready" });
});

module.exports = router;
