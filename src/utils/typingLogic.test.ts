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
