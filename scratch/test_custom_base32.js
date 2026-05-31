function fnv1a32(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

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
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const blocks = [];

  for (let b = 1; b <= 4; b++) {
    const blockInput = `${input}:${b}`;
    const hash = fnv1a32(blockInput);
    let blockStr = '';
    for (let i = 0; i < 5; i++) {
      const shift = 20 - i * 5;
      const charIdx = (hash >>> shift) & 31;
      blockStr += alphabet[charIdx];
    }
    blocks.push(blockStr);
  }

  return blocks.join('-');
}

console.log("Generating sample 20-character FNV-1a Crockford Base32 secure IDs:");
console.log("Q1:", generate20CharAlphanumericId('quant', 'arithmetic', 'percentages', 'ca814fb9-cdca-4df6-bca5-a71c2a221315', 0));
console.log("Q2:", generate20CharAlphanumericId('gn', 'hj', 'nk', '7bf2aff7-0e44-438c-ba89-c7eff1ec6569', 0));
console.log("Q3:", generate20CharAlphanumericId('quant', 'algebra', 'quadratic-eq', '45c64195-63eb-44d1-8c14-ad1e95bc789d', 0));
