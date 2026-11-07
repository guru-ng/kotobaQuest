/**
 * Sanity-checks the generated content in public/data before it ships.
 * Run: npx tsx scripts/validate-content.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { stepRomajiInput, flushRomajiInput } from '../src/utils/typingLogic';
import { isValidPath } from './lib/svgPath';

const OUT = join(process.cwd(), 'public', 'data');
const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const read = (f: string) => JSON.parse(readFileSync(join(OUT, f), 'utf8'));

let failures = 0;
const fail = (msg: string) => { console.error('FAIL', msg); failures++; };
const ok = (msg: string) => console.log('pass', msg);

/** Reproduces what the Wordle keyboard does, key by key. */
function typesTo(romaji: string): string {
  let buffer = '';
  const out: string[] = [];
  for (const ch of romaji) {
    const step = stepRomajiInput(buffer + ch);
    out.push(...step.kana);
    buffer = step.pending;
  }
  return [...out, ...flushRomajiInput(buffer)].join('');
}

for (const lv of LEVELS) {
  if (!existsSync(join(OUT, `wordle-${lv}.json`))) { fail(`wordle-${lv}.json missing`); continue; }

  // --- wordle ---
  const wordle = read(`wordle-${lv}.json`);
  const badType = wordle.filter((w: any) => typesTo(w.romaji) !== w.kana);
  const badLen = wordle.filter((w: any) => ![3, 4].includes(Array.from(w.kana as string).length));
  const badKana = wordle.filter((w: any) => !/^[ぁ-ゟ]+$/.test(w.kana));
  const noEnglish = wordle.filter((w: any) => !w.english?.trim());
  badType.length ? fail(`wordle-${lv}: ${badType.length} not typeable, e.g. ${JSON.stringify(badType[0])}`)
                 : ok(`wordle-${lv}: all ${wordle.length} typeable on the romaji keyboard`);
  badLen.length && fail(`wordle-${lv}: ${badLen.length} wrong kana length`);
  badKana.length && fail(`wordle-${lv}: ${badKana.length} not pure hiragana`);
  noEnglish.length && fail(`wordle-${lv}: ${noEnglish.length} missing english`);

  // --- vocab ---
  const vocab = read(`vocab-${lv}.json`);
  const vBad = vocab.filter((v: any) => !v.kanji || !v.kana || !v.romaji || !v.english || v.jlpt !== lv.toUpperCase());
  const vDupe = vocab.length - new Set(vocab.map((v: any) => v.id)).size;
  vBad.length ? fail(`vocab-${lv}: ${vBad.length} incomplete, e.g. ${JSON.stringify(vBad[0])}`)
              : ok(`vocab-${lv}: all ${vocab.length} complete`);
  vDupe && fail(`vocab-${lv}: ${vDupe} duplicate ids`);

  // --- kanji ---
  const kanji = read(`kanji-${lv}.json`);
  const kBad = kanji.filter((k: any) =>
    !k.kanji || !k.meaning || !k.strokes?.length || !k.basicBlocks?.length ||
    k.strokes.some((s: any) =>
      !/^[Mm]\s*-?[\d.]/.test(s.path ?? '') || typeof s.startX !== 'number' ||
      [s.startX, s.startY, s.endX, s.endY].some((n: number) => n < -2 || n > 102) ||
      !s.instruction || !s.componentLabel)
  );
  // A whole character sitting at the origin means the paths never parsed
  const kZero = kanji.filter((k: any) =>
    k.strokes.every((s: any) => s.startX === 0 && s.startY === 0 && s.endX === 0 && s.endY === 0));
  // Only dots legitimately start and end in nearly the same place
  const kDegenerate = kanji.filter((k: any) => {
    const still = k.strokes.filter((s: any) => Math.hypot(s.endX - s.startX, s.endY - s.startY) < 1.5);
    return still.length > k.strokes.length / 2;
  });
  // Strokes should spread across the glyph box, not bunch in one corner
  const kFlat = kanji.filter((k: any) => {
    const xs = k.strokes.flatMap((s: any) => [s.startX, s.endX]);
    const ys = k.strokes.flatMap((s: any) => [s.startY, s.endY]);
    return Math.max(...xs) - Math.min(...xs) < 8 && Math.max(...ys) - Math.min(...ys) < 8;
  });
  const kSeq = kanji.filter((k: any) => k.strokes.some((s: any, i: number) => s.num !== i + 1));
  const kBlocks = kanji.filter((k: any) => {
    const covered = k.basicBlocks.flatMap((b: any) => {
      const [a, z] = b.strokeRange.split('–').map(Number);
      return Array.from({ length: (z ?? a) - a + 1 }, (_, i) => a + i);
    });
    return covered.length !== k.strokes.length;
  });
  const leaked = kanji.filter((k: any) => JSON.stringify(k).includes('wk_') || /[\^!]/.test(JSON.stringify(k.onyomi) + JSON.stringify(k.kunyomi)));
  kBad.length ? fail(`kanji-${lv}: ${kBad.length} malformed, e.g. ${kBad[0].kanji}`)
              : ok(`kanji-${lv}: all ${kanji.length} well-formed (${kanji.reduce((n: number, k: any) => n + k.strokes.length, 0)} strokes)`);
  const kBadPath = kanji.filter((k: any) => k.strokes.some((s: any) => !isValidPath(s.path)));
  kBadPath.length && fail(`kanji-${lv}: ${kBadPath.length} with malformed path data, e.g. ${kBadPath[0].kanji}: ${kBadPath[0].strokes.find((s: any) => !isValidPath(s.path)).path}`);
  kZero.length && fail(`kanji-${lv}: ${kZero.length} with all-zero coordinates (paths failed to parse), e.g. ${kZero[0].kanji}`);
  kDegenerate.length && fail(`kanji-${lv}: ${kDegenerate.length} with mostly zero-length strokes, e.g. ${kDegenerate[0].kanji}`);
  kFlat.length && fail(`kanji-${lv}: ${kFlat.length} whose strokes don't spread across the glyph, e.g. ${kFlat[0].kanji}`);
  kSeq.length && fail(`kanji-${lv}: ${kSeq.length} with non-sequential stroke numbers`);
  kBlocks.length && fail(`kanji-${lv}: ${kBlocks.length} whose blocks don't cover every stroke`);
  leaked.length && fail(`kanji-${lv}: ${leaked.length} containing WaniKani-derived fields`);
}

// Stroke counts must match KANJIDIC2
const dic = JSON.parse(readFileSync(join(process.cwd(), '.data-sources/kanji-data/kanji.json'), 'utf8'));
let mismatch = 0;
for (const lv of LEVELS) {
  for (const k of read(`kanji-${lv}.json`)) {
    if (dic[k.kanji]?.strokes && dic[k.kanji].strokes !== k.strokes.length) mismatch++;
  }
}
mismatch ? fail(`${mismatch} kanji whose stroke count disagrees with KANJIDIC2`)
         : ok('every kanji stroke count matches KANJIDIC2');

console.log(failures ? `\n${failures} FAILURES` : '\nAll content checks passed');
process.exit(failures ? 1 : 0);
