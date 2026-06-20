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

async function dump() {
  console.log("=== DOMAINS ===");
  const { data: domains } = await supabase.from('domains').select('*');
  console.log(JSON.stringify(domains, null, 2));

  console.log("=== SUB-TOPICS ===");
  const { data: subtopics } = await supabase.from('sub_topics').select('*');
  console.log(JSON.stringify(subtopics, null, 2));

  console.log("=== CONCEPTS ===");
  const { data: concepts } = await supabase.from('concepts').select('*');
  console.log(JSON.stringify(concepts, null, 2));
}

dump();
