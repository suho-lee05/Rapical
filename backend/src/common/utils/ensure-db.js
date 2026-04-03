const { canInitClient } = require("../../config/supabase");

function ensureDb(res) {
  if (canInitClient) return true;

  res.status(503).json({
    success: false,
    message: "Supabase is not configured. Please set SUPABASE_URL and key.",
  });

  return false;
}

module.exports = ensureDb;
