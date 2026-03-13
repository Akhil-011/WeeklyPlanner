import { createClient } from '@supabase/supabase-js';

// environment variables must be supplied when running this script
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  console.log('running query to archived_weeks');
  const { data, error } = await supabase
    .from('archived_weeks')
    .select('*')
    .limit(1);
  console.log({ data, error });
})();
