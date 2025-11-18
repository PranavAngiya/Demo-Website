const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in environment variables');
  process.exit(1);
}

// Initialize Supabase client with service key (backend only)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('✅ Supabase client initialized');

module.exports = { supabase };
