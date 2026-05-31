function fnv1a32(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function fnv1a16(str) {
  const hash32 = fnv1a32(str);
  return ((hash32 >>> 16) ^ (hash32 & 0xffff)) & 0xffff;
}

function intToBinary16(val) {
  const binary = (val & 0xffff).toString(2).padStart(16, '0');
  return `${binary.slice(0, 4)}-${binary.slice(4, 8)}-${binary.slice(8, 12)}-${binary.slice(12, 16)}`;
}

// database inputs are UUIDs:
// Domain UUID: a10c25d3-f47b-4abd-a43a-0c67dad012e7
// Sub-Topic UUID: 014cc43f-c504-4811-9eb0-ef4c0c840653
// Concept UUID: 46cd39d3-b9fa-4491-936d-b423612e457a
// Question UUID: 7bf2aff7-0e44-438c-ba89-c7eff1ec6569
// Seed: 0
const input = 'a10c25d3-f47b-4abd-a43a-0c67dad012e7:014cc43f-c504-4811-9eb0-ef4c0c840653:46cd39d3-b9fa-4491-936d-b423612e457a:7bf2aff7-0e44-438c-ba89-c7eff1ec6569:0';
const hash = fnv1a16(input);
const binId = intToBinary16(hash);

console.log("Input string (UUIDs):", input);
console.log("XOR folded 16-bit hash:", hash);
console.log("Generated Binary ID:", binId);
console.log("DB stored Binary ID:  0111-1100-1111-1110");
console.log("Do they match?", binId === '0111-1100-1111-1110');
