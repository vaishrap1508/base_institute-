function fnv1a32(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function generateMixedAlphanumericId(
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
  const letterAlphabet = 'ABCDEFGHJKMNPQRT'; // Exactly 16 letters (4 bits)
  const blocks = [];

  for (let b = 1; b <= 4; b++) {
    const blockInput = `${b}:${input}`;
    const hash = fnv1a32(blockInput);
    
    // Extract 4 binary digits (4 bits)
    let binaryPart = '';
    binaryPart += ((hash >>> 16) & 1).toString();
    binaryPart += ((hash >>> 17) & 1).toString();
    binaryPart += ((hash >>> 18) & 1).toString();
    binaryPart += ((hash >>> 19) & 1).toString();
    
    // Extract 1 letter (4 bits)
    const letterIdx = (hash >>> 20) & 15;
    const letterPart = letterAlphabet[letterIdx];
    
    blocks.push(binaryPart + letterPart);
  }

  return blocks.join('-');
}

console.log("Generating sample mixed binary-letter 20-character secure IDs:");
console.log("Q1:", generateMixedAlphanumericId('quant', 'arithmetic', 'percentages', 'ca814fb9-cdca-4df6-bca5-a71c2a221315', 0));
console.log("Q2:", generateMixedAlphanumericId('gn', 'hj', 'nk', '7bf2aff7-0e44-438c-ba89-c7eff1ec6569', 0));
console.log("Q3:", generateMixedAlphanumericId('quant', 'algebra', 'quadratic-eq', '45c64195-63eb-44d1-8c14-ad1e95bc789d', 0));
