import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'association-files';

let supabase = null;
let supabaseEnabled = false;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Variables d\'environnement Supabase manquantes. Le stockage cloud ne fonctionnera pas.');
  console.warn('⚠️  Définissez SUPABASE_URL et SUPABASE_SECRET_KEY pour activer le stockage cloud.');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
  supabaseEnabled = true;
}

export { supabase, supabaseBucket, supabaseEnabled };
