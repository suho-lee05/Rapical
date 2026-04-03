const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "answer-templates route ready" });
});

module.exports = router;
