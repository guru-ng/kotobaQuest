/**
 * Romaji to Hiragana dictionary and conversion utilities
 * Supports standard Hepburn, Kunrei-shiki, and common typing inputs (e.g. shi/si, tsu/tu, ji/zi).
 */

const ROMAJI_TABLE: Record<string, string> = {
  // Triple/Double combos
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ', 'sya': 'しゃ', 'syu': 'しゅ', 'syo': 'しょ',
  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ', 'tya': 'ちゃ', 'tyu': 'ちゅ', 'tyo': 'ちょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ', 'jya': 'じゃ', 'jyu': 'じゅ', 'jyo': 'じょ',
  
  // Doubles for small tsu (促音)
  'kk': 'っk', 'ss': 'っs', 'tt': 'っt', 'pp': 'っp',

  // Double n combinations
  'nna': 'んな', 'nni': 'んに', 'nnu': 'んぬ', 'nne': 'んね', 'nno': 'んの',

  // Basic syllables
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'sa': 'さ', 'shi': 'し', 'si': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'ta': 'た', 'chi': 'ち', 'ti': 'ち', 'tsu': 'つ', 'tu': 'つ', 'te': 'て', 'to': 'と',
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  'wa': 'わ', 'wo': 'を',
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  'za': 'ざ', 'ji': 'じ', 'zi': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  'nn': 'ん',

  // Vowels
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  '-': 'ー'
};

const ROMAJI_KEYS = Object.keys(ROMAJI_TABLE);
const KANA_RE = /^[\u3040-\u30ff]$/;

/**
 * Matches one syllable at position i. Shared by the whole-string converter and
 * the keystroke-by-keystroke converter so both behave identically.
 */
function matchRomajiAt(lower: string, i: number): { kana: string; length: number } {
  // Check 3-char match first
  const three = lower.substring(i, i + 3);
  if (three.length === 3 && ROMAJI_TABLE[three]) return { kana: ROMAJI_TABLE[three], length: 3 };

  // Check double consonant (e.g. "kk" -> "っk")
  if (i + 1 < lower.length && lower[i] === lower[i + 1] && /[kstp]/.test(lower[i])) {
    return { kana: 'っ', length: 1 };
  }

  // Check 2-char match
  const two = lower.substring(i, i + 2);
  if (two.length === 2 && ROMAJI_TABLE[two]) return { kana: ROMAJI_TABLE[two], length: 2 };

  // Single 'n' before consonants (except vowels, y, or end of string)
  if (lower[i] === 'n') {
    const next = lower[i + 1];
    if (!next || !/[aiueoyn]/.test(next)) return { kana: 'ん', length: 1 };
  }

  // Check 1-char match (vowels)
  const one = lower.substring(i, i + 1);
  if (ROMAJI_TABLE[one]) return { kana: ROMAJI_TABLE[one], length: 1 };

  // If no match found, pass the raw character through
  return { kana: lower[i], length: 1 };
}

/**
 * Converts a romaji string into hiragana progressively
 */
export function romajiToHiragana(romaji: string): string {
  let lower = romaji.toLowerCase();
  
  // Normalize common greeting spellings where 'wa' is written as 'は'
  lower = lower.replace(/\bkonnichiwa\b/g, 'konnichiha')
               .replace(/\bkonbanwa\b/g, 'konbanha');

  let result = '';
  let i = 0;

  while (i < lower.length) {
    const { kana, length } = matchRomajiAt(lower, i);
    result += kana;
    i += length;
  }

  return result;
}

/** True while `rest` could still grow into a longer syllable: "k" → "ka", "n" → "na", "nn" → "nna". */
function isIncompleteRomaji(rest: string): boolean {
  return ROMAJI_KEYS.some(key => key.length > rest.length && key.startsWith(rest));
}

/**
 * Keystroke-by-keystroke conversion for on-screen/physical romaji keyboards.
 * Returns the kana that are final plus the romaji still waiting for more keys,
 * so "n" waits (it may become な/に/にゃ) instead of turning into ん at once.
 * Characters that can't form kana are dropped.
 */
export function stepRomajiInput(buffer: string): { kana: string[]; pending: string } {
  const lower = buffer.toLowerCase();
  const kana: string[] = [];
  let i = 0;

  while (i < lower.length) {
    const rest = lower.slice(i);
    if (isIncompleteRomaji(rest)) {
      return { kana, pending: rest };
    }
    const match = matchRomajiAt(lower, i);
    kana.push(...Array.from(match.kana).filter(ch => KANA_RE.test(ch)));
    i += match.length;
  }

  return { kana, pending: '' };
}

/** Finalises romaji left in the buffer when the player submits (a trailing "n" becomes ん). */
export function flushRomajiInput(pending: string): string[] {
  return Array.from(romajiToHiragana(pending)).filter(ch => KANA_RE.test(ch));
}

/**
 * Checks if the user's typed input matches the target word in progress.
 * Supports direct kana input or romaji input.
 */
export function checkTypingProgress(
  userInput: string,
  targetKana: string,
  targetRomaji: string
): { isComplete: boolean; isPartialMatch: boolean; convertedInput: string } {
  const cleanInput = userInput.trim().toLowerCase();
  const converted = romajiToHiragana(cleanInput);

  // Exact complete match either via converted kana, raw kana, or raw romaji
  const isComplete =
    converted === targetKana ||
    cleanInput === targetKana ||
    cleanInput === targetRomaji.toLowerCase().replace(/\s+/g, '');

  // Partial match check
  const isPartialMatch =
    targetKana.startsWith(converted) ||
    targetRomaji.toLowerCase().replace(/\s+/g, '').startsWith(cleanInput);

  return {
    isComplete,
    isPartialMatch,
    convertedInput: converted
  };
}

/**
 * Calculate Typing Words Per Minute (standard 5 characters = 1 word)
 */
export function calculateTypingWPM(correctCharacters: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = correctCharacters / 5;
  return Math.round(words / minutes);
}

/**
 * Calculate Accuracy percentage
 */
export function calculateTypingAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((correctKeystrokes / totalKeystrokes) * 100)));
}
