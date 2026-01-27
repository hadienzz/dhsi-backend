import { createClient } from "@supabase/supabase-js";
import { envConfig } from "../config/load-env";

if (!envConfig.SUPABASE_URL || !envConfig.SUPABASE_ANON_KEY) {
  throw new Error("Supabase environment variables are not set");
}

const supabaseClient = createClient(
  envConfig.SUPABASE_URL,
  envConfig.SUPABASE_ANON_KEY,
);

export default supabaseClient;
