const app = require("./app");
const env = require("./config/env");
const { canInitClient } = require("./config/supabase");

app.listen(env.port, () => {
  const dbStatus = canInitClient ? "configured" : "not configured";
  console.log(
    `[rapical-backend] server started on port ${env.port} (supabase: ${dbStatus})`,
  );
});
