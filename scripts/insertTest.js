import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  const sample = {
    week_data: { test: true }
  };
  const { data, error } = await supabase
    .from('archived_weeks')
    .insert(sample)
    .select()
    .single();
  console.log({ data, error });
})();
