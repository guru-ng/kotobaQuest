/**
 * Generates KotobaQuest's bulk content from open datasets into public/data/.
 *
 * Sources (see ATTRIBUTION.md) are checked out by scripts/fetch-sources.sh:
 *   KanjiVG            CC BY-SA 3.0   stroke paths
 *   KANJIDIC2/EDRDG    CC BY-SA 4.0   readings, meanings (via davidluzgouveia/kanji-data)
 *   J. Waller JLPT     CC BY          JLPT levels + vocabulary
 *
 * Hand-written entries in src/data/ stay the curated tier and win on conflict:
 * they carry Nepali translations and example sentences that no dataset has.
 *
 * Run: npx tsx scripts/build-content.ts [--sources DIR] [--out DIR]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { JLPTLevel } from '../src/types';
import { WORDLE_WORDS } from '../src/data/wordleWords';
import { VOCAB_LIST } from '../src/data/vocabData';
import { KANJI_WRITING_LIST } from '../src/data/kanjiStrokeData';
import { stepRomajiInput, flushRomajiInput } from '../src/utils/typingLogic';
import { isAllHiragana, kanaToRomaji } from './lib/kana';
import { pathEnd, pathStart, scalePath } from './lib/svgPath';
import { describeStrokeType, directionArrow, regionName } from './lib/strokeTypes';

const args = process.argv.slice(2);
const argVal = (flag: string, fallback: string) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const SOURCES = argVal('--sources', join(process.cwd(), '.data-sources'));
const OUT = argVal('--out', join(process.cwd(), 'public', 'data'));

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const levelFromNumber = (n: number): JLPTLevel | null =>
  n >= 1 && n <= 5 ? (`N${n}` as JLPTLevel) : null;

/** KanjiVG renders in a 109x109 box; the app's board uses 0-100. */
const KVG_SCALE = 100 / 109;

const round = (n: number) => Number(n.toFixed(1));

function requireDir(path: string, hint: string): string {
  if (!existsSync(path)) {
    console.error(`Missing source: ${path}\n  ${hint}\n  Run scripts/fetch-sources.sh first.`);
    process.exit(1);
  }
  return path;
}

/** Characters skipped because KanjiVG and KANJIDIC2 disagree on stroke count. */
const strokeCountMismatches: string[] = [];

// ---------------------------------------------------------------- kanji data

interface KanjiDicEntry {
  strokes?: number;
  grade?: number | null;
  freq?: number | null;
  jlpt_new?: number | null;
  meanings?: string[];
  readings_on?: string[];
  readings_kun?: string[];
}

const kanjiDic: Record<string, KanjiDicEntry> = JSON.parse(
  readFileSync(join(requireDir(join(SOURCES, 'kanji-data'), 'davidluzgouveia/kanji-data'), 'kanji.json'), 'utf8')
);

const KVG_DIR = join(requireDir(join(SOURCES, 'kanjivg'), 'KanjiVG/kanjivg'), 'kanji');

const kvgFileFor = (kanji: string) =>
  join(KVG_DIR, `${kanji.codePointAt(0)!.toString(16).padStart(5, '0')}.svg`);

// ------------------------------------------------------- KanjiVG SVG parsing

interface RawStroke {
  type: string;
  d: string;
  /** Nearest enclosing kvg:element that isn't the whole character */
  component: string;
  /** Index of the top-level component group this stroke belongs to */
  blockIndex: number;
}

/**
 * Reads one attribute off a tag. The leading-space match matters: a bare
 * `d="` would otherwise match inside `id="kvg:056fd-s1"`.
 */
const attr = (tag: string, name: string): string | undefined =>
  new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

/**
 * Walks the StrokePaths tree and returns strokes in writing order, each tagged
 * with the component it belongs to and which top-level block that is.
 */
