const crypto = require('crypto');

function generate20CharAlphanumericId(
  domainId,
  subTopicId,
  conceptId,
  questionId,
  seed = 0
) {
  const cleanDom = (domainId || 'quant').trim().toLowerCase();
  const cleanSub = (subTopicId || 'arithmetic').trim().toLowerCase();
  const cleanCon = (conceptId || 'percentages').trim().toLowerCase();
  const cleanQId = (questionId || '').trim();

  const input = `${cleanDom}:${cleanSub}:${cleanCon}:${cleanQId}:${seed}`;
  const hashBytes = crypto.createHash('md5').update(input).digest(); // 16 bytes

  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';

  // Extract first 10 characters from first 7 bytes (56 bits, bits 0-49)
  let val1 = 0n;
  for (let i = 0; i < 7; i++) {
    val1 = (val1 << 8n) | BigInt(hashBytes[i]);
  }
  for (let i = 0; i < 10; i++) {
    const charIdx = Number((val1 >> BigInt(45 - i * 5)) & 31n);
    result += alphabet[charIdx];
  }

  // Extract next 10 characters from next 7 bytes (56 bits, bits 0-49)
  let val2 = 0n;
  for (let i = 7; i < 14; i++) {
    val2 = (val2 << 8n) | BigInt(hashBytes[i]);
  }
  for (let i = 0; i < 10; i++) {
    const charIdx = Number((val2 >> BigInt(45 - i * 5)) & 31n);
    result += alphabet[charIdx];
  }

  // Format as XXXXX-XXXXX-XXXXX-XXXXX
  return `${result.slice(0, 5)}-${result.slice(5, 10)}-${result.slice(10, 15)}-${result.slice(15, 20)}`;
}

console.log("Generating sample 20-character secure IDs:");
console.log("Q1:", generate20CharAlphanumericId('quant', 'arithmetic', 'percentages', 'ca814fb9-cdca-4df6-bca5-a71c2a221315', 0));
console.log("Q2:", generate20CharAlphanumericId('gn', 'hj', 'nk', '7bf2aff7-0e44-438c-ba89-c7eff1ec6569', 0));
console.log("Q3:", generate20CharAlphanumericId('quant', 'algebra', 'quadratic-eq', '45c64195-63eb-44d1-8c14-ad1e95bc789d', 0));
