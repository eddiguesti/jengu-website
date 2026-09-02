/**
 * The face is drawn on a canvas every frame and shown through the glass
 * visor as an emissive screen: big glossy cyan eyes with pupils that track
 * the cursor, soft glow, blinks, and a set of expressions that blend:
 *  · happy    — squinting smile
 *  · hearts   — heart-shaped eyes (pulsing)
 *  · surprise — wide eyes, small pupils, round "o" mouth
 *  · dizzy    — spinning spiral pupils
 */
import * as THREE from 'three';

const W = 512;
const H = 384;

export interface Mood {
  hearts: number;
  surprise: number;
  dizzy: number;
  time: number;
}

const NEUTRAL: Mood = { hearts: 0, surprise: 0, dizzy: 0, time: 0 };

export class Face {
  readonly texture: THREE.CanvasTexture;
  private readonly ctx: CanvasRenderingContext2D;

  constructor() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    this.texture = new THREE.CanvasTexture(c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    this.draw({ x: 0, y: 0 }, 0, 0, NEUTRAL);
  }

  private heart(cx: number, cy: number, s: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.8);
    ctx.bezierCurveTo(cx - s * 1.15, cy + s * 0.05, cx - s * 0.7, cy - s * 0.8, cx, cy - s * 0.25);
    ctx.bezierCurveTo(cx + s * 0.7, cy - s * 0.8, cx + s * 1.15, cy + s * 0.05, cx, cy + s * 0.8);
    ctx.closePath();
  }

  /** look: -1..1 (x right, y up). blink: 0 open → 1 closed. happy: 0..1. */
  draw(look: { x: number; y: number }, blink: number, happy: number, mood: Mood = NEUTRAL): void {
    const ctx = this.ctx;
    const { hearts, surprise, dizzy, time } = mood;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#05060b';
    ctx.fillRect(0, 0, W, H);

    const r = W * 0.12 * (1 + surprise * 0.1);
    const eyeY = H * 0.47;
    const spread = W * 0.2;
    const px = look.x * r * 0.28;
    const py = -look.y * r * 0.22;

    [-1, 1].forEach((side) => {
      const cx = W / 2 + side * spread;
      ctx.save();
      ctx.translate(cx, eyeY);
      const open = 1 - Math.min(1, blink) * 0.94;
      ctx.scale(1, Math.max(0.06, open));

      // outer glow
      ctx.shadowColor = 'rgba(90,216,255,0.9)';
      ctx.shadowBlur = r * 0.9;

      const iris = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      iris.addColorStop(0, '#c6f4ff');
      iris.addColorStop(0.45, '#5ad8ff');
      iris.addColorStop(1, '#1c9fd6');
      ctx.fillStyle = iris;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // pupil (tracks the cursor; shrinks when surprised)
      const pr = r * 0.62 * (1 - happy * 0.15) * (1 - surprise * 0.45);
      const pupil = ctx.createRadialGradient(px, py, pr * 0.2, px, py, pr);
      pupil.addColorStop(0, '#0d1626');
      pupil.addColorStop(1, '#03060d');
      ctx.fillStyle = pupil;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();

      // dizzy spiral
      if (dizzy > 0.02) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, dizzy * 1.4);
        ctx.strokeStyle = '#7fe3ff';
        ctx.lineWidth = r * 0.07;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const turns = 2.6;
        const steps = 60;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const a = t * turns * Math.PI * 2 + time * 9 * side;
          const rad = t * pr * 0.9;
          const x = px + Math.cos(a) * rad;
          const y = py + Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // highlights
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.ellipse(px - pr * 0.42, py - pr * 0.42, pr * 0.3 * (1 + surprise * 0.5), pr * 0.24 * (1 + surprise * 0.5), -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(px + pr * 0.4, py + pr * 0.45, pr * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // heart eyes
      if (hearts > 0.02) {
        const pulse = 1 + 0.08 * Math.sin(time * 9);
        const s = r * 0.95 * Math.min(1, hearts * 1.2) * pulse;
        ctx.save();
        ctx.globalAlpha = Math.min(1, hearts * 1.5);
        ctx.shadowColor = 'rgba(255,110,160,0.9)';
        ctx.shadowBlur = r * 0.6;
        const g = ctx.createRadialGradient(-s * 0.3, -s * 0.3, s * 0.1, 0, 0, s * 1.2);
        g.addColorStop(0, '#ffb3cc');
        g.addColorStop(0.5, '#ff6b9d');
        g.addColorStop(1, '#e8407a');
        ctx.fillStyle = g;
        this.heart(0, 0, s);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(-s * 0.4, -s * 0.35, s * 0.2, s * 0.14, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // happy squint: a soft lid rising from below (not over heart eyes)
      const squint = happy * (1 - Math.min(1, hearts * 1.5));
      if (squint > 0.02) {
        ctx.fillStyle = '#05060b';
        ctx.beginPath();
        ctx.ellipse(0, r * (1.35 - squint * 0.75), r * 1.3, r * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // mouth: smile blending to a round "o" when surprised
    const sy = H * 0.7;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(90,216,255,0.8)';
    ctx.shadowBlur = W * 0.02;
    if (surprise < 0.98) {
      ctx.save();
      ctx.globalAlpha = 1 - surprise;
      const sw = W * (0.055 + happy * 0.03 + hearts * 0.02);
      ctx.strokeStyle = '#7fe3ff';
      ctx.lineWidth = W * 0.012;
      ctx.beginPath();
      ctx.moveTo(W / 2 - sw, sy);
      ctx.quadraticCurveTo(W / 2, sy + H * (0.07 + happy * 0.05 + hearts * 0.03), W / 2 + sw, sy);
      ctx.stroke();
      ctx.restore();
    }
    if (surprise > 0.02) {
      ctx.save();
      ctx.globalAlpha = surprise;
      ctx.strokeStyle = '#7fe3ff';
      ctx.lineWidth = W * 0.012;
      ctx.beginPath();
      ctx.ellipse(W / 2, sy + H * 0.03, W * 0.03 * surprise + W * 0.008, H * 0.045 * surprise + H * 0.01, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.shadowBlur = 0;

    // faint screen sheen
    const sheen = ctx.createLinearGradient(0, 0, W, H);
    sheen.addColorStop(0, 'rgba(255,255,255,0.05)');
    sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, W, H);

    this.texture.needsUpdate = true;
  }
}
