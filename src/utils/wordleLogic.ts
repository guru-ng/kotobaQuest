import { WordleTileState } from '../types';

/**
 * Evaluates a guess against a target word in character array format.
 * Correctly accounts for character frequency (handling duplicate kana).
 */
export function evaluateWordleGuess(target: string[], guess: string[]): WordleTileState[] {
  const length = target.length;
  const result: WordleTileState[] = new Array(length).fill('absent');
  
  if (guess.length !== length) {
    return result;
  }

  // Frequency map for target characters
  const targetCounts: Record<string, number> = {};
  for (let i = 0; i < length; i++) {
    const char = target[i];
    targetCounts[char] = (targetCounts[char] || 0) + 1;
  }

  // First pass: mark correct positions
  for (let i = 0; i < length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      targetCounts[guess[i]]--;
    }
  }

  // Second pass: mark present characters in wrong positions
  for (let i = 0; i < length; i++) {
    if (result[i] === 'correct') continue;
    
    const char = guess[i];
    if (targetCounts[char] && targetCounts[char] > 0) {
      result[i] = 'present';
      targetCounts[char]--;
    } else {
      result[i] = 'absent';
    }
  }

  return result;
}

export function isWordleWon(results: WordleTileState[]): boolean {
  return results.length > 0 && results.every(state => state === 'correct');
}

/**
 * Aggregates letter statuses for the on-screen keyboard
 */
export function computeKeyboardStatus(
  guesses: string[][],
  target: string[]
): Record<string, WordleTileState> {
  const statusMap: Record<string, WordleTileState> = {};

  for (const guess of guesses) {
    const evaluation = evaluateWordleGuess(target, guess);
    for (let i = 0; i < guess.length; i++) {
      const char = guess[i];
      const state = evaluation[i];
      const current = statusMap[char];

      // Priority: correct > present > absent
      if (state === 'correct') {
        statusMap[char] = 'correct';
      } else if (state === 'present' && current !== 'correct') {
        statusMap[char] = 'present';
      } else if (state === 'absent' && !current) {
        statusMap[char] = 'absent';
      }
    }
  }

  return statusMap;
}
