const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
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

async function test() {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      question_binary_id,
      question_text,
      concept:concepts (
        id,
        name,
        sub_topic:sub_topics (
          id,
          name,
          domain:domains (id, name)
        )
      )
    `);
  if (error) {
    console.error("Error:", error);
  } else {
    data.forEach((q, index) => {
      console.log(`[${index + 1}] ID: ${q.id}`);
      console.log(`    Binary ID: ${q.question_binary_id}`);
      console.log(`    Text snippet: "${q.question_text.substring(0, 80).replace(/\n/g, ' ')}"`);
      if (q.concept) {
        console.log(`    Concept: "${q.concept.name}" (ID: ${q.concept.id})`);
        if (q.concept.sub_topic) {
          console.log(`    Sub-Topic: "${q.concept.sub_topic.name}" (ID: ${q.concept.sub_topic.id})`);
          if (q.concept.sub_topic.domain) {
            console.log(`    Domain: "${q.concept.sub_topic.domain.name}" (ID: ${q.concept.sub_topic.domain.id})`);
          }
        }
      } else {
        console.log(`    Concept: NULL`);
      }
      console.log("-----------------------------------------");
    });
  }
}

test();
