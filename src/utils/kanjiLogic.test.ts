import test from 'node:test';
import assert from 'node:assert/strict';
import { canCraftKanji, isValidRadicalSubset } from './kanjiLogic';

test('kanji: craft matches regardless of order', () => {
  assert.equal(canCraftKanji(['木', '木'], ['木', '木']), true);
  assert.equal(canCraftKanji(['日', '月'], ['月', '日']), true);
  assert.equal(canCraftKanji(['日', '火'], ['月', '日']), false);
  assert.equal(canCraftKanji(['日'], ['月', '日']), false);
});

test('kanji: validates partial radical subsets', () => {
  const target = ['木', '木', '木']; // 森 (Forest)
  assert.equal(isValidRadicalSubset(['木'], target), true);
  assert.equal(isValidRadicalSubset(['木', '木'], target), true);
  assert.equal(isValidRadicalSubset(['木', '水'], target), false);
  assert.equal(isValidRadicalSubset(['木', '木', '木', '木'], target), false);
});
