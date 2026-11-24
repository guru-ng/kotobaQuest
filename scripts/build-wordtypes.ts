/**
 * Tags every vocabulary word with its word type (noun, verb, い/な-adjective,
 * adverb, phrase) from JMdict's part-of-speech data, and writes the result to
 * scripts/data/word-types.json. build-content.ts reads that file, so this only
 * needs re-running when the word lists change.
 *
 * Input: the JMdict SQLite file shipped in the jamdict-data package on PyPI
 * (pip download jamdict-data --no-deps; unpack; xz -d jamdict_data/jamdict.db.xz).
 * JMdict is © EDRDG, CC BY-SA 4.0 — see ATTRIBUTION.md.
 *
 *   npx tsx scripts/build-wordtypes.ts path/to/jamdict.db
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { VOCAB_LIST } from '../src/data/vocabData';
import type { WordType } from '../src/types';

const dbPath = process.argv[2];
if (!dbPath) {
  console.error('Usage: npx tsx scripts/build-wordtypes.ts path/to/jamdict.db');
  process.exit(1);
}
const ROOT = join(import.meta.dirname, '..');
const db = new DatabaseSync(dbPath, { readOnly: true });

const byKanjiAndKana = db.prepare(
  'SELECT DISTINCT k.idseq FROM Kanji k JOIN Kana r ON r.idseq = k.idseq WHERE k.text = ? AND r.text = ?'
);
const byKanji = db.prepare('SELECT DISTINCT idseq FROM Kanji WHERE text = ?');
const byKana = db.prepare('SELECT DISTINCT idseq FROM Kana WHERE text = ?');
const hasKanji = db.prepare('SELECT 1 FROM Kanji WHERE idseq = ? LIMIT 1');
const usuallyKana = db.prepare(
  `SELECT 1 FROM misc WHERE text LIKE 'word usually written using kana alone%'
     AND sid = (SELECT MIN(ID) FROM Sense WHERE idseq = ?) LIMIT 1`
);
// Priority tags (news1, ichi1, ...) mark common words; they win ties between homophones
const priority = db.prepare(
  `SELECT (SELECT COUNT(*) FROM KJP p JOIN Kanji k ON k.ID = p.kid WHERE k.idseq = ?) +
          (SELECT COUNT(*) FROM KNP p JOIN Kana r ON r.ID = p.kid WHERE r.idseq = ?) AS n`
);
// JMdict states the part of speech on the first sense; later senses inherit it
const firstSensePos = db.prepare(
  'SELECT text FROM pos WHERE sid = (SELECT MIN(ID) FROM Sense WHERE idseq = ?)'
);

const ids = (stmt: ReturnType<typeof db.prepare>, ...args: string[]) =>
  (stmt.all(...args) as Array<{ idseq: number }>).map(r => r.idseq);

function bestEntry(kanji: string, kana: string): number | null {
  let candidates: number[];
  if (kanji && kanji !== kana) {
    candidates = ids(byKanjiAndKana, kanji, kana);
    if (!candidates.length) candidates = ids(byKanji, kanji);
    if (!candidates.length) candidates = ids(byKana, kana);
  } else {
    candidates = ids(byKana, kana);
  }
  if (!candidates.length) return null;
  const score = (id: number) => {
    const p = Number((priority.get(id, id) as { n: number }).n);
    // A word the list writes in kana is a word normally written in kana:
    // そう is "so, like that", not 沿う "to run along"
    const kanaWord = !hasKanji.get(id) || usuallyKana.get(id);
    return p + (kanji === kana && kanaWord ? 100 : 0);
  };
  return candidates.sort((a, b) => score(b) - score(a) || a - b)[0];
}

const VERB = /^(Godan|Ichidan|Kuru|Yodan|Nidan) verb|^suru verb|^su verb|^irregular (ru|nu) verb/;
const I_ADJ = /^adjective \(keiyoushi\)/;
const NA_ADJ = /^adjectival nouns or quasi-adjectives/;
const ADVERB = /^adverb \(fukushi\)|^adverb taking/; // not "adverbial noun"
const NOUN = /^noun|^pronoun|^numeric/;

function classify(tags: string[]): WordType {
  if (tags.some(t => VERB.test(t))) return 'verb';
  if (tags.some(t => I_ADJ.test(t))) return 'i-adj';
  // 中々 is "adverb, na-adjective" and is learned as an adverb
  if (tags[0] && ADVERB.test(tags[0])) return 'adverb';
  // 親切 is "noun, na-adjective" and is learned as a na-adjective
  if (tags.some(t => NA_ADJ.test(t))) return 'na-adj';
  // Then the first noun or adverb tag decides: 全部 is "noun, adverb" and reads
  // as a noun; 女の人 is "expression, noun" and reads as a noun
  for (const t of tags) {
    if (ADVERB.test(t)) return 'adverb';
    if (NOUN.test(t) || /^adverbial noun/.test(t)) return 'noun';
  }
  return 'phrase';
}

type Word = { kanji: string; kana: string };
const words: Word[] = [...VOCAB_LIST];
for (const lv of ['n5', 'n4', 'n3', 'n2', 'n1']) {
  words.push(...(JSON.parse(readFileSync(join(ROOT, 'public/data', `vocab-${lv}.json`), 'utf8')) as Word[]));
}

const out: Record<string, WordType> = {};
const counts: Record<string, number> = {};
const missing: string[] = [];
for (const w of words) {
  const key = `${w.kanji}|${w.kana}`;
  if (out[key]) continue;
  const id = bestEntry(w.kanji, w.kana);
  if (id === null) {
    // A handful of list entries carry a grammatical tail JMdict files separately
    missing.push(key);
    out[key] = /する$/.test(w.kana)
      ? 'verb'
      : /な$/.test(w.kana)
        ? 'na-adj'
        : /[とに]$/.test(w.kana) && w.kana.length > 2
          ? 'adverb'
          : 'phrase';
  } else {
    const tags = (firstSensePos.all(id) as Array<{ text: string }>).map(r => r.text);
    out[key] = classify(tags);
  }
  counts[out[key]] = (counts[out[key]] ?? 0) + 1;
}

// JMdict files these time and situation words as adverbs first; learners know
// them as nouns (水曜 "Wednesday", 場合 "case").
const NOUN_OVERRIDES = [
  '水曜', '平日', '毎月', '毎年', '初旬', '夕暮れ', '日夜', '場合', '際', '都合',
  '冒頭', '事実', '半分', '他', '通り', '一種', '故', '手元'
];
for (const key of Object.keys(out)) {
  if (NOUN_OVERRIDES.includes(key.split('|')[0])) out[key] = 'noun';
}

mkdirSync(join(ROOT, 'scripts/data'), { recursive: true });
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b, 'ja')));
writeFileSync(join(ROOT, 'scripts/data/word-types.json'), JSON.stringify(sorted, null, 0) + '\n');
console.log(`Tagged ${Object.keys(out).length} words`, counts);
console.log(`Not in JMdict, tagged from their endings: ${missing.length}`);
