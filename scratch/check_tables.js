const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^"'\s]+)["']?/);
    if (match) supabaseUrl = match[1];
    const keyMatch = line.match(/^\s*NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*["']?([^"'\s]+)["']?/);
    if (keyMatch) supabaseAnonKey = keyMatch[1];
  }
} catch (e) {
  console.error("Failed to read .env file:", e);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const tables = ['domains', 'sub_topics', 'concepts', 'questions', 'user_progress', 'question_attempts', 'learning_sessions', 'progress_tracking'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table "${t}": NOT ACCESSIBLE OR ERROR:`, error.message);
    } else {
      console.log(`Table "${t}": ACCESSIBLE AND OK`);
    }
  }
}

check();