function parseKanjiVG(svg: string): RawStroke[] {
  const body = svg.slice(svg.indexOf('<g id="kvg:StrokePaths'));
  const strokes: RawStroke[] = [];
  // Stack of kvg:element values; depth 0 is the character itself
  const stack: string[] = [];
  let depth = 0;
  let blockIndex = -1;
  let blockDepth = -1;

  const re = /<g\b([^>]*)>|<\/g>|<path\b([^>]*)\/?>/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(body)) !== null) {
    if (m[0].startsWith('</g')) {
      stack.pop();
      depth -= 1;
      if (depth <= blockDepth) blockDepth = -1;
      continue;
    }

    if (m[1] !== undefined) {
      const element = attr(m[0], 'kvg:element') ?? '';
      stack.push(element);
      depth += 1;
      // depth 1 = wrapper, depth 2 = the character, depth 3 = its components
      if (depth === 3 && blockDepth === -1) {
        blockIndex += 1;
        blockDepth = depth;
      }
      continue;
    }

    const d = attr(m[0], 'd');
    if (!d) continue;
    const component = [...stack].reverse().find((e, i) => e && i < stack.length - 1) ?? stack[stack.length - 1] ?? '';
    strokes.push({
      type: attr(m[0], 'kvg:type') ?? '',
      d,
      component,
      blockIndex: blockDepth === -1 ? Math.max(0, blockIndex) : blockIndex
    });
  }

  return strokes;
}

interface StrokeStep {
  num: number;
  path: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  instruction: string;
  componentLabel: string;
}

function buildKanjiItem(kanji: string, level: JLPTLevel, examples: KanjiExample[]) {
  const file = kvgFileFor(kanji);
  if (!existsSync(file)) return null;

  const dic = kanjiDic[kanji];
  if (!dic?.meanings?.length) return null;

  const raw = parseKanjiVG(readFileSync(file, 'utf8'));
  if (raw.length === 0) return null;

  // A few KanjiVG files are incomplete upstream (e.g. 衷 has 9 paths for a
  // 10-stroke kanji). Teaching the wrong stroke count is worse than omitting
  // the character, so skip any disagreement with KANJIDIC2.
  if (dic.strokes && dic.strokes !== raw.length) {
    strokeCountMismatches.push(`${kanji} (KANJIDIC2 ${dic.strokes}, KanjiVG ${raw.length})`);
    return null;
  }

  const strokes: StrokeStep[] = raw.map((s, i) => {
    const path = scalePath(s.d, KVG_SCALE);
    const start = pathStart(path);
    const end = pathEnd(path);
    const type = describeStrokeType(s.type);
    const arrow = directionArrow(end.x - start.x, end.y - start.y);
    const isWholeChar = !s.component || s.component === kanji;
    return {
      num: i + 1,
      path,
      startX: round(start.x),
      startY: round(start.y),
      endX: round(end.x),
      endY: round(end.y),
      instruction: `Start ${regionName(start.x, start.y)} (${Math.round(start.x)},${Math.round(start.y)}) and ${type.action} ${arrow}`,
      componentLabel: isWholeChar
        ? `${type.name.charAt(0).toUpperCase()}${type.name.slice(1)}`
        : `${s.component} · ${type.name}`
    };
  });

  // Group consecutive strokes that share a top-level component into blocks
  const blocks: Array<{ step: number; radical: string; name: string; strokeRange: string; startRule: string }> = [];
  let cursor = 0;
  while (cursor < raw.length) {
    const idx = raw[cursor].blockIndex;
    let endIdx = cursor;
    while (endIdx + 1 < raw.length && raw[endIdx + 1].blockIndex === idx) endIdx += 1;
    const component = raw[cursor].component && raw[cursor].component !== kanji ? raw[cursor].component : kanji;
    const range = cursor === endIdx ? `${cursor + 1}` : `${cursor + 1}–${endIdx + 1}`;
    blocks.push({
      step: blocks.length + 1,
      radical: component,
      name: `${component} (Stroke${cursor === endIdx ? '' : 's'} ${range})`,
      strokeRange: range,
      startRule: strokes[cursor].instruction
    });
    cursor = endIdx + 1;
  }

  // A component can appear in more than one block: in 国 the enclosure 囗 is
  // split around 王, so the order matters more than the part count.
  const summary =
    blocks.length > 1
      ? `Write it in this order: ${blocks.map(b => `${b.radical} (${b.strokeRange})`).join(', ')}. Work top to bottom and left to right.`
      : `${strokes.length} strokes, written top to bottom and left to right: ${strokes.map(s => s.componentLabel.toLowerCase()).join(', ')}.`;

  const kata = (s: string) =>
    Array.from(s)
      .map(ch => {
        const c = ch.codePointAt(0)!;
        return c >= 0x3041 && c <= 0x3096 ? String.fromCodePoint(c + 0x60) : ch;
      })
      .join('');
  const withRomaji = (r: string, toKatakana: boolean) => {
    const clean = r.replace(/[.\-]/g, '');
    const romaji = kanaToRomaji(clean);
    const display = toKatakana ? kata(clean) : clean;
    return romaji ? `${display} (${romaji})` : display;
  };

  return {
    id: `g_kw_${level.toLowerCase()}_${kanji}`,
    kanji,
    meaning: dic.meanings.slice(0, 3).join(' / '),
    onyomi: (dic.readings_on ?? []).slice(0, 3).map(r => withRomaji(r, true)),
    kunyomi: (dic.readings_kun ?? []).slice(0, 3).map(r => withRomaji(r, false)),
    level,
    Complexity: strokes.length <= 5 ? 'Basic' : strokes.length <= 10 ? 'Intermediate' : 'Complex',
    strokeRuleSummary: summary,
    basicBlocks: blocks,
    strokes,
    examples,
    generated: true as const
  };
}

