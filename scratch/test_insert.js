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

async function testInsert() {
  console.log("Starting save simulation...");
  try {
    const q = {
      id: 'Q-' + Math.floor(1000 + Math.random() * 9000),
      domainId: 'quant',
      subTopicId: 'arithmetic',
      conceptId: 'percentages',
      difficulty: 'MEDIUM',
      companyTags: ['Wipro'],
      questionStem: 'DUMMY TEST QUESTION: A vendor buys apples at 10 for $1. How many should he sell to gain profit?',
      options: [
        { id: 'A', text: '5 apples', isCorrect: true },
        { id: 'B', text: '10 apples', isCorrect: false }
      ],
      hintText: 'Use basic cost-profit calculations.',
      status: 'Published'
    };

    // 1. Resolve domain
    console.log("Resolving domain...");
    let domainIdUuid = '';
    const { data: existingDomains, error: domainSearchError } = await supabase
      .from('domains')
      .select('id')
      .eq('name', 'Quantitative Aptitude');
    if (domainSearchError) throw domainSearchError;
    if (existingDomains && existingDomains.length > 0) {
      domainIdUuid = existingDomains[0].id;
    }
    console.log("Domain UUID resolved:", domainIdUuid);

    // 2. Resolve subtopic
    console.log("Resolving sub-topic...");
    let subTopicIdUuid = '';
    const { data: existingSubTopics, error: subTopicSearchError } = await supabase
      .from('sub_topics')
      .select('id')
      .eq('domain_id', domainIdUuid)
      .eq('name', 'Arithmetic');
    if (subTopicSearchError) throw subTopicSearchError;
    if (existingSubTopics && existingSubTopics.length > 0) {
      subTopicIdUuid = existingSubTopics[0].id;
    }
    console.log("Sub-Topic UUID resolved:", subTopicIdUuid);

    // 3. Resolve concept
    console.log("Resolving concept...");
    let conceptIdUuid = '';
    const { data: existingConcepts, error: conceptSearchError } = await supabase
      .from('concepts')
      .select('id')
      .eq('sub_topic_id', subTopicIdUuid)
      .eq('name', 'Percentages');
    if (conceptSearchError) throw conceptSearchError;
    if (existingConcepts && existingConcepts.length > 0) {
      conceptIdUuid = existingConcepts[0].id;
    }
    console.log("Concept UUID resolved:", conceptIdUuid);

    // 4. Insert question
    console.log("Attempting to insert question...");
    const { data: newQuestionRow, error: questionInsertError } = await supabase
      .from('questions')
      .insert({
        concept_id: conceptIdUuid,
        type: 'MCQ',
        difficulty: q.difficulty,
        question_text: q.questionStem,
        options: q.options,
        correct_answer: '5 apples',
        explanation: q.hintText,
        is_active: true
      })
      .select('id, question_binary_id, question_hash_seed')
      .single();

    if (questionInsertError) {
      console.error("Database insert error:", questionInsertError);
    } else {
      console.log("Success! Inserted question details:", newQuestionRow);
    }
  } catch (err) {
    console.error("General error:", err);
  }
}

testInsert();
