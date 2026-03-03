import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gnbtfbpjwiopsrbacwmo.supabase.co';
const supabaseKey = 'sb_publishable_55O5IXARf9z96h31IIeTfA_xplRu0St';

export const supabase = createClient(supabaseUrl, supabaseKey);