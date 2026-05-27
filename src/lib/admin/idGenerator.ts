import { DOMAINS_DATA } from './store';
import { Domain } from './types';

/**
 * Deterministically computes FNV-1a 32-bit hash for a string
 * using ES6 Math.imul to guarantee standard unsigned 32-bit overflow
 * identical to PostgreSQL/PLpgSQL execution.
 */
export function fnv1a32(str: string): number {
  let hash = 2166136261; // FNV-1a offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV-1a prime
  }
  return hash >>> 0;
}

// Helper: 2-bit binary string representation
function intToBinary2(val: number): string {
  const v = Math.abs(val) % 4;
  return ((v >> 1) & 1).toString() + (v & 1).toString();
}

// Helper: Crockford's letter mapping
function getAlphabetLetter(val: number): string {
  const alphabet = 'ABCDEFGHJKMNPQRT'; // Exactly 16 letters (4 bits)
  return alphabet[Math.abs(val) % 16];
}

/**
 * Generates the deterministic 20-character secure mixed binary-letter ID
 * matching the database trigger behavior exactly.
 * Output format: BBBB[Letter]-BBBB[Letter]-BBBB[Letter]-BBBB[Letter]
 * e.g., 0001A-0001A-0001A-0000A
 */
export function generate20CharAlphanumericId(
  domainId: string,
  subTopicId: string,
  conceptId: string,
  questionId: string,
  seed: number = 0,
  domainsList?: Domain[],
  allQuestions?: any[]
): string {
  // If the questionId is already a valid visual ID (length 27: BB[Letter]BB[Letter]-BB[Letter]BB[Letter]-BB[Letter]BB[Letter]-BB[Letter]BB[Letter]),
  // then it is already generated and we don't need to recalculate it.
  const isAlreadyVisual = /^[01]{2}[A-HJKMNPQRT][01]{2}D-[01]{2}[A-HJKMNPQRT][01]{2}S-[01]{2}[A-HJKMNPQRT][01]{2}C-[01]{2}[A-HJKMNPQRT][01]{2}Q$/.test(questionId);
  if (isAlreadyVisual) {
    return questionId;
  }

  const domains = domainsList || DOMAINS_DATA;

  // 1. Calculate Domain Index (1-based, with fixed permanent default mappings)
  let domainIdx = 1;
  const cleanDom = domainId.toLowerCase().trim();
  if (cleanDom === 'quant' || cleanDom === 'quantitative aptitude') {
    domainIdx = 1;
  } else if (cleanDom === 'logical' || cleanDom === 'logical reasoning') {
    domainIdx = 2;
  } else if (cleanDom === 'verbal' || cleanDom === 'verbal ability') {
    domainIdx = 3;
  } else {
    // For custom domains, find its index in the domains list, ignoring the default ones
    const customDomains = domains.filter(d => 
      !['quant', 'logical', 'verbal'].includes(d.id) &&
      !['quantitative aptitude', 'logical reasoning', 'verbal ability'].includes(d.name.toLowerCase())
    );
    const foundCustomIdx = customDomains.findIndex(d => d.id === domainId || d.name.toLowerCase() === domainId.toLowerCase());
    domainIdx = foundCustomIdx !== -1 ? foundCustomIdx + 4 : customDomains.length + 4;
  }

  // 2. Calculate Sub-topic Index (1-based, with fixed domain-scoped mappings)
  const domainObj = domains.find(d => d.id === domainId || d.name.toLowerCase() === domainId.toLowerCase());
  const subTopics = domainObj ? domainObj.subTopics : [];
  let subtopicIdx = 1;
  const cleanSub = subTopicId.toLowerCase().trim();
  const cleanDomForSub = domainId.toLowerCase().trim();

  if (cleanDomForSub === 'quant' || cleanDomForSub === 'quantitative aptitude') {
    if (cleanSub === 'arithmetic') subtopicIdx = 1;
    else if (cleanSub === 'algebra') subtopicIdx = 2;
    else if (cleanSub === 'geometry' || cleanSub === 'geometry & mensuration') subtopicIdx = 3;
    else {
      const customSubs = subTopics.filter(s => !['arithmetic', 'algebra', 'geometry', 'geometry & mensuration'].includes(s.id));
      const foundIdx = customSubs.findIndex(s => s.id === subTopicId || s.name.toLowerCase() === subTopicId.toLowerCase());
      subtopicIdx = foundIdx !== -1 ? foundIdx + 4 : customSubs.length + 4;
    }
  } else if (cleanDomForSub === 'logical' || cleanDomForSub === 'logical reasoning') {
    if (cleanSub === 'arrangements') subtopicIdx = 1;
    else if (cleanSub === 'syllogisms') subtopicIdx = 2;
    else {
      const customSubs = subTopics.filter(s => !['arrangements', 'syllogisms'].includes(s.id));
      const foundIdx = customSubs.findIndex(s => s.id === subTopicId || s.name.toLowerCase() === subTopicId.toLowerCase());
      subtopicIdx = foundIdx !== -1 ? foundIdx + 3 : customSubs.length + 3;
    }
  } else if (cleanDomForSub === 'verbal' || cleanDomForSub === 'verbal ability') {
    if (cleanSub === 'grammar' || cleanSub === 'grammar & usage') subtopicIdx = 1;
    else if (cleanSub === 'comprehension' || cleanSub === 'reading comprehension') subtopicIdx = 2;
    else {
      const customSubs = subTopics.filter(s => !['grammar', 'grammar & usage', 'comprehension', 'reading comprehension'].includes(s.id));
      const foundIdx = customSubs.findIndex(s => s.id === subTopicId || s.name.toLowerCase() === subTopicId.toLowerCase());
      subtopicIdx = foundIdx !== -1 ? foundIdx + 3 : customSubs.length + 3;
    }
  } else {
    // Custom domain
    const foundIdx = subTopics.findIndex(s => s.id === subTopicId || s.name.toLowerCase() === subTopicId.toLowerCase());
    subtopicIdx = foundIdx !== -1 ? foundIdx + 1 : subTopics.length + 1;
  }

  // 3. Calculate Concept Index (1-based, with fixed subtopic-scoped mappings)
  const subTopicObj = subTopics.find(s => s.id === subTopicId || s.name.toLowerCase() === subTopicId.toLowerCase());
  const concepts = subTopicObj ? subTopicObj.concepts : [];
  let conceptIdx = 1;
  const cleanCon = conceptId.toLowerCase().trim();
  const cleanSubForCon = subTopicId.toLowerCase().trim();

  if (cleanSubForCon === 'arithmetic') {
    if (cleanCon === 'percentages') conceptIdx = 1;
    else if (cleanCon === 'profit-loss' || cleanCon === 'profit & loss') conceptIdx = 2;
    else if (cleanCon === 'ratios' || cleanCon === 'ratios & proportions') conceptIdx = 3;
    else if (cleanCon === 'simple-interest' || cleanCon === 'simple & compound interest') conceptIdx = 4;
    else if (cleanCon === 'time-work' || cleanCon === 'time & work') conceptIdx = 5;
    else if (cleanCon === 'time-speed' || cleanCon === 'time, speed & distance') conceptIdx = 6;
    else {
      const customCons = concepts.filter(c => !['percentages', 'profit-loss', 'profit & loss', 'ratios', 'ratios & proportions', 'simple-interest', 'simple & compound interest', 'time-work', 'time & work', 'time-speed', 'time, speed & distance'].includes(c.id));
      const foundIdx = customCons.findIndex(c => c.id === conceptId || c.name.toLowerCase() === conceptId.toLowerCase());
      conceptIdx = foundIdx !== -1 ? foundIdx + 7 : customCons.length + 7;
    }
  } else if (cleanSubForCon === 'algebra') {
    if (cleanCon === 'linear-eq' || cleanCon === 'linear equations') conceptIdx = 1;
    else if (cleanCon === 'quadratic-eq' || cleanCon === 'quadratic equations') conceptIdx = 2;
    else if (cleanCon === 'progressions' || cleanCon === 'ap, gp & hp') conceptIdx = 3;
    else if (cleanCon === 'functions' || cleanCon === 'functions & graphs') conceptIdx = 4;
    else {
      const customCons = concepts.filter(c => !['linear-eq', 'linear equations', 'quadratic-eq', 'quadratic equations', 'progressions', 'ap, gp & hp', 'functions', 'functions & graphs'].includes(c.id));
      const foundIdx = customCons.findIndex(c => c.id === conceptId || c.name.toLowerCase() === conceptId.toLowerCase());
      conceptIdx = foundIdx !== -1 ? foundIdx + 5 : customCons.length + 5;
    }
  } else if (cleanSubForCon === 'geometry' || cleanSubForCon === 'geometry & mensuration') {
    if (cleanCon === 'triangles' || cleanCon === 'triangles & properties') conceptIdx = 1;
    else if (cleanCon === 'circles' || cleanCon === 'circles & tangents') conceptIdx = 2;
    else if (cleanCon === 'volumes' || cleanCon === 'surface areas & volumes') conceptIdx = 3;
    else {
      const customCons = concepts.filter(c => !['triangles', 'triangles & properties', 'circles', 'circles & tangents', 'volumes', 'surface areas & volumes'].includes(c.id));
      const foundIdx = customCons.findIndex(c => c.id === conceptId || c.name.toLowerCase() === conceptId.toLowerCase());
      conceptIdx = foundIdx !== -1 ? foundIdx + 4 : customCons.length + 4;
    }
  } else if (cleanSubForCon === 'arrangements') {
    if (cleanCon === 'linear-arr' || cleanCon === 'linear arrangements') conceptIdx = 1;
    else if (cleanCon === 'circular-arr' || cleanCon === 'circular arrangements') conceptIdx = 2;
    else {
      const customCons = concepts.filter(c => !['linear-arr', 'linear arrangements', 'circular-arr', 'circular arrangements'].includes(c.id));
      const foundIdx = customCons.findIndex(c => c.id === conceptId || c.name.toLowerCase() === conceptId.toLowerCase());
      conceptIdx = foundIdx !== -1 ? foundIdx + 3 : customCons.length + 3;
    }
  } else if (cleanSubForCon === 'syllogisms') {
    if (cleanCon === 'basic-syll' || cleanCon === 'basic syllogisms') conceptIdx = 1;
    else if (cleanCon === 'conditional-syll' || cleanCon === 'conditional syllogisms') conceptIdx = 2;
    else {
      const customCons = concepts.filter(c => !['basic-syll', 'basic syllogisms', 'conditional-syll', 'conditional syllogisms'].includes(c.id));
      const foundIdx = customCons.findIndex(c => c.id === conceptId || c.name.toLowerCase() === conceptId.toLowerCase());
      conceptIdx = foundIdx !== -1 ? foundIdx + 3 : customCons.length + 3;
    }
  } else if (cleanSubForCon === 'grammar' || cleanSubForCon === 'grammar & usage') {
    if (cleanCon === 'tenses' || cleanCon === 'tenses & active/passive') conceptIdx = 1;
    else if (cleanCon === 'prepositions' || cleanCon === 'prepositions & conjunctions') conceptIdx = 2;
    else {
      const customCons = concepts.filter(c => !['tenses', 'tenses & active/passive', 'prepositions', 'prepositions & conjunctions'].includes(c.id));
      const foundIdx = customCons.findIndex(c => c.id === conceptId || c.name.toLowerCase() === conceptId.toLowerCase());
      conceptIdx = foundIdx !== -1 ? foundIdx + 3 : customCons.length + 3;
    }
  } else if (cleanSubForCon === 'comprehension' || cleanSubForCon === 'reading comprehension') {
    if (cleanCon === 'inference' || cleanCon === 'inference-based questions') conceptIdx = 1;
    else if (cleanCon === 'vocabulary' || cleanCon === 'contextual vocabulary') conceptIdx = 2;
    else {
      const customCons = concepts.filter(c => !['inference', 'inference-based questions', 'vocabulary', 'contextual vocabulary'].includes(c.id));
      const foundIdx = customCons.findIndex(c => c.id === conceptId || c.name.toLowerCase() === conceptId.toLowerCase());
      conceptIdx = foundIdx !== -1 ? foundIdx + 3 : customCons.length + 3;
    }
  } else {
    // Custom subtopic
    const foundIdx = concepts.findIndex(c => c.id === conceptId || c.name.toLowerCase() === conceptId.toLowerCase());
    conceptIdx = foundIdx !== -1 ? foundIdx + 1 : concepts.length + 1;
  }

  // 4. Calculate Question Sequence Index (0-based)
  let qIdx = 0;
  if (allQuestions && allQuestions.length > 0) {
    // Filter questions under same concept
    const conceptQuestions = allQuestions.filter(q => q.conceptId === conceptId);
    conceptQuestions.sort((a, b) => {
      const timeA = a.createdAt && a.createdAt !== 'Synced' ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt && b.createdAt !== 'Synced' ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;
      return a.id.localeCompare(b.id);
    });
    const foundIdx = conceptQuestions.findIndex(q => q.id === questionId);
    if (foundIdx !== -1) {
      qIdx = foundIdx;
    } else {
      qIdx = conceptQuestions.length;
    }
  } else {
    qIdx = seed;
  }

  // Format blocks: BB[CrockfordLetter]BB[CategorySuffix]
  const formatBlock = (idx: number, suffix: string): string => {
    const val = idx % 16;
    const bHigh = intToBinary2(Math.floor(val / 4));
    const letter = getAlphabetLetter(val);
    const bLow = intToBinary2(val);
    return bHigh + letter + bLow + suffix;
  };

  const block1 = formatBlock(domainIdx, 'D');
  const block2 = formatBlock(subtopicIdx, 'S');
  const block3 = formatBlock(conceptIdx, 'C');
  const block4 = formatBlock(qIdx, 'Q');

  return `${block1}-${block2}-${block3}-${block4}`;
}

/**
 * Backwards compatibility wrapper for prior 16-bit visual layout.
 * Maps arguments directly to the new 20-character secure alphanumeric engine.
 */
export function generate16BitBinaryId(
  domainId: string,
  subTopicId: string,
  conceptId: string,
  questionId: string,
  seed: number = 0,
  domainsList?: Domain[],
  allQuestions?: any[]
): string {
  return generate20CharAlphanumericId(domainId, subTopicId, conceptId, questionId, seed, domainsList, allQuestions);
}

/**
 * Backwards compatibility wrapper for prior 16-bit hex layout.
 * Maps arguments directly to the new 20-character secure alphanumeric engine.
 */
export function generate16BitQuestionId(
  domainId: string,
  subTopicId: string,
  conceptId: string,
  questionId: string,
  allQuestions?: any[]
): string {
  return generate20CharAlphanumericId(domainId, subTopicId, conceptId, questionId, 0, undefined, allQuestions);
}