// ----------------------------------------------------------- vocabulary data

interface CsvRow {
  expression: string;
  reading: string;
  meaning: string;
}

/** Minimal RFC4180 CSV reader (handles quoted fields with embedded commas). */
function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  const [header, ...body] = rows;
  const col = (name: string) => header.indexOf(name);
  const [e, r, m] = [col('expression'), col('reading'), col('meaning')];
  return body
    .filter(cells => cells.length > Math.max(e, r, m))
    .map(cells => ({
      expression: cells[e].trim(),
      reading: cells[r].trim(),
      meaning: cells[m].trim()
    }))
    .filter(x => x.expression && x.reading && x.meaning);
}

const VOCAB_DIR = join(requireDir(join(SOURCES, 'open-anki-jlpt-decks'), 'jamsinclair/open-anki-jlpt-decks'), 'src');

/** Verifies a romaji spelling is typeable on the in-game keyboard, key by key. */
function typeableAs(romaji: string, expectedKana: string): boolean {
  let buffer = '';
  const out: string[] = [];
  for (const ch of romaji) {
    const step = stepRomajiInput(buffer + ch);
    out.push(...step.kana);
    buffer = step.pending;
  }
  return [...out, ...flushRomajiInput(buffer)].join('') === expectedKana;
}

interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

/**
 * Normalises a Waller list reading: "いい; よい" lists alternatives (keep the
 * first) and "～円" marks a counter/suffix (strip the placeholder).
 * `placeholder` flags entries that aren't standalone words.
 */
function cleanReading(raw: string): { reading: string; expression: (e: string) => string; placeholder: boolean } {
  const first = raw.split(/[;；]/)[0].trim();
  const placeholder = /[～~]/.test(first);
  return {
    reading: first.replace(/[～~]/g, '').trim(),
    expression: e => e.split(/[;；]/)[0].trim().replace(/[～~]/g, '').trim(),
    placeholder
  };
}

const CATEGORY_HINTS: Array<[RegExp, string]> = [
  [/\b(food|eat|drink|rice|meat|fish|tea|meal|cook|restaurant|fruit|vegetable)\b/i, 'food'],
  [/\b(train|station|car|bus|road|travel|trip|airport|ticket|map|hotel)\b/i, 'travel'],
  [/\b(to [a-z]+)\b/i, 'verbs']
];
const guessCategory = (meaning: string): string =>
  CATEGORY_HINTS.find(([re]) => re.test(meaning))?.[1] ?? 'daily';

// ------------------------------------------------------------------- build

mkdirSync(OUT, { recursive: true });

const curatedVocab = new Set(VOCAB_LIST.map(v => `${v.kanji}|${v.kana}`));
const curatedWordle = new Set(WORDLE_WORDS.map(w => w.kana));
const curatedKanji = new Set(KANJI_WRITING_LIST.map(k => k.kanji));

const manifest: Record<string, Record<string, number>> = { vocab: {}, wordle: {}, kanji: {} };
const allVocabByLevel = new Map<JLPTLevel, CsvRow[]>();

for (const level of LEVELS) {
  const csv = join(VOCAB_DIR, `${level.toLowerCase()}.csv`);
  allVocabByLevel.set(level, existsSync(csv) ? parseCsv(readFileSync(csv, 'utf8')) : []);
}

