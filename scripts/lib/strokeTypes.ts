/**
 * KanjiVG kvg:type codes -> human-readable stroke names and instructions.
 * Codes are characters from Unicode's CJK Strokes block (U+31C0-U+31EF).
 * See https://kanjivg.tagaini.net/stroke-types.html
 */

export interface StrokeType {
  /** Short label, e.g. "horizontal" */
  name: string;
  /** Imperative instruction fragment, e.g. "draw straight across to the right" */
  action: string;
}

export const STROKE_TYPES: Record<string, StrokeType> = {
  '㇐': { name: 'horizontal', action: 'draw straight across to the right' },
  '㇑': { name: 'vertical', action: 'pull straight down' },
  '㇒': { name: 'left sweep', action: 'sweep down to the left' },
  '㇏': { name: 'right sweep', action: 'sweep down to the right, pressing at the end' },
  '㇔': { name: 'dot', action: 'make a short dot' },
  '㇀': { name: 'rise', action: 'flick up to the right' },
  '㇕': { name: 'across then down', action: 'go across, then turn sharply down' },
  '㇖': { name: 'across with hook', action: 'go across, then hook down-left' },
  '㇇': { name: 'across then sweep', action: 'go across, then sweep down-left' },
  '㇆': { name: 'across, down, hook', action: 'go across, turn down, finish with a hook to the left' },
  '㇚': { name: 'vertical with hook', action: 'pull down, then hook up-left' },
  '㇗': { name: 'down then across', action: 'pull down, then turn right' },
  '㇛': { name: 'sweep then dot', action: 'sweep down-left, then add a dot to the right' },
  '㇟': { name: 'down, curve, hook', action: 'pull down, curve right, then hook up' },
  '㇃': { name: 'slanted hook', action: 'curve down to the right, then hook up' },
  '㇁': { name: 'curved hook', action: 'curve downwards, finishing with a hook' },
  '㇂': { name: 'slanted hook', action: 'slant down-right, then hook up' },
  '㇄': { name: 'down then across', action: 'pull down, then turn across to the right' },
  '㇅': { name: 'across, down, across', action: 'go across, turn down, then across again' },
  '㇈': { name: 'across, down, curve, hook', action: 'go across, down, curve right and hook up' },
  '㇉': { name: 'down, across, hook', action: 'go down and across, finishing with a hook' },
  '㇋': { name: 'across, down, sweep', action: 'go across, turn down, then sweep left' },
  '㇙': { name: 'down then rise', action: 'pull down, then flick up to the right' },
  '㇜': { name: 'sweep then across', action: 'sweep down-left, then turn across' },
  '㇞': { name: 'down, across, down', action: 'pull down, across, then down again' },
  '㇡': { name: 'across, down, across, hook', action: 'go across and down twice, finishing with a hook' }
};

/**
 * Strips KanjiVG's modifier suffixes (`a`/`b`/`c`/`v`), alternative forms
 * (`㇔/㇀`) and the stray full-width `６` seen in a few files.
 */
export function normaliseStrokeType(raw: string | undefined): string {
  if (!raw) return '';
  return raw.split('/')[0].replace(/[a-zA-Z６]/g, '').trim();
}

export function describeStrokeType(raw: string | undefined): StrokeType {
  return STROKE_TYPES[normaliseStrokeType(raw)] ?? { name: 'stroke', action: 'follow the guide line' };
}

/** Which ninth of the 0-100 grid a point falls in, e.g. "top-left", "centre". */
export function regionName(x: number, y: number): string {
  const col = x < 33 ? 'left' : x < 67 ? 'centre' : 'right';
  const row = y < 33 ? 'top' : y < 67 ? 'middle' : 'bottom';
  if (row === 'middle' && col === 'centre') return 'the centre';
  if (col === 'centre') return `${row} centre`;
  if (row === 'middle') return `the ${col}`;
  return `${row}-${col}`;
}

const ARROWS: Array<{ max: number; arrow: string }> = [
  { max: 22.5, arrow: '→' }, { max: 67.5, arrow: '↘' }, { max: 112.5, arrow: '↓' },
  { max: 157.5, arrow: '↙' }, { max: 202.5, arrow: '←' }, { max: 247.5, arrow: '↖' },
  { max: 292.5, arrow: '↑' }, { max: 337.5, arrow: '↗' }
];

/** Compass arrow for the overall direction of a stroke (SVG y grows downwards). */
export function directionArrow(dx: number, dy: number): string {
  if (Math.hypot(dx, dy) < 2) return '•';
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const norm = (deg + 360) % 360;
  return (ARROWS.find(a => norm < a.max) ?? ARROWS[0]).arrow;
}
