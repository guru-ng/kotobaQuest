/**
 * Kana -> romaji (Hepburn-flavoured wapuro, matching the style of the
 * hand-written entries: sushi / tsu / chi / fu / ji, long vowels spelled out
 * kana-by-kana as in "hikouki", "tamashii").
 *
 * Output is verified to round-trip through src/utils/typingLogic.ts, so every
 * generated word is actually typeable on the in-game romaji keyboard.
 */

const DIGRAPHS: Record<string, string> = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo'
};

const MONOGRAPHS: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'wo', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'di', づ: 'du', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ー: '-'
};

/** Katakana -> hiragana (leaves everything else alone). */
export function katakanaToHiragana(input: string): string {
  return Array.from(input)
    .map(ch => {
      const code = ch.codePointAt(0)!;
      return code >= 0x30a1 && code <= 0x30f6 ? String.fromCodePoint(code - 0x60) : ch;
    })
    .join('');
}

export const isAllHiragana = (s: string): boolean => /^[ぁ-ゟ]+$/.test(s);

/**
 * Converts kana to romaji. Returns null when the string contains anything the
 * table can't represent, so callers can skip the entry rather than ship junk.
 */
export function kanaToRomaji(kanaInput: string): string | null {
  const kana = katakanaToHiragana(kanaInput.trim());
  if (!kana) return null;

  let out = '';
  let i = 0;

  while (i < kana.length) {
    const pair = kana.slice(i, i + 2);
    if (DIGRAPHS[pair]) {
      out += DIGRAPHS[pair];
      i += 2;
      continue;
    }

    const ch = kana[i];

    // Small tsu doubles the next consonant
    if (ch === 'っ') {
      const nextPair = kana.slice(i + 1, i + 3);
      const next = DIGRAPHS[nextPair] ?? MONOGRAPHS[kana[i + 1]];
      if (!next) return null;
      const consonant = next[0];
      if (!/[a-z]/.test(consonant) || /[aiueon]/.test(consonant)) return null;
      // tsu -> "ttsu", chi -> "cchi": double the first letter (Hepburn uses "tch")
      out += next.startsWith('ch') ? 't' : consonant;
      i += 1;
      continue;
    }

    if (MONOGRAPHS[ch]) {
      // n before a vowel or y needs an apostrophe, which the game keyboard
      // can't type, so reject rather than emit an ambiguous spelling.
      if (ch === 'ん' && /^[あいうえおやゆよ]/.test(kana[i + 1] ?? '')) return null;
      out += MONOGRAPHS[ch];
      i += 1;
      continue;
    }

    return null;
  }

  return out;
}
