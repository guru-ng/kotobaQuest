import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateWordleGuess, isWordleWon, computeKeyboardStatus } from './wordleLogic';

test('wordle: evaluates exact match correctly', () => {
  const target = ['さ', 'く', 'ら'];
  const guess = ['さ', 'く', 'ら'];
  const result = evaluateWordleGuess(target, guess);
  assert.deepEqual(result, ['correct', 'correct', 'correct']);
  assert.equal(isWordleWon(result), true);
});

test('wordle: handles kana in wrong position (present)', () => {
  const target = ['ね', 'こ', 'ろ'];
  const guess = ['ろ', 'ね', 'こ'];
  const result = evaluateWordleGuess(target, guess);
  assert.deepEqual(result, ['present', 'present', 'present']);
  assert.equal(isWordleWon(result), false);
});

test('wordle: handles duplicate kana frequency correctly', () => {
  // Target has only ONE 'き', guess has TWO 'き'
  const target = ['あ', 'き', 'ば'];
  const guess = ['き', 'き', 'り'];
  const result = evaluateWordleGuess(target, guess);
  // Second 'き' should be 'correct', first should be 'absent' because target only has one 'き'
  assert.deepEqual(result, ['absent', 'correct', 'absent']);
});

test('wordle: computes keyboard statuses with proper priority', () => {
  const target = ['す', 'し'];
  const guesses = [
    ['ら', 'す'], // 'ら' absent, 'す' present
    ['す', 'し']  // 'す' correct, 'し' correct
  ];
  const keyboard = computeKeyboardStatus(guesses, target);
  assert.equal(keyboard['す'], 'correct');
  assert.equal(keyboard['し'], 'correct');
  assert.equal(keyboard['ら'], 'absent');
});
