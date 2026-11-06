import test from 'node:test';
import assert from 'node:assert/strict';
import { romajiToHiragana, checkTypingProgress, calculateTypingWPM, calculateTypingAccuracy } from './typingLogic';

test('typing: converts standard romaji to hiragana correctly', () => {
  assert.equal(romajiToHiragana('taberu'), 'たべる');
  assert.equal(romajiToHiragana('arigatou'), 'ありがとう');
  assert.equal(romajiToHiragana('konnichiwa'), 'こんにちは');
  assert.equal(romajiToHiragana('nihon'), 'にほん');
  assert.equal(romajiToHiragana('sushi'), 'すし');
  assert.equal(romajiToHiragana('toukyou'), 'とうきょう');
  assert.equal(romajiToHiragana('tokyo'), 'ときょ');
});

test('typing: handles variations like si/shi and tsu/tu', () => {
  assert.equal(romajiToHiragana('sushi'), 'すし');
  assert.equal(romajiToHiragana('susi'), 'すし');
  assert.equal(romajiToHiragana('tsuki'), 'つき');
  assert.equal(romajiToHiragana('tuki'), 'つき');
});

test('typing: checks typing progress accurately', () => {
  const targetKana = 'たべる';
  const targetRomaji = 'taberu';

  // Partial match
  const partial = checkTypingProgress('ta', targetKana, targetRomaji);
  assert.equal(partial.isPartialMatch, true);
  assert.equal(partial.isComplete, false);

  // Complete match with romaji
  const completeRomaji = checkTypingProgress('taberu', targetKana, targetRomaji);
  assert.equal(completeRomaji.isComplete, true);

  // Complete match with direct kana
  const completeKana = checkTypingProgress('たべる', targetKana, targetRomaji);
  assert.equal(completeKana.isComplete, true);

  // Mismatch
  const mismatch = checkTypingProgress('neko', targetKana, targetRomaji);
  assert.equal(mismatch.isPartialMatch, false);
  assert.equal(mismatch.isComplete, false);
});

test('typing: calculates WPM and accuracy correctly', () => {
  // 50 chars in 30 seconds = 10 words in 0.5 min = 20 WPM
  assert.equal(calculateTypingWPM(50, 30), 20);
  assert.equal(calculateTypingAccuracy(95, 100), 95);
  assert.equal(calculateTypingAccuracy(0, 0), 100);
});

test('romaji input: typing key by key waits on "n" so な-row kana can be entered', async () => {
  const { stepRomajiInput, flushRomajiInput } = await import('./typingLogic');
  const typeWord = (letters: string) => {
    let buffer = '';
    const out: string[] = [];
    for (const ch of letters) {
      const step = stepRomajiInput(buffer + ch);
      out.push(...step.kana);
      buffer = step.pending;
    }
    return [...out, ...flushRomajiInput(buffer)].join('');
  };
  assert.equal(typeWord('sakana'), 'さかな');
  assert.equal(typeWord('kimono'), 'きもの');
  assert.equal(typeWord('kitsune'), 'きつね');
  assert.equal(typeWord('minamoto'), 'みなもと');
  assert.equal(typeWord('hon'), 'ほん');
  assert.equal(typeWord('densha'), 'でんしゃ');
  assert.equal(typeWord('kitte'), 'きって');
  assert.equal(typeWord('onna'), 'おんな');
  assert.equal(typeWord('karate'), 'からて');
  assert.equal(typeWord('shiori'), 'しおり');
  assert.equal(typeWord('tamashii'), 'たましい');
  assert.equal(typeWord('kyou'), 'きょう');
  assert.equal(typeWord('vqa'), 'あ', 'letters that cannot form kana are dropped');
});

test('romaji input: same results as whole-word conversion for every Wordle answer', async () => {
  const { stepRomajiInput, flushRomajiInput } = await import('./typingLogic');
  const { WORDLE_WORDS } = await import('../data/wordleWords');
  for (const w of WORDLE_WORDS) {
    let buffer = '';
    const out: string[] = [];
    for (const ch of w.romaji) {
      const step = stepRomajiInput(buffer + ch);
      out.push(...step.kana);
      buffer = step.pending;
    }
    assert.equal([...out, ...flushRomajiInput(buffer)].join(''), w.kana, w.romaji);
  }
});
