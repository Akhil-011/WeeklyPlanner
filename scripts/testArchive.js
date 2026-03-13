import { supabase } from '../src/lib/supabase';

(async () => {
  try {
    const { data, error } = await supabase
      .from('archived_weeks')
      .select('*')
      .limit(1);
    console.log('query result', { data, error });
  } catch (e) {
    console.error('unexpected', e);
  }
})();
