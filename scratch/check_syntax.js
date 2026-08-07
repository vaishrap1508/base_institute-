const fs = require('fs');

const content = fs.readFileSync('src/components/PlacementProfile.tsx', 'utf8');

function countOccurrences(str, pat) {
  let count = 0;
  let pos = str.indexOf(pat);
  while (pos !== -1) {
    count++;
    pos = str.indexOf(pat, pos + pat.length);
  }
  return count;
}

console.log('{ count:', countOccurrences(content, '{'));
console.log('} count:', countOccurrences(content, '}'));
console.log('<section count:', countOccurrences(content, '<section'));
console.log('</section> count:', countOccurrences(content, '</section>'));
console.log('<div count:', countOccurrences(content, '<div'));
console.log('</div> count:', countOccurrences(content, '</div>'));
console.log('<motion.div count:', countOccurrences(content, '<motion.div'));
console.log('</motion.div> count:', countOccurrences(content, '</motion.div>'));
console.log('AnimatePresence count:', countOccurrences(content, 'AnimatePresence'));
