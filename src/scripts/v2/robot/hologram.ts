/**
 * Holographic dashboard that assembles beside the character as the visitor
 * scrolls: header, grid, bars growing, a revenue line drawing itself.
 * Additive-blended plane with a canvas texture redrawn on progress change.
 */
import * as THREE from 'three';

const W = 640;
const H = 440;

const BARS = [0.3, 0.42, 0.36, 0.55, 0.62, 0.5, 0.7, 0.78, 0.66, 0.84, 0.9, 0.97];
const LINE = [0.35, 0.4, 0.38, 0.5, 0.58, 0.55, 0.66, 0.74, 0.7, 0.8, 0.9, 0.96];

export class Hologram {
  readonly mesh: THREE.Mesh;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly texture: THREE.CanvasTexture;
  private readonly material: THREE.MeshBasicMaterial;
  private lastP = -1;
  private homeX = 0;

  constructor() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    this.texture = new THREE.CanvasTexture(c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.79), this.material);
    this.mesh.position.set(-2.55, -0.95, -0.35);
    this.mesh.rotation.y = 0.42;
    this.mesh.visible = false;
  }

  /** Keep the panel to the left of wherever the character rests. */
  setHome(x: number): void {
    this.homeX = x;
  }

  /** p: 0..1 build progress. t: time for flicker. */
  update(p: number, t: number): void {
    const vis = p > 0.001;
    this.mesh.visible = vis;
    if (!vis) return;
    const ease = 1 - Math.pow(1 - p, 3);
    const flicker = 0.92 + Math.sin(t * 23) * 0.04 + Math.sin(t * 7.3) * 0.04;
    this.material.opacity = Math.min(1, ease * 1.15) * flicker;
    this.mesh.position.x = this.homeX - 2.55 + (1 - ease) * 0.6;
    this.mesh.scale.setScalar(0.9 + ease * 0.1);
    if (Math.abs(p - this.lastP) < 0.004) return;
    this.lastP = p;
    this.drawPanel(ease);
  }

  private drawPanel(p: number): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    // panel body
    ctx.fillStyle = 'rgba(40,60,140,0.22)';
    roundRect(ctx, 4, 4, W - 8, H - 8, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(170,200,255,0.9)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(120,170,255,0.9)';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // header
    ctx.fillStyle = 'rgba(180,205,255,0.85)';
    roundRect(ctx, 28, 24, 190 * Math.min(1, p * 1.6), 16, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(120,230,255,0.9)';
    roundRect(ctx, W - 92, 24, 60, 16, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(170,200,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(24, 62);
    ctx.lineTo(W - 24, 62);
    ctx.stroke();

    // grid
    ctx.strokeStyle = 'rgba(170,200,255,0.18)';
    ctx.setLineDash([4, 6]);
    for (let i = 0; i < 4; i++) {
      const y = 100 + i * 70;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(W - 40, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // bars
    const baseY = H - 60;
    const chartH = 270;
    const step = (W - 80) / BARS.length;
    BARS.forEach((v, i) => {
      const h = v * chartH * Math.min(1, Math.max(0, p * 1.5 - i * 0.045));
      const x = 40 + i * step + step * 0.22;
      const g = ctx.createLinearGradient(0, baseY - h, 0, baseY);
      g.addColorStop(0, 'rgba(200,225,255,0.95)');
      g.addColorStop(1, 'rgba(120,150,255,0.25)');
      ctx.fillStyle = g;
      roundRect(ctx, x, baseY - h, step * 0.56, h, 5);
      ctx.fill();
    });

    // revenue line
    const lp = Math.max(0, (p - 0.25) / 0.75);
    if (lp > 0) {
      ctx.strokeStyle = 'rgba(255,190,255,0.95)';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(255,150,255,0.9)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      const n = LINE.length;
      const total = (n - 1) * lp;
      for (let i = 0; i < n; i++) {
        if (i > total + 1) break;
        const f = i <= total ? 1 : total - (i - 1);
        const prev = LINE[i - 1] ?? LINE[0];
        const v = i <= total ? LINE[i] : prev + (LINE[i] - prev) * f;
        const x = i <= total ? 40 + i * step + step / 2 : 40 + (i - 1 + f) * step + step / 2;
        const y = baseY - v * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (lp >= 1) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(40 + (n - 1) * step + step / 2, baseY - LINE[n - 1] * chartH, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // footer chip
    ctx.fillStyle = 'rgba(120,230,255,0.75)';
    roundRect(ctx, 28, H - 40, 120 * Math.min(1, p * 1.3), 12, 6);
    ctx.fill();

    this.texture.needsUpdate = true;
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, Math.max(0, w) / 2, Math.max(0, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}