// Example compounds for the kanji board, taken from the vocabulary lists
const examplesByKanji = new Map<string, KanjiExample[]>();
for (const level of LEVELS) {
  for (const row of allVocabByLevel.get(level) ?? []) {
    for (const ch of new Set(Array.from(row.expression))) {
      if (!/[一-龯]/.test(ch)) continue;
      const list = examplesByKanji.get(ch) ?? [];
      if (list.length < 8) {
        list.push({ word: row.expression, reading: row.reading, meaning: row.meaning.split(',')[0].trim() });
        examplesByKanji.set(ch, list);
      }
    }
  }
}

let skippedRomaji = 0;

for (const level of LEVELS) {
  const rows = allVocabByLevel.get(level) ?? [];

  // --- vocabulary ---
  const vocab = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const { reading, expression } = cleanReading(row.reading);
    const kanji = expression(row.expression) || reading;
    const key = `${kanji}|${reading}`;
    if (!reading || seen.has(key) || curatedVocab.has(key)) continue;
    seen.add(key);
    const romaji = kanaToRomaji(reading);
    if (!romaji) { skippedRomaji++; continue; }
    vocab.push({
      id: `g_v_${level.toLowerCase()}_${kanji}_${reading}`,
      kanji,
      kana: reading,
      romaji,
      english: row.meaning,
      jlpt: level,
      category: guessCategory(row.meaning),
      generated: true
    });
  }
  writeFileSync(join(OUT, `vocab-${level.toLowerCase()}.json`), JSON.stringify(vocab));
  manifest.vocab[level] = vocab.length;

  // --- wordle words: 3-4 hiragana, typeable, not already curated ---
  const wordle = [];
  const seenKana = new Set<string>();
  for (const row of rows) {
    // Counters and prefixes ("～円", "お～") aren't standalone words to guess
    const { reading: kana, expression, placeholder } = cleanReading(row.reading);
    if (placeholder) continue;
    const len = Array.from(kana).length;
    if (len < 3 || len > 4 || !isAllHiragana(kana)) continue;
    if (seenKana.has(kana) || curatedWordle.has(kana)) continue;
    const romaji = kanaToRomaji(kana);
    if (!romaji || !typeableAs(romaji, kana)) continue;
    const english = row.meaning.split(',')[0].trim();
    if (!english || english.length > 40) continue;
    const kanji = expression(row.expression);
    seenKana.add(kana);
    wordle.push({
      id: `g_w_${level.toLowerCase()}_${kana}`,
      kana,
      kanji: kanji && kanji !== kana ? kanji : undefined,
      romaji,
      english: english.charAt(0).toUpperCase() + english.slice(1),
      hint: row.meaning,
      jlpt: level,
      category: 'Vocab',
      generated: true
    });
  }
  writeFileSync(join(OUT, `wordle-${level.toLowerCase()}.json`), JSON.stringify(wordle));
  manifest.wordle[level] = wordle.length;

  // --- kanji writing board ---
  const kanjiList = Object.entries(kanjiDic)
    .filter(([ch, info]) => levelFromNumber(info.jlpt_new ?? 0) === level && !curatedKanji.has(ch))
    .sort((a, b) => (a[1].freq ?? 9999) - (b[1].freq ?? 9999))
    .map(([ch]) => ch);

  const kanjiItems = kanjiList
    .map(ch => buildKanjiItem(ch, level, (examplesByKanji.get(ch) ?? []).slice(0, 3)))
    .filter(Boolean);
  writeFileSync(join(OUT, `kanji-${level.toLowerCase()}.json`), JSON.stringify(kanjiItems));
  manifest.kanji[level] = kanjiItems.length;
}

writeFileSync(
  join(OUT, 'manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), counts: manifest }, null, 2)
);

const sizes = readdirSync(OUT).map(f => {
  const bytes = readFileSync(join(OUT, f)).length;
  return `  ${f.padEnd(18)} ${(bytes / 1024).toFixed(0)} KB`;
});
console.log('Generated into', OUT);
console.log(JSON.stringify(manifest, null, 2));
console.log(sizes.join('\n'));
if (skippedRomaji) console.log(`Skipped ${skippedRomaji} vocab entries with unconvertible readings.`);
if (strokeCountMismatches.length)
  console.log(`Skipped ${strokeCountMismatches.length} kanji with incomplete KanjiVG data: ${strokeCountMismatches.join(', ')}`);
