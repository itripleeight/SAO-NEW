// Small deterministic PRNG so generated shapes and layouts look the same on every render and visit.
export const seededRandom = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Catmull-Rom through the points, as an open cubic Bézier path (for drizzles and lines).
export const openCurve = (points) => {
  const fmt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const at = (i) => points[Math.max(0, Math.min(points.length - 1, i))];
  let d = `M${fmt(points[0])}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`;
  }
  return d;
};

// Catmull-Rom through the points, as a closed cubic Bézier path.
export const closedCurve = (points) => {
  const n = points.length;
  const fmt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  let d = `M${fmt(points[0])}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`;
  }
  return `${d} Z`;
};

// Outline points of an ellipse with a wobbling radius, for sliced and torn food. `ruffle`
// alternates the radius point to point for frilly edges like lettuce; `taper` thins one end;
// `squareness` below 1 pushes the outline toward a rounded rectangle.
export const blobPoints = (rand, rx, ry, { points = 12, wobble = 0.22, ruffle = 0, taper = 0, squareness = 1 } = {}) =>
  Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * Math.PI * 2;
    const k = 1 - wobble / 2 + rand() * wobble + (i % 2 ? ruffle : -ruffle / 2);
    const thin = 1 - taper * (1 + Math.cos(angle)) * 0.5;
    const bend = (v) => Math.sign(v) * Math.abs(v) ** squareness;
    return [bend(Math.cos(angle)) * rx * k, bend(Math.sin(angle)) * ry * k * thin];
  });

export const blobPath = (rand, rx, ry, options) => closedCurve(blobPoints(rand, rx, ry, options));
