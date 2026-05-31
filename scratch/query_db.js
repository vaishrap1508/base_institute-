const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching questions...");
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, concept_id, question_text, created_at');
    
  if (error) {
    console.error("Error fetching questions:", error);
    return;
  }
  
  console.log(`Found ${questions.length} questions:`);
  questions.forEach(q => {
    console.log(`ID: ${q.id} | Concept ID: ${q.concept_id} | Created At: ${q.created_at} | Text: ${q.question_text.substring(0, 40)}`);
  });

  console.log("\nFetching concepts to see if they are empty...");
  const { data: concepts, error: cError } = await supabase
    .from('concepts')
    .select('id, name, sub_topic_id');
  if (cError) {
    console.error("Error fetching concepts:", cError);
  } else {
    console.log(`Found ${concepts.length} concepts.`);
  }
}

run();
