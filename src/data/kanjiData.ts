import { KanjiPuzzle, RadicalItem } from '../types';

export const RADICALS_LIST: RadicalItem[] = [
  { id: 'rad_tree', symbol: '木', name: 'Ki (Tree/Wood)', meaning: 'Tree, wood, nature' },
  { id: 'rad_sun', symbol: '日', name: 'Hi (Sun/Day)', meaning: 'Sun, daylight, time' },
  { id: 'rad_moon', symbol: '月', name: 'Tsuki (Moon/Month)', meaning: 'Moon, month, flesh' },
  { id: 'rad_person', symbol: '人', name: 'Hito (Person)', meaning: 'Human, person, standing' },
  { id: 'rad_fish', symbol: '魚', name: 'Sakana (Fish)', meaning: 'Fish, sea life' },
  { id: 'rad_sheep', symbol: '羊', name: 'Hitsuji (Sheep)', meaning: 'Sheep, wool, beauty' },
  { id: 'rad_woman', symbol: '女', name: 'Onna (Woman)', meaning: 'Woman, female' },
  { id: 'rad_child', symbol: '子', name: 'Ko (Child)', meaning: 'Child, seed' },
  { id: 'rad_fire', symbol: '火', name: 'Hi (Fire)', meaning: 'Fire, burn, flame' },
  { id: 'rad_water', symbol: '氵', name: 'Sanzui (Water)', meaning: 'Water, liquid, river' },
  { id: 'rad_field', symbol: '田', name: 'Ta (Rice field)', meaning: 'Rice field, land' },
  { id: 'rad_power', symbol: '力', name: 'Chikara (Power)', meaning: 'Power, strength, muscle' },
  { id: 'rad_mouth', symbol: '口', name: 'Kuchi (Mouth)', meaning: 'Mouth, opening, speech' },
  { id: 'rad_bird', symbol: '鳥', name: 'Tori (Bird)', meaning: 'Bird, avian' },
  { id: 'rad_gate', symbol: '門', name: 'Mon (Gate)', meaning: 'Gate, entrance, portal' },
  { id: 'rad_words', symbol: '言', name: 'Gon (Words)', meaning: 'Speech, say, words' },
  { id: 'rad_tongue', symbol: '舌', name: 'Shita (Tongue)', meaning: 'Tongue, taste' },
  { id: 'rad_heart', symbol: '心', name: 'Kokoro (Heart)', meaning: 'Heart, mind, spirit' },
  { id: 'rad_dead', symbol: '亡', name: 'Bou (Dead/Perish)', meaning: 'Dead, perish, gone' },
  { id: 'rad_thread', symbol: '糸', name: 'Ito (Thread)', meaning: 'Thread, string, silk' },
  { id: 'rad_hand', symbol: '扌', name: 'Te (Hand)', meaning: 'Hand, action, strike' }
];

