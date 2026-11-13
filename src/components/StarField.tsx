import { useEffect, useRef } from 'react';

type Star = { x: number; y: number; size: number; depth: number; phase: number; speed: number; sprite: number };
// Soft glowing motes that float slowly across the sky.
type Mote = { x: number; y: number; vx: number; vy: number; size: number; phase: number; sprite: number };

const STAR_COLORS = ['248, 250, 252', '226, 232, 240', '219, 234, 254', '191, 219, 254', '254, 243, 199', '253, 230, 138'];
const MOTE_COLORS = ['186, 230, 253', '196, 181, 253', '165, 243, 252', '254, 243, 199'];

// Frame budget: the sky moves slowly, so ~30 fps looks identical to 60/144 fps
// while costing a fraction of the CPU/GPU time on every device.
const FRAME_MS = 1000 / 30;

function mulberry(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pre-render a glowing dot once so each frame is just cheap drawImage calls. */
function makeSprite(rgb: string, core: number, glow: number) {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(core, `rgba(${rgb}, 0.9)`);
  grad.addColorStop(core + 0.05, `rgba(${rgb}, ${glow})`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;

    // The drift is very slow and gentle, so it runs on every device. Many
    // Windows laptops/desktops report "reduce motion" by default (Animation
    // effects off), which used to freeze the sky everywhere except phones.
    const starSprites = STAR_COLORS.map((c) => makeSprite(c, 0.12, 0.18));
    const moteSprites = MOTE_COLORS.map((c) => makeSprite(c, 0.06, 0.22));

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let motes: Mote[] = [];
    let band: HTMLCanvasElement | null = null;
    let frameId = 0;
    let scroll = window.scrollY;
    let running = false;

    const buildBand = () => {
      // A faint diagonal Milky Way band made of many tiny, dim stars, drawn once.
      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const g = off.getContext('2d');
      if (!g) return null;
      const rand = mulberry(7);
      const count = Math.min(1800, Math.round((width * height) / 1100));
      for (let i = 0; i < count; i++) {
        const t = rand();
        const spread = (rand() + rand() + rand() - 1.5) * height * 0.16;
        const x = t * width * 1.3 - width * 0.15;
        const y = height * 0.85 - t * height * 0.7 + spread;
        g.globalAlpha = 0.08 + rand() * 0.28;
        g.fillStyle = rand() > 0.8 ? '#fde68a' : '#cbd5e1';
        const s = rand() > 0.9 ? 1.2 : 0.7;
        g.fillRect(x, y, s, s);
      }
      return off;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rand = mulberry(2026);
      // Capped star count: dense enough to look rich, light enough for any device.
      const count = Math.round(Math.min(width < 768 ? 140 : 260, (width * height) / 6000));
      stars = Array.from({ length: count }, () => {
        const depth = rand();
        return {
          x: rand() * width,
          y: rand() * height,
          // Sprite diameter in CSS px (the bright core is ~1/4 of it).
          size: 2.5 + depth * depth * 8,
          depth,
          phase: rand() * Math.PI * 2,
          speed: 0.4 + rand() * 1.2,
          sprite: Math.floor(rand() * starSprites.length),
        };
      });
      const moteCount = width < 768 ? 10 : 18;
      motes = Array.from({ length: moteCount }, () => ({
        x: rand() * width,
        y: rand() * height,
        vx: (rand() - 0.5) * 8,
        vy: -3 - rand() * 6,
        size: 12 + rand() * 12,
        phase: rand() * Math.PI * 2,
        sprite: Math.floor(rand() * moteSprites.length),
      }));
      band = buildBand();
    };

    let lastTime = 0;
    const draw = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
      lastTime = time;
      const sec = time / 1000;

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      if (band) {
        const off = (scroll * 0.03) % height;
        ctx.drawImage(band, 0, -off, width, height);
        ctx.drawImage(band, 0, height - off, width, height);
      }

      // Drift speed scales with screen width so the motion feels the same on a
      // phone, a laptop and a large monitor.
      const driftScale = Math.max(1, width / 600);
      for (const s of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(sec * s.speed + s.phase);
        // Nearer stars drift more with scroll, giving gentle depth.
        let y = (s.y - scroll * (0.02 + s.depth * 0.12)) % height;
        if (y < 0) y += height;
        // Slow sideways drift, faster for nearer stars, for a living sky.
        let x = (s.x + sec * driftScale * (1 + s.depth * 4)) % width;
        if (x < 0) x += width;
        ctx.globalAlpha = (0.3 + s.depth * 0.7) * twinkle;
        const h = s.size / 2;
        ctx.drawImage(starSprites[s.sprite], x - h, y - h, s.size, s.size);
      }

      for (const m of motes) {
        m.x += m.vx * dt * driftScale;
        m.y += m.vy * dt * driftScale;
        if (m.y < -30) m.y = height + 30;
        if (m.x < -30) m.x = width + 30;
        else if (m.x > width + 30) m.x = -30;
        ctx.globalAlpha = 0.25 + 0.25 * Math.sin(sec / 1.4 + m.phase);
        const h = m.size / 2;
        ctx.drawImage(moteSprites[m.sprite], m.x - h, m.y - h, m.size, m.size);
      }
      ctx.globalAlpha = 1;
    };

    let last = -Infinity;
    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);
      if (time - last < FRAME_MS) return;
      last = time;
      draw(time);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      frameId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };
    // Fully stop the loop in background tabs (saves battery on laptops).
    const onVisibility = () => (document.hidden ? stop() : start());

    // Mobile browsers fire resize while the URL bar slides in and out; only
    // rebuild the sky for real size changes.
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth === width && Math.abs(window.innerHeight - height) < 160) return;
        resize();
      }, 150);
    };

    const onScroll = () => {
      scroll = window.scrollY;
    };

    resize();
    start();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep navy → indigo → faint nebula violet base gradient, in one layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_10%,rgba(30,64,175,0.30),transparent_60%),radial-gradient(ellipse_60%_50%_at_90%_35%,rgba(109,40,217,0.22),transparent_65%),radial-gradient(ellipse_70%_45%_at_60%_100%,rgba(14,116,144,0.18),transparent_70%),linear-gradient(160deg,#040817_0%,#0a1433_38%,#120f3a_68%,#070b22_100%)]" />
      {/* Slowly drifting aurora / nebula glows (GPU-composited transforms only) */}
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
      <div className="aurora aurora-c" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(2,4,15,0.5)_100%)]" />
    </div>
  );
}
