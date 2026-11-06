import { JLPTLevel } from '../types';

export interface KanjiStrokeStep {
  /** 1-indexed stroke number */
  num: number;
  /** SVG path in a 0..100 x 0..100 coordinate viewBox */
  path: string;
  /** Starting X coordinate (0..100) */
  startX: number;
  /** Starting Y coordinate (0..100) */
  startY: number;
  /** Ending X coordinate (0..100) */
  endX: number;
  /** Ending Y coordinate (0..100) */
  endY: number;
  /** Short instruction on where to start and move */
  instruction: string;
  /** Which basic component/radical this stroke belongs to */
  componentLabel: string;
}

export interface KanjiBasicBlock {
  step: number;
  radical: string;
  name: string;
  strokeRange: string;
  startRule: string;
}

export interface KanjiWritingItem {
  id: string;
  kanji: string;
  meaning: string;
  meaningNe: string;
  onyomi: string[];
  kunyomi: string[];
  level: JLPTLevel;
  Complexity: 'Basic' | 'Intermediate' | 'Complex';
  strokeRuleSummary: string;
  basicBlocks: KanjiBasicBlock[];
  strokes: KanjiStrokeStep[];
  examples: Array<{ word: string; reading: string; meaning: string; meaningNe: string }>;
}

export const KANJI_WRITING_LIST: KanjiWritingItem[] = [
  // ======================== JLPT N5 (Basic -> Compound) ========================
  {
    id: 'kw_n5_ki',
    kanji: '木',
    meaning: 'Tree / Wood',
    meaningNe: 'रूख / काठ (Rukh / Kaath)',
    onyomi: ['モク (moku)', 'ボク (boku)'],
    kunyomi: ['き (ki)', 'こ (ko)'],
    level: 'N5',
    Complexity: 'Basic',
    strokeRuleSummary: 'Horizontal first (一), then vertical trunk through center (丨), then left sweep (ノ) and right sweep (乀).',
    basicBlocks: [
      {
        step: 1,
        radical: '十',
        name: 'Cross Trunk (Strokes 1–2)',
        strokeRange: '1–2',
        startRule: 'Start left-to-right horizontal bar, then top-to-bottom center trunk.'
      },
      {
        step: 2,
        radical: '八',
        name: 'Left & Right Roots (Strokes 3–4)',
        strokeRange: '3–4',
        startRule: 'Start from center intersection: sweep down-left first, then down-right.'
      }
    ],
    strokes: [
      {
        num: 1,
        path: 'M 20 36 L 80 36',
        startX: 20,
        startY: 36,
        endX: 80,
        endY: 36,
        instruction: 'Start left (20,36) and draw horizontal branch to the right →',
        componentLabel: 'Top Branch (一)'
      },
      {
        num: 2,
        path: 'M 50 14 L 50 88',
        startX: 50,
        startY: 14,
        endX: 50,
        endY: 88,
        instruction: 'Start top center (50,14) and pull straight down through the branch ↓',
        componentLabel: 'Center Trunk (丨)'
      },
      {
        num: 3,
        path: 'M 50 36 Q 36 60 16 78',
        startX: 50,
        startY: 36,
        endX: 16,
        endY: 78,
        instruction: 'Start at center junction (50,36) and sweep down to bottom-left ↙',
        componentLabel: 'Left Root (ノ)'
      },
      {
        num: 4,
        path: 'M 50 36 Q 64 60 84 78',
        startX: 50,
        startY: 36,
        endX: 84,
        endY: 78,
        instruction: 'Start at center junction (50,36) and sweep down to bottom-right ↘',
        componentLabel: 'Right Root (乀)'
      }
    ],
    examples: [
      { word: '木曜日', reading: 'もくようび', meaning: 'Thursday', meaningNe: 'बिहीबार' },
      { word: '大木', reading: 'たいぼく', meaning: 'Large tree', meaningNe: 'ठूलो रूख' }
    ]
  },
  {
    id: 'kw_n5_yasumu',
    kanji: '休',
    meaning: 'Rest / Holiday',
    meaningNe: 'आराम / बिदा (Aaram / Bida)',
    onyomi: ['キュウ (kyuu)'],
    kunyomi: ['やす-む (yasumu)'],
    level: 'N5',
    Complexity: 'Basic',
    strokeRuleSummary: 'Left-to-Right Rule: Always write the left Person radical (亻) first (2 strokes), then the right Tree (木) (4 strokes).',
    basicBlocks: [
      {
        step: 1,
        radical: '亻',
        name: 'Left: Person Radical (Strokes 1–2)',
        strokeRange: '1–2',
        startRule: 'Start top-left with slanted sweep (ノ), then vertical stem (丨) from its midpoint.'
      },
      {
        step: 2,
        radical: '木',
        name: 'Right: Tree Radical (Strokes 3–6)',
        strokeRange: '3–6',
        startRule: 'Write horizontal bar, vertical trunk, left root, then right root.'
      }
    ],
    strokes: [
      {
        num: 1,
        path: 'M 34 16 Q 24 38 12 56',
        startX: 34,
        startY: 16,
        endX: 12,
        endY: 56,
        instruction: 'Start top-left (34,16) and slant down-left for Person radical ↙',
        componentLabel: 'Person (亻)'
      },
      {
        num: 2,
        path: 'M 25 36 L 25 86',
        startX: 25,
        startY: 36,
        endX: 25,
        endY: 86,
        instruction: 'Start mid-slant (25,36) and draw vertical line straight down ↓',
        componentLabel: 'Person (亻)'
      },
      {
        num: 3,
        path: 'M 42 38 L 86 38',
        startX: 42,
        startY: 38,
        endX: 86,
        endY: 38,
        instruction: 'Start left of Tree (42,38) and draw horizontal line right →',
        componentLabel: 'Tree (木)'
      },
      {
        num: 4,
        path: 'M 64 14 L 64 88',
        startX: 64,
        startY: 14,
        endX: 64,
        endY: 88,
        instruction: 'Start top of Tree (64,14) and draw vertical trunk straight down ↓',
        componentLabel: 'Tree (木)'
      },
      {
        num: 5,
        path: 'M 64 38 Q 52 60 38 78',
        startX: 64,
        startY: 38,
        endX: 38,
        endY: 78,
        instruction: 'Start at trunk junction (64,38) and sweep down-left ↙',
        componentLabel: 'Tree (木)'
      },
      {
        num: 6,
        path: 'M 64 38 Q 76 60 90 78',
        startX: 64,
        startY: 38,
        endX: 90,
        endY: 78,
        instruction: 'Start at trunk junction (64,38) and sweep down-right ↘',
        componentLabel: 'Tree (木)'
      }
    ],
    examples: [
      { word: '休む', reading: 'やすむ', meaning: 'To rest', meaningNe: 'आराम गर्नु' },
      { word: '休日', reading: 'きゅうじつ', meaning: 'Holiday / Day off', meaningNe: 'बिदाको दिन' }
    ]
  },
  {
    id: 'kw_n5_akarui',
    kanji: '明',
    meaning: 'Bright / Clear',
    meaningNe: 'उज्यालो / स्पष्ट (Ujyalo / Spashta)',
    onyomi: ['メイ (mei)', 'ミョウ (myou)'],
    kunyomi: ['あか-るい (akarui)'],
    level: 'N5',
    Complexity: 'Intermediate',
    strokeRuleSummary: 'Box Enclosure Rule: Left Sun (日) first (left vertical, top-right hook, inner bar, bottom close), then Right Moon (月).',
    basicBlocks: [
      {
        step: 1,
        radical: '日',
        name: 'Left: Sun Box (Strokes 1–4)',
        strokeRange: '1–4',
        startRule: 'Start top-left vertical wall, then top-right corner hook, middle bar, bottom close.'
      },
      {
        step: 2,
        radical: '月',
        name: 'Right: Crescent Moon (Strokes 5–8)',
        strokeRange: '5–8',
        startRule: 'Start with left curved sweep, then top-right long hook and two inner bars.'
      }
    ],
    strokes: [
      {
        num: 1,
        path: 'M 16 26 L 16 74',
        startX: 16,
        startY: 26,
        endX: 16,
        endY: 74,
        instruction: 'Start top-left of Sun (16,26) and draw left vertical wall ↓',
        componentLabel: 'Sun (日)'
      },
      {
        num: 2,
        path: 'M 16 26 L 40 26 L 40 74',
        startX: 16,
        startY: 26,
        endX: 40,
        endY: 74,
        instruction: 'Start top-left (16,26), go right then turn straight down at corner ↱↓',
        componentLabel: 'Sun (日)'
      },
      {
        num: 3,
        path: 'M 16 49 L 40 49',
        startX: 16,
        startY: 49,
        endX: 40,
        endY: 49,
        instruction: 'Draw inner horizontal bar of Sun left-to-right →',
        componentLabel: 'Sun (日)'
      },
      {
        num: 4,
        path: 'M 16 74 L 40 74',
        startX: 16,
        startY: 74,
        endX: 40,
        endY: 74,
        instruction: 'Close bottom of Sun box left-to-right →',
        componentLabel: 'Sun (日)'
      },
      {
        num: 5,
        path: 'M 56 18 L 56 58 Q 55 76 44 88',
        startX: 56,
        startY: 18,
        endX: 44,
        endY: 88,
        instruction: 'Start top-left of Moon (56,18) and curve down-left at bottom ↙',
        componentLabel: 'Moon (月)'
      },
      {
        num: 6,
        path: 'M 56 18 L 84 18 L 84 84 L 76 78',
        startX: 56,
        startY: 18,
        endX: 76,
        endY: 78,
        instruction: 'Start top of Moon (56,18), go right, straight down, and hook up-left ↱↓',
        componentLabel: 'Moon (月)'
      },
      {
        num: 7,
        path: 'M 56 40 L 84 40',
        startX: 56,
        startY: 40,
        endX: 84,
        endY: 40,
        instruction: 'Draw upper inner bar of Moon left-to-right →',
        componentLabel: 'Moon (月)'
      },
      {
        num: 8,
        path: 'M 56 58 L 84 58',
        startX: 56,
        startY: 58,
        endX: 84,
        endY: 58,
        instruction: 'Draw lower inner bar of Moon left-to-right →',
        componentLabel: 'Moon (月)'
      }
    ],
    examples: [
      { word: '明日', reading: 'あした', meaning: 'Tomorrow', meaningNe: 'भोलि' },
      { word: '明るい', reading: 'あかるい', meaning: 'Bright / Cheerful', meaningNe: 'उज्यालो / हँसिलो' }
    ]
  },

  // ======================== JLPT N4 (Multi-Component) ========================
  {
    id: 'kw_n4_mori',
    kanji: '森',
    meaning: 'Deep Forest (12 Strokes)',
    meaningNe: 'घना जङ्गल (Ghana Jangal)',
    onyomi: ['シン (shin)'],
    kunyomi: ['もり (mori)'],
    level: 'N4',
    Complexity: 'Complex',
    strokeRuleSummary: 'Top-to-Bottom + Left-to-Right Pyramid: Start with Top Tree (木, 1–4), then Bottom-Left Tree (5–8), then Bottom-Right Tree (9–12).',
    basicBlocks: [
      {
        step: 1,
        radical: '木 (上)',
        name: '1st: Top Crown Tree (Strokes 1–4)',
        strokeRange: '1–4',
        startRule: 'Start at the top center (y=24) with a compact 4-stroke Tree (木).'
      },
      {
        step: 2,
        radical: '木 (左)',
        name: '2nd: Bottom-Left Tree (Strokes 5–8)',
        strokeRange: '5–8',
        startRule: 'Move to bottom-left quadrant and write the second 4-stroke Tree.'
      },
      {
        step: 3,
        radical: '木 (右)',
        name: '3rd: Bottom-Right Tree (Strokes 9–12)',
        strokeRange: '9–12',
        startRule: 'Finish in the bottom-right quadrant with a wide right sweep.'
      }
    ],
    strokes: [
      // Top Tree
      { num: 1, path: 'M 30 24 L 70 24', startX: 30, startY: 24, endX: 70, endY: 24, instruction: 'Top Tree: Horizontal branch left-to-right →', componentLabel: '1. Top Tree (木)' },
      { num: 2, path: 'M 50 10 L 50 46', startX: 50, startY: 10, endX: 50, endY: 46, instruction: 'Top Tree: Vertical trunk top-to-bottom ↓', componentLabel: '1. Top Tree (木)' },
      { num: 3, path: 'M 50 24 Q 36 36 22 44', startX: 50, startY: 24, endX: 22, endY: 44, instruction: 'Top Tree: Sweep left branch down-left ↙', componentLabel: '1. Top Tree (木)' },
      { num: 4, path: 'M 50 24 Q 64 36 78 44', startX: 50, startY: 24, endX: 78, endY: 44, instruction: 'Top Tree: Sweep right branch down-right ↘', componentLabel: '1. Top Tree (木)' },
      // Bottom-Left Tree
      { num: 5, path: 'M 14 62 L 46 62', startX: 14, startY: 62, endX: 46, endY: 62, instruction: 'Bottom-Left Tree: Horizontal bar left-to-right →', componentLabel: '2. Left Tree (木)' },
      { num: 6, path: 'M 30 48 L 30 90', startX: 30, startY: 48, endX: 30, endY: 90, instruction: 'Bottom-Left Tree: Vertical trunk straight down ↓', componentLabel: '2. Left Tree (木)' },
      { num: 7, path: 'M 30 62 Q 20 76 10 86', startX: 30, startY: 62, endX: 10, endY: 86, instruction: 'Bottom-Left Tree: Left root sweep ↙', componentLabel: '2. Left Tree (木)' },
      { num: 8, path: 'M 30 62 L 42 74', startX: 30, startY: 62, endX: 42, endY: 74, instruction: 'Bottom-Left Tree: Short right dot/stroke ↘', componentLabel: '2. Left Tree (木)' },
      // Bottom-Right Tree
      { num: 9, path: 'M 52 62 L 88 62', startX: 52, startY: 62, endX: 88, endY: 62, instruction: 'Bottom-Right Tree: Horizontal bar left-to-right →', componentLabel: '3. Right Tree (木)' },
      { num: 10, path: 'M 68 48 L 68 90', startX: 68, startY: 48, endX: 68, endY: 90, instruction: 'Bottom-Right Tree: Vertical trunk straight down ↓', componentLabel: '3. Right Tree (木)' },
      { num: 11, path: 'M 68 62 Q 56 76 46 86', startX: 68, startY: 62, endX: 46, endY: 86, instruction: 'Bottom-Right Tree: Left root sweep ↙', componentLabel: '3. Right Tree (木)' },
      { num: 12, path: 'M 68 62 Q 80 76 92 86', startX: 68, startY: 62, endX: 92, endY: 86, instruction: 'Bottom-Right Tree: Final sweeping right root ↘', componentLabel: '3. Right Tree (木)' }
    ],
    examples: [
      { word: '森林', reading: 'しんりん', meaning: 'Forest & woods', meaningNe: 'वनजङ्गल' },
      { word: '森', reading: 'もり', meaning: 'Deep forest', meaningNe: 'जङ्गल' }
    ]
  },

  // ======================== JLPT N3 (Complex Structure) ========================
  {
    id: 'kw_n3_kokoro',
    kanji: '念',
    meaning: 'Thought / Mindfulness / Wish',
    meaningNe: 'विचार / भावना / ध्यान (Bichar / Dhyan)',
    onyomi: ['ネン (nen)'],
    kunyomi: ['おも-う (omou)'],
    level: 'N3',
    Complexity: 'Complex',
    strokeRuleSummary: 'Top-to-Bottom Complex Kanji: Start at the apex with Now (今, Strokes 1–4), then anchor the Heart radical (心, Strokes 5–8) at the base.',
    basicBlocks: [
      {
        step: 1,
        radical: '今',
        name: '1st: Top Roof "Now" (今, Strokes 1–4)',
        strokeRange: '1–4',
        startRule: 'Start at the very top peak (50,12): sweep left, sweep right, inner bar, then hooked angle.'
      },
      {
        step: 2,
        radical: '心',
        name: '2nd: Bottom "Heart" (心, Strokes 5–8)',
        strokeRange: '5–8',
        startRule: 'Start bottom-left dot, then sweeping curved bowl, center dot, and outer right dot.'
      }
    ],
    strokes: [
      { num: 1, path: 'M 50 12 Q 32 28 14 42', startX: 50, startY: 12, endX: 14, endY: 42, instruction: 'Start at top apex (50,12) and sweep wide to the left ↙', componentLabel: '1. Top Now (今)' },
      { num: 2, path: 'M 50 12 Q 68 28 86 42', startX: 50, startY: 12, endX: 86, endY: 42, instruction: 'From top apex (50,12), sweep wide to the right ↘', componentLabel: '1. Top Now (今)' },
      { num: 3, path: 'M 36 34 L 64 34', startX: 36, startY: 34, endX: 64, endY: 34, instruction: 'Draw inner horizontal bar under roof →', componentLabel: '1. Top Now (今)' },
      { num: 4, path: 'M 28 46 L 70 46 L 54 60', startX: 28, startY: 46, endX: 54, endY: 60, instruction: 'Draw horizontal line and angle down-left ↱↙', componentLabel: '1. Top Now (今)' },
      { num: 5, path: 'M 20 70 L 14 82', startX: 20, startY: 70, endX: 14, endY: 82, instruction: 'Heart Radical: Start with left-most drop dot ↙', componentLabel: '2. Heart Base (心)' },
      { num: 6, path: 'M 32 68 Q 48 92 76 86 L 72 74', startX: 32, startY: 68, endX: 72, endY: 74, instruction: 'Sweep broad curved Heart base and hook up ⌣↑', componentLabel: '2. Heart Base (心)' },
      { num: 7, path: 'M 50 66 L 54 74', startX: 50, startY: 66, endX: 54, endY: 74, instruction: 'Place middle drop dot above the Heart curve ↘', componentLabel: '2. Heart Base (心)' },
      { num: 8, path: 'M 82 68 L 90 78', startX: 82, startY: 68, endX: 90, endY: 78, instruction: 'Finish with outer right drop dot ↘', componentLabel: '2. Heart Base (心)' }
    ],
    examples: [
      { word: '記念', reading: 'きねん', meaning: 'Commemoration / Memory', meaningNe: 'सम्झना / स्मृति' },
      { word: '残念', reading: 'ざんねん', meaning: 'Regrettable / Too bad', meaningNe: 'दुःखलाग्दो / अफसोस' }
    ]
  },

  // ======================== JLPT N2 (Enclosure + Inner Radical) ========================
  {
    id: 'kw_n2_aida',
    kanji: '間',
    meaning: 'Interval / Space / Time (12 Strokes)',
    meaningNe: 'समय / अन्तराल / बीच (Samaya / Bich)',
    onyomi: ['カン (kan)', 'ケン (ken)'],
    kunyomi: ['あいだ (aida)', 'ま (ma)'],
    level: 'N2',
    Complexity: 'Complex',
    strokeRuleSummary: 'Outer Gate First Rule: Always build the outer Gate (門, Strokes 1–8: Left Door 1–4, Right Door 5–8) BEFORE placing the Sun (日, Strokes 9–12) inside!',
    basicBlocks: [
      {
        step: 1,
        radical: '門 (左)',
        name: '1st: Left Gate Door (Strokes 1–4)',
        strokeRange: '1–4',
        startRule: 'Start top-left vertical post (stroke 1 down to bottom), then top-left shutter box.'
      },
      {
        step: 2,
        radical: '門 (右)',
        name: '2nd: Right Gate Door (Strokes 5–8)',
        strokeRange: '5–8',
        startRule: 'Write short left wall of right shutter, then long outer right post with bottom hook.'
      },
      {
        step: 3,
        radical: '日 (中)',
        name: '3rd: Inner Sun (日, Strokes 9–12)',
        strokeRange: '9–12',
        startRule: 'Place the 4-stroke Sun neatly inside the courtyard between the gate doors.'
      }
    ],
    strokes: [
      // Left Gate Door
      { num: 1, path: 'M 18 16 L 18 88', startX: 18, startY: 16, endX: 18, endY: 88, instruction: 'Left Gate: Long outer left vertical post straight down ↓', componentLabel: '1. Left Gate (門)' },
      { num: 2, path: 'M 18 16 L 42 16 L 42 42', startX: 18, startY: 16, endX: 42, endY: 42, instruction: 'Left Gate: Top bar and inner vertical corner ↱↓', componentLabel: '1. Left Gate (門)' },
      { num: 3, path: 'M 18 29 L 42 29', startX: 18, startY: 29, endX: 42, endY: 29, instruction: 'Left Gate: Middle shutter bar →', componentLabel: '1. Left Gate (門)' },
      { num: 4, path: 'M 18 42 L 42 42', startX: 18, startY: 42, endX: 42, endY: 42, instruction: 'Left Gate: Bottom shutter bar →', componentLabel: '1. Left Gate (門)' },
      // Right Gate Door
      { num: 5, path: 'M 58 16 L 58 42', startX: 58, startY: 16, endX: 58, endY: 42, instruction: 'Right Gate: Short inner vertical wall ↓', componentLabel: '2. Right Gate (門)' },
      { num: 6, path: 'M 58 16 L 82 16 L 82 88 L 74 82', startX: 58, startY: 16, endX: 74, endY: 82, instruction: 'Right Gate: Top bar, long right post down to bottom hook ↱↓', componentLabel: '2. Right Gate (門)' },
      { num: 7, path: 'M 58 29 L 82 29', startX: 58, startY: 29, endX: 82, endY: 29, instruction: 'Right Gate: Middle shutter bar →', componentLabel: '2. Right Gate (門)' },
      { num: 8, path: 'M 58 42 L 82 42', startX: 58, startY: 42, endX: 82, endY: 42, instruction: 'Right Gate: Bottom shutter bar →', componentLabel: '2. Right Gate (門)' },
      // Inner Sun
      { num: 9, path: 'M 38 54 L 38 82', startX: 38, startY: 54, endX: 38, endY: 82, instruction: 'Inner Sun: Left vertical wall ↓', componentLabel: '3. Inner Sun (日)' },
      { num: 10, path: 'M 38 54 L 62 54 L 62 82', startX: 38, startY: 54, endX: 62, endY: 82, instruction: 'Inner Sun: Top bar and right vertical wall ↱↓', componentLabel: '3. Inner Sun (日)' },
      { num: 11, path: 'M 38 68 L 62 68', startX: 38, startY: 68, endX: 62, endY: 68, instruction: 'Inner Sun: Middle horizontal bar →', componentLabel: '3. Inner Sun (日)' },
      { num: 12, path: 'M 38 82 L 62 82', startX: 38, startY: 82, endX: 62, endY: 82, instruction: 'Inner Sun: Close bottom bar →', componentLabel: '3. Inner Sun (日)' }
    ],
    examples: [
      { word: '時間', reading: 'じかん', meaning: 'Time / Hours', meaningNe: 'समय' },
      { word: '人間', reading: 'にんげん', meaning: 'Human being', meaningNe: 'मानिस / मानव' }
    ]
  },

  // ======================== JLPT N1 (13-Stroke Complex Discourse Kanji) ========================
  {
    id: 'kw_n1_hanasu',
    kanji: '話',
    meaning: 'Speak / Talk / Discourse (13 Strokes)',
    meaningNe: 'कुराकानी / बोल्नु (Kurakani / Bolnu)',
    onyomi: ['ワ (wa)'],
    kunyomi: ['はな-す (hanasu)', 'はなし (hanashi)'],
    level: 'N1',
    Complexity: 'Complex',
    strokeRuleSummary: 'Complex 13-Stroke Breakdown: 1) Left Speech Radical (言, Strokes 1–7, top-to-bottom), 2) Right Tongue Top (千, Strokes 8–10), 3) Bottom Mouth (口, Strokes 11–13).',
    basicBlocks: [
      {
        step: 1,
        radical: '言',
        name: '1st: Left Speech Radical (Strokes 1–7)',
        strokeRange: '1–7',
        startRule: 'Start top-left dot (1), wide bar (2), two short bars (3–4), then bottom Mouth box (5–7).'
      },
      {
        step: 2,
        radical: '千',
        name: '2nd: Right Top "Thousand" (千, Strokes 8–10)',
        strokeRange: '8–10',
        startRule: 'Sweep top-right slant leftwards (8), wide horizontal bar (9), then center vertical (10).'
      },
      {
        step: 3,
        radical: '口',
        name: '3rd: Bottom-Right Mouth (口, Strokes 11–13)',
        strokeRange: '11–13',
        startRule: 'Finish with the 3-stroke Mouth box at the bottom right.'
      }
    ],
    strokes: [
      // Left Speech Radical (言)
      { num: 1, path: 'M 24 14 L 30 22', startX: 24, startY: 14, endX: 30, endY: 22, instruction: 'Speech (言): Start with top-left drop dot ↘', componentLabel: '1. Speech (言)' },
      { num: 2, path: 'M 12 28 L 44 28', startX: 12, startY: 28, endX: 44, endY: 28, instruction: 'Speech (言): Wide horizontal bar left-to-right →', componentLabel: '1. Speech (言)' },
      { num: 3, path: 'M 16 40 L 40 40', startX: 16, startY: 40, endX: 40, endY: 40, instruction: 'Speech (言): First short horizontal bar →', componentLabel: '1. Speech (言)' },
      { num: 4, path: 'M 16 52 L 40 52', startX: 16, startY: 52, endX: 40, endY: 52, instruction: 'Speech (言): Second short horizontal bar →', componentLabel: '1. Speech (言)' },
      { num: 5, path: 'M 16 64 L 16 84', startX: 16, startY: 64, endX: 16, endY: 84, instruction: 'Speech (言): Bottom box left vertical ↓', componentLabel: '1. Speech (言)' },
      { num: 6, path: 'M 16 64 L 40 64 L 40 84', startX: 16, startY: 64, endX: 40, endY: 84, instruction: 'Speech (言): Bottom box top-right corner ↱↓', componentLabel: '1. Speech (言)' },
      { num: 7, path: 'M 16 84 L 40 84', startX: 16, startY: 84, endX: 40, endY: 84, instruction: 'Speech (言): Close bottom box →', componentLabel: '1. Speech (言)' },
      // Right Tongue (舌) -> Top 千
      { num: 8, path: 'M 80 16 Q 66 22 52 26', startX: 80, startY: 16, endX: 52, endY: 26, instruction: 'Tongue Top (千): Start top-right (80,16) and slant left ↙', componentLabel: '2. Tongue Top (千)' },
      { num: 9, path: 'M 48 42 L 90 42', startX: 48, startY: 42, endX: 90, endY: 42, instruction: 'Tongue Top (千): Wide horizontal bar left-to-right →', componentLabel: '2. Tongue Top (千)' },
      { num: 10, path: 'M 68 24 L 68 62', startX: 68, startY: 24, endX: 68, endY: 62, instruction: 'Tongue Top (千): Center vertical stem down to Mouth ↓', componentLabel: '2. Tongue Top (千)' },
      // Bottom Mouth (口)
      { num: 11, path: 'M 52 62 L 52 86', startX: 52, startY: 62, endX: 52, endY: 86, instruction: 'Bottom Mouth (口): Left vertical wall ↓', componentLabel: '3. Bottom Mouth (口)' },
      { num: 12, path: 'M 52 62 L 84 62 L 84 86', startX: 52, startY: 62, endX: 84, endY: 86, instruction: 'Bottom Mouth (口): Top bar and right wall ↱↓', componentLabel: '3. Bottom Mouth (口)' },
      { num: 13, path: 'M 52 86 L 84 86', startX: 52, startY: 86, endX: 84, endY: 86, instruction: 'Bottom Mouth (口): Final closing horizontal bar →', componentLabel: '3. Bottom Mouth (口)' }
    ],
    examples: [
      { word: '会話', reading: 'かいわ', meaning: 'Conversation', meaningNe: 'कुराकानी / संवाद' },
      { word: '電話', reading: 'でんわ', meaning: 'Telephone', meaningNe: 'टेलिफोन / फोन' }
    ]
  }
];