export const KANJI_PUZZLES: KanjiPuzzle[] = [
  // N5 Level Puzzles
  {
    id: 'k1',
    kanji: '林',
    meaning: 'Grove / Small Forest',
    onyomi: ['リン (rin)'],
    kunyomi: ['はやし (hayashi)'],
    radicals: ['木', '木'],
    radicalNames: ['Tree (木)', 'Tree (木)'],
    mnemonic: 'Two trees standing together side-by-side make a lovely wooded grove!',
    strokeCount: 8,
    level: 'N5',
    examples: [
      { word: '林', reading: 'はやし', meaning: 'Grove / woods' },
      { word: '森林', reading: 'しんりん', meaning: 'Forest / woodland' },
      { word: '小林', reading: 'こばやし', meaning: 'Kobayashi (surname)' }
    ]
  },
  {
    id: 'k2',
    kanji: '森',
    meaning: 'Deep Forest',
    onyomi: ['シン (shin)'],
    kunyomi: ['もり (mori)'],
    radicals: ['木', '木', '木'],
    radicalNames: ['Tree (木)', 'Tree (木)', 'Tree (木)'],
    mnemonic: 'Three trees stacked together form a lush, deep forest!',
    strokeCount: 12,
    level: 'N5',
    examples: [
      { word: '森', reading: 'もり', meaning: 'Forest' },
      { word: '青森', reading: 'あおもり', meaning: 'Aomori prefecture' },
      { word: '森林', reading: 'しんりん', meaning: 'Forestry' }
    ]
  },
  {
    id: 'k3',
    kanji: '明',
    meaning: 'Bright / Clear',
    onyomi: ['メイ (mei)', 'ミョウ (myou)'],
    kunyomi: ['あか-るい (akarui)'],
    radicals: ['日', '月'],
    radicalNames: ['Sun (日)', 'Moon (月)'],
    mnemonic: 'Combine the light of the Sun with the radiant Moon, and everything is bright!',
    strokeCount: 8,
    level: 'N5',
    examples: [
      { word: '明るい', reading: 'あかるい', meaning: 'Bright / Cheerful' },
      { word: '明日', reading: 'あした', meaning: 'Tomorrow' },
      { word: '説明', reading: 'せつめい', meaning: 'Explanation' }
    ]
  },
  {
    id: 'k4',
    kanji: '休',
    meaning: 'Rest / Day off',
    onyomi: ['キュウ (kyuu)'],
    kunyomi: ['やす-む (yasumu)'],
    radicals: ['人', '木'],
    radicalNames: ['Person (人)', 'Tree (木)'],
    mnemonic: 'A weary person leans against a shady tree to take a well-deserved rest.',
    strokeCount: 6,
    level: 'N5',
    examples: [
      { word: '休む', reading: 'やすむ', meaning: 'To rest' },
      { word: '休日', reading: 'きゅうじつ', meaning: 'Holiday' },
      { word: '休憩', reading: 'きゅうけい', meaning: 'Break / Rest' }
    ]
  },

  // N4 Level Puzzles
  {
    id: 'k5',
    kanji: '鳴',
    meaning: 'Chirp / Ring / Cry',
    onyomi: ['メイ (mei)'],
    kunyomi: ['な-く (naku)', 'な-る (naru)'],
    radicals: ['口', '鳥'],
    radicalNames: ['Mouth (口)', 'Bird (鳥)'],
    mnemonic: 'A bird opening its mouth sings and chirps sweet melodies.',
    strokeCount: 14,
    level: 'N4',
    examples: [
      { word: '鳴く', reading: 'なく', meaning: 'Animal cry / Chirp' },
      { word: '鳴る', reading: 'なる', meaning: 'To ring' },
      { word: '悲鳴', reading: 'ひめい', meaning: 'Scream' }
    ]
  },

  // N3 Level Puzzles
  {
    id: 'k6',
    kanji: '鮮',
    meaning: 'Fresh / Vivid',
    onyomi: ['セン (sen)'],
    kunyomi: ['あざ-やか (azayaka)'],
    radicals: ['魚', '羊'],
    radicalNames: ['Fish (魚)', 'Sheep (羊)'],
    mnemonic: 'Fresh fish from the sea paired with tender sheep meat represents peak freshness!',
    strokeCount: 17,
    level: 'N3',
    examples: [
      { word: '新鮮', reading: 'しんせん', meaning: 'Fresh' },
      { word: '鮮やか', reading: 'あざやか', meaning: 'Vivid' },
      { word: '鮮魚', reading: 'せんぎょ', meaning: 'Fresh fish' }
    ]
  },

  // N2 Level Puzzles
  {
    id: 'k7',
    kanji: '間',
    meaning: 'Interval / Space / Time',
    onyomi: ['カン (kan)', 'ケン (ken)'],
    kunyomi: ['あいだ (aida)', 'ま (ma)'],
    radicals: ['門', '日'],
    radicalNames: ['Gate (門)', 'Sun (日)'],
    mnemonic: 'Sunlight shining through the gap between double gate doors represents an interval of space and time.',
    strokeCount: 12,
    level: 'N2',
    examples: [
      { word: '時間', reading: 'じかん', meaning: 'Time' },
      { word: '人間', reading: 'にんげん', meaning: 'Human being' },
      { word: '空間', reading: 'くうかん', meaning: 'Space' }
    ]
  },
  {
    id: 'k8',
    kanji: '忘',
    meaning: 'Forget',
    onyomi: ['ボウ (bou)'],
    kunyomi: ['わす-れる (wasureru)'],
    radicals: ['亡', '心'],
    radicalNames: ['Dead (亡)', 'Heart (心)'],
    mnemonic: 'When something perishes from your heart and mind, you forget it.',
    strokeCount: 7,
    level: 'N2',
    examples: [
      { word: '忘れる', reading: 'わすれる', meaning: 'To forget' },
      { word: '忘れ物', reading: 'わすれもの', meaning: 'Lost item' },
      { word: '忘年会', reading: 'ぼうねんかい', meaning: 'Year-end party' }
    ]
  },

  // N1 Level Puzzles
  {
    id: 'k9',
    kanji: '話',
    meaning: 'Speak / Talk / Discourse',
    onyomi: ['ワ (wa)'],
    kunyomi: ['はな-す (hanasu)'],
    radicals: ['言', '舌'],
    radicalNames: ['Words (言)', 'Tongue (舌)'],
    mnemonic: 'Words articulated by the tongue form speech and thoughtful discourse.',
    strokeCount: 13,
    level: 'N1',
    examples: [
      { word: '対話', reading: 'たいわ', meaning: 'Dialogue / Discussion' },
      { word: '世話', reading: 'せわ', meaning: 'Care / Looking after' },
      { word: '話題', reading: 'わだい', meaning: 'Topic of discussion' }
    ]
  }
];
