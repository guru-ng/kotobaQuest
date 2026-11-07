/**
 * Minimal SVG path handling for KanjiVG data.
 *
 * KanjiVG paths use only M/m and cubic curves (C/c/S/s) - verified across all
 * 6,984 non-variant files - so there's no need for a path-parsing dependency.
 */

export interface Point {
  x: number;
  y: number;
}

const NUM_RE = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

interface Segment {
  cmd: string;
  args: number[];
}

function tokenize(d: string): Segment[] {
  const segments: Segment[] = [];
  const re = /([MmCcSs])([^MmCcSsZz]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d)) !== null) {
    const args = (m[2].match(NUM_RE) ?? []).map(parseFloat);
    segments.push({ cmd: m[1], args });
  }
  return segments;
}

/**
 * Multiplies every coordinate in a path by `factor` (valid because every
 * command KanjiVG uses is linear).
 *
 * Numbers are re-emitted with explicit commas rather than patched in place:
 * rounding can turn `-0.04` into `-0.0` and then `0`, and without a separator
 * that silently merges two arguments into one and corrupts the curve.
 */
export function scalePath(d: string, factor: number, precision = 1): string {
  return tokenize(d)
    .map(({ cmd, args }) => {
      const scaled = args.map(n => {
        const v = Number((n * factor).toFixed(precision));
        return Object.is(v, -0) ? 0 : v;
      });
      return `${cmd}${scaled.join(',')}`;
    })
    .join('');
}

/** Arguments per command, used to check a path is well formed. */
const ARITY: Record<string, number> = { M: 2, C: 6, S: 4 };

/** True when every command carries a whole number of argument groups. */
export function isValidPath(d: string): boolean {
  const segs = tokenize(d);
  if (segs.length === 0 || !/^[Mm]$/.test(segs[0].cmd)) return false;
  return segs.every(({ cmd, args }) => {
    const n = ARITY[cmd.toUpperCase()];
    return n !== undefined && args.length > 0 && args.length % n === 0;
  });
}

/**
 * Walks a path and returns evenly spaced sample points along it, plus its
 * start and end. Samples are flattened cubic Beziers, which is enough for
 * drawing guides and for comparing against what the learner traced.
 */
export function samplePath(d: string, samplesPerCurve = 8): Point[] {
  const points: Point[] = [];
  let cur: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };
  let prevCtrl: Point | null = null;

  const cubic = (p0: Point, c1: Point, c2: Point, p1: Point) => {
    for (let s = 1; s <= samplesPerCurve; s++) {
      const t = s / samplesPerCurve;
      const u = 1 - t;
      points.push({
        x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
        y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y
      });
    }
  };

  for (const { cmd, args } of tokenize(d)) {
    const rel = cmd === cmd.toLowerCase();

    if (cmd === 'M' || cmd === 'm') {
      for (let i = 0; i + 1 < args.length; i += 2) {
        const p = rel ? { x: cur.x + args[i], y: cur.y + args[i + 1] } : { x: args[i], y: args[i + 1] };
        cur = p;
        if (i === 0) {
          start = p;
          points.push(p);
        } else {
          points.push(p); // implicit lineto
        }
      }
      prevCtrl = null;
      continue;
    }

    if (cmd === 'C' || cmd === 'c') {
      for (let i = 0; i + 5 < args.length; i += 6) {
        const c1 = rel ? { x: cur.x + args[i], y: cur.y + args[i + 1] } : { x: args[i], y: args[i + 1] };
        const c2 = rel ? { x: cur.x + args[i + 2], y: cur.y + args[i + 3] } : { x: args[i + 2], y: args[i + 3] };
        const p1 = rel ? { x: cur.x + args[i + 4], y: cur.y + args[i + 5] } : { x: args[i + 4], y: args[i + 5] };
        cubic(cur, c1, c2, p1);
        prevCtrl = c2;
        cur = p1;
      }
      continue;
    }

    if (cmd === 'S' || cmd === 's') {
      for (let i = 0; i + 3 < args.length; i += 4) {
        // First control point is the reflection of the previous one
        const c1 = prevCtrl ? { x: 2 * cur.x - prevCtrl.x, y: 2 * cur.y - prevCtrl.y } : { ...cur };
        const c2 = rel ? { x: cur.x + args[i], y: cur.y + args[i + 1] } : { x: args[i], y: args[i + 1] };
        const p1 = rel ? { x: cur.x + args[i + 2], y: cur.y + args[i + 3] } : { x: args[i + 2], y: args[i + 3] };
        cubic(cur, c1, c2, p1);
        prevCtrl = c2;
        cur = p1;
      }
      continue;
    }
  }

  if (points.length === 0) points.push(start);
  return points;
}

export const pathStart = (d: string): Point => samplePath(d, 1)[0];

export function pathEnd(d: string): Point {
  const pts = samplePath(d, 1);
  return pts[pts.length - 1];
}
