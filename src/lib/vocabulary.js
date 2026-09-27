export const ALL_LEVELS = 'All';
export const ALL_POS = 'All';

export const LEVELS = [ALL_LEVELS, 'A1', 'A2', 'B1', 'B2', 'C1'];

export const PARTS_OF_SPEECH = [
  ALL_POS,
  'Nomen',
  'Verb',
  'Adjektiv',
  'Adverb',
  'Konjunktion',
  'Präposition',
  'Phrase',
];

// Separable verbs are stored as "an·sehen"; search ignores the dot.
export const stripDot = (word) => word.replace(/·/g, '');

const normalize = (text) => stripDot(text).toLowerCase();

function matchesSearch(entry, query) {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = [
    entry.article,
    entry.word,
    entry.plural,
    entry.synonymDe,
    entry.en,
    entry.synonymEn,
  ]
    .filter(Boolean)
    .join(' ');
  return normalize(haystack).includes(q);
}

// Level, part of speech and search all apply together (AND).
export function filterVocabulary(vocabulary, { level, pos, query }) {
  return vocabulary.filter(
    (entry) =>
      (level === ALL_LEVELS || entry.level === level) &&
      (pos === ALL_POS || entry.pos === pos) &&
      matchesSearch(entry, query),
  );
}

// "der Umzug, -Umzüge": returns the ", -Umzüge" suffix, or null when there is no plural.
export function formatPlural(entry) {
  return entry.plural ? `, -${entry.plural}` : null;
}

// Splits `text` into [{ text, highlight }] segments around `hl`.
// `hl` is an exact substring, or several parts joined by "..." for a split
// separable verb ("sehe ... an"); parts are matched in order as whole words.
export function splitHighlight(text, hl) {
  if (!hl) return [{ text, highlight: false }];

  const parts = hl
    .split(/\s*(?:\.\.\.|…)\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const segments = [];
  let cursor = 0;

  for (const part of parts) {
    const start = findPart(text, part, cursor);
    if (start === -1) break;
    if (start > cursor)
      segments.push({ text: text.slice(cursor, start), highlight: false });
    segments.push({
      text: text.slice(start, start + part.length),
      highlight: true,
    });
    cursor = start + part.length;
  }

  if (cursor < text.length)
    segments.push({ text: text.slice(cursor), highlight: false });
  return segments;
}

function findPart(text, part, from) {
  const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wholeWord = new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'u');
  const match = wholeWord.exec(text.slice(from));
  if (match) return from + match.index;
  return text.indexOf(part, from);
}
