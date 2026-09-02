/**
 * Geometry helpers for the Jengu character.
 * sphericalPanel: a rounded-rectangle patch lying on a sphere (the visor,
 * its rim and the face screen), with clean UVs for canvas textures.
 */
import * as THREE from 'three';

/** Map a point of the unit square onto a rounded rectangle (elliptical corner mapping). */
function squareToRounded(u: number, v: number, hw: number, hh: number, cf: number): [number, number] {
  const au = Math.abs(u);
  const av = Math.abs(v);
  const k = 1 - cf;
  if (au > k && av > k) {
    const a = (au - k) / cf;
    const b = (av - k) / cf;
    const a2 = a * Math.sqrt(1 - (b * b) / 2);
    const b2 = b * Math.sqrt(1 - (a * a) / 2);
    return [Math.sign(u) * (k + a2 * cf) * hw, Math.sign(v) * (k + b2 * cf) * hh];
  }
  return [u * hw, v * hh];
}

export function sphericalPanel(
  radius: number,
  halfW: number,
  halfH: number,
  cornerFraction: number,
  segX = 56,
  segY = 40
): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let iy = 0; iy <= segY; iy++) {
    const v = -1 + (2 * iy) / segY;
    for (let ix = 0; ix <= segX; ix++) {
      const u = -1 + (2 * ix) / segX;
      const [x, y] = squareToRounded(u, v, halfW, halfH, cornerFraction);
      const lon = x / radius;
      const lat = y / radius;
      pos.push(radius * Math.cos(lat) * Math.sin(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.cos(lon));
      uv.push(ix / segX, iy / segY);
    }
  }
  for (let iy = 0; iy < segY; iy++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iy * (segX + 1) + ix;
      const b = a + 1;
      const c = a + segX + 1;
      const d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Smooth lathe profile from control points (x = radius, y = height). */
export function smoothLathe(points: [number, number][], segments = 64, samples = 48): THREE.LatheGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)));
  const pts = curve.getPoints(samples).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  return new THREE.LatheGeometry(pts, segments);
}

/** The smooth profile curve (x = radius, y = height) shared by the torso and its waistcoat. */
export function profileCurve(points: [number, number][]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)));
}

/** Radius of a lathe profile at a given height, by table lookup. */
export function radiusAt(curve: THREE.CatmullRomCurve3, y: number): number {
  const pts = curve.getPoints(240);
  let best = pts[0];
  let bestD = Infinity;
  for (const p of pts) {
    const d = Math.abs(p.y - y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return Math.max(0, best.x);
}

/**
 * A waistcoat wrapped around a lathe profile: full circumference, straight hem,
 * and a V-neck cut into the front (+z). Returns geometry plus the neckline
 * points for trim.
 */
export function vestGeometry(
  curve: THREE.CatmullRomCurve3,
  yTop: number,
  yBottom: number,
  neckDepth: number,
  neckHalfAngle: number,
  offset: number,
  segTheta = 128,
  segV = 32
): { geometry: THREE.BufferGeometry; neckline: THREE.Vector3[] } {
  const pos: number[] = [];
  const idx: number[] = [];
  const neckline: THREE.Vector3[] = [];
  const topAt = (theta: number): number => {
    const w = Math.atan2(Math.sin(theta), Math.cos(theta));
    const f = Math.max(0, 1 - Math.abs(w) / neckHalfAngle);
    return yTop - neckDepth * f;
  };
  for (let it = 0; it <= segTheta; it++) {
    const theta = (it / segTheta) * Math.PI * 2;
    const top = topAt(theta);
    for (let iv = 0; iv <= segV; iv++) {
      const y = top + (yBottom - top) * (iv / segV);
      const r = radiusAt(curve, y) + offset;
      pos.push(r * Math.sin(theta), y, r * Math.cos(theta));
    }
  }
  for (let it = 0; it < segTheta; it++) {
    for (let iv = 0; iv < segV; iv++) {
      const a = it * (segV + 1) + iv;
      const b = a + segV + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const theta = -neckHalfAngle + (2 * neckHalfAngle * i) / steps;
    const y = topAt(theta);
    const r = radiusAt(curve, y) + offset + 0.012;
    neckline.push(new THREE.Vector3(r * Math.sin(theta), y, r * Math.cos(theta)));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setIndex(idx);
  geometry.computeVertexNormals();
  return { geometry, neckline };
}
