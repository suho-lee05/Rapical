const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

const canInitClient =
  Boolean(env.supabase.url) &&
  (Boolean(env.supabase.serviceRoleKey) || Boolean(env.supabase.anonKey));

const key = env.supabase.serviceRoleKey || env.supabase.anonKey;

const supabase = canInitClient ? createClient(env.supabase.url, key) : null;

module.exports = {
  supabase,
  canInitClient,
};
