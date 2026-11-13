import QRCode from 'qrcode';

// Layout is designed on a 1600 x 1131 grid (A4 landscape ratio, 1 : sqrt 2)
// and rendered at RENDER_SCALE for print quality: 3520 x 2488 px is ~300 DPI
// on A4 while staying well under mobile Safari's canvas size limit.
const WIDTH = 1600;
const HEIGHT = 1131;
const RENDER_SCALE = 2.2;
const PASS_RATIO = 0.75;

const NAVY = '#0b1d3a';
const GOLD = '#b8860b';
const GOLD_TEXT = '#92400e';
const SLATE = '#334155';
const MUTED = '#64748b';

const PAPER = '#fffdf8';

// Formal certificate typography: Cinzel (classical Roman capitals) for the
// title, Cormorant Garamond for names, Lato for supporting text.
const TITLE = 'Cinzel, "Times New Roman", serif';
const SERIF = '"Cormorant Garamond", Garamond, Georgia, serif';
const SANS = 'Lato, "Helvetica Neue", Arial, sans-serif';

export function isCertificateEligible(score: number, total: number) {
  return score >= total * PASS_RATIO;
}

export type CertificateText = {
  heading: string;
  presented: string;
  body: string;
  date: string;
  org: string;
  signerName: string;
  signerTitle: string;
  certIdLabel: string;
  /** Text printed on the ink stamp (first "•" segment on top, rest at the bottom) over the signature. */
  stamp?: string;
};

export type CertificateInput = {
  name: string;
  dateText: string;
  certificateId: string;
  verifyUrl: string;
  text: CertificateText;
  /** Output resolution multiplier; lower values make fast on-screen previews. */
  scale?: number;
};

// Resolve public assets against Vite's base URL so the paths stay correct on
// every page (/, /verify, nested routes) and under a non-root deploy base.
function assetUrl(file: string) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}${file}`;
}

const LOGO_SRC = assetUrl('ariju-vii-logo.png');
const SIGNATURE_SRC = assetUrl('ariju-signature.png');
const ASSET_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

// Never rejects: a missing or broken image is skipped instead of failing the
// whole certificate. Same-origin images keep the canvas untainted so it can
// still be exported.
function loadImage(src: string): Promise<HTMLImageElement | null> {
  const load = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null);
    image.onerror = () => resolve(null);
    image.src = src;
  });
  return withTimeout(load, ASSET_TIMEOUT_MS, null);
}

// Fonts are optional: fall back to the system fonts in the font stack when
// the web fonts can't be loaded (offline, blocked, old browser).
const CERT_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500&family=Lato:wght@400;700&display=swap';

// The certificate fonts are only needed here, so their stylesheet is added on
// demand instead of slowing down the first page load for every visitor.
function ensureCertificateFontsStylesheet(): Promise<void> {
  if (document.querySelector(`link[href="${CERT_FONTS_HREF}"]`)) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CERT_FONTS_HREF;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

async function loadFonts() {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  await withTimeout(ensureCertificateFontsStylesheet(), ASSET_TIMEOUT_MS, undefined);
  const specs = [
    '600 72px Cinzel',
    '700 72px Cinzel',
    '600 72px "Cormorant Garamond"',
    '700 72px "Cormorant Garamond"',
    'italic 500 32px "Cormorant Garamond"',
    '400 32px Lato',
    '700 32px Lato',
  ];
  await withTimeout(
    Promise.allSettled(specs.map((spec) => document.fonts.load(spec))),
    ASSET_TIMEOUT_MS,
    []
  );
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const fromDataUrl = () => {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const bytes = atob(dataUrl.split(',')[1] ?? '');
        const buffer = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
        resolve(new Blob([buffer], { type: 'image/png' }));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Gagal membuat gambar'));
      }
    };
    if (typeof canvas.toBlob !== 'function') {
      fromDataUrl();
      return;
    }
    try {
      canvas.toBlob((blob) => (blob ? resolve(blob) : fromDataUrl()), 'image/png');
    } catch {
      fromDataUrl();
    }
  });
}

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number, family: string, italic = false) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  family: string,
  maxSize: number,
  maxWidth: number
) {
  let size = maxSize;
  do {
    setFont(ctx, weight, size, family);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  } while (size > 24);
  return size;
}

function drawCornerOrnament(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  // Classic L-shaped bracket with a small diamond, mirrored per corner.
  const len = 70;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + dy * len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + dx * len, y);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + dx * 12, y + dy * (len - 18));
  ctx.lineTo(x + dx * 12, y + dy * 12);
  ctx.lineTo(x + dx * (len - 18), y + dy * 12);
  ctx.stroke();
  const cx = x + dx * 26;
  const cy = y + dy * 26;
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 7);
  ctx.lineTo(cx + 7, cy);
  ctx.lineTo(cx, cy + 7);
  ctx.lineTo(cx - 7, cy);
  ctx.closePath();
  ctx.fill();
}

function drawFrame(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 14;
  ctx.strokeRect(36, 36, WIDTH - 72, HEIGHT - 72);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(62, 62, WIDTH - 124, HEIGHT - 124);
  ctx.lineWidth = 1;
  ctx.strokeRect(72, 72, WIDTH - 144, HEIGHT - 144);

  const inset = 88;
  drawCornerOrnament(ctx, inset, inset, 1, 1);
  drawCornerOrnament(ctx, WIDTH - inset, inset, -1, 1);
  drawCornerOrnament(ctx, inset, HEIGHT - inset, 1, -1);
  drawCornerOrnament(ctx, WIDTH - inset, HEIGHT - inset, -1, -1);
}

type SpacingContext = CanvasRenderingContext2D & { letterSpacing?: string };

// Draws centered text with optional tracking. The canvas letterSpacing API
// adds space after the last glyph too, so shift by half the spacing to keep
// the text visually centered. Browsers without the API just draw it untracked.
function drawTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const spaced = ctx as SpacingContext;
  if (spacing > 0 && 'letterSpacing' in spaced) {
    spaced.letterSpacing = `${spacing}px`;
    ctx.fillText(text, x + spacing / 2, y);
    spaced.letterSpacing = '0px';
  } else {
    ctx.fillText(text, x, y);
  }
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  if (!logo) return;
  const logoWidth = 380;
  const logoHeight = (logo.naturalHeight / logo.naturalWidth) * logoWidth;
  // Full-color logo, drawn as-is on its transparent background.
  // Vertically centred in the space between the inner frame and the header text.
  ctx.drawImage(logo, (WIDTH - logoWidth) / 2, 130, logoWidth, logoHeight);
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.lineWidth = 1.5;
  ctx.moveTo(WIDTH / 2 - 220, y);
  ctx.lineTo(WIDTH / 2 - 22, y);
  ctx.moveTo(WIDTH / 2 + 22, y);
  ctx.lineTo(WIDTH / 2 + 220, y);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, y - 8);
  ctx.lineTo(WIDTH / 2 + 8, y);
  ctx.lineTo(WIDTH / 2, y + 8);
  ctx.lineTo(WIDTH / 2 - 8, y);
  ctx.closePath();
  ctx.fill();
}

function drawQrCode(ctx: CanvasRenderingContext2D, data: string, centerX: number, top: number, size: number) {
  let qr: ReturnType<typeof QRCode.create>;
  try {
    qr = QRCode.create(data, { errorCorrectionLevel: 'M' });
  } catch (err) {
    console.warn('QR code could not be generated', err);
    return;
  }
  const count = qr.modules.size;
  const padding = 8;
  const moduleSize = (size - padding * 2) / count;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(centerX - size / 2, top, size, size);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(centerX - size / 2, top, size, size);

  ctx.fillStyle = NAVY;
  const originX = centerX - size / 2 + padding;
  const originY = top + padding;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.modules.get(row, col)) continue;
      const x = originX + col * moduleSize;
      const y = originY + row * moduleSize;
      // Slight overlap avoids hairline gaps between modules when scaled.
      ctx.fillRect(x, y, moduleSize + 0.5, moduleSize + 0.5);
    }
  }
}

const STAMP_INK = [18, 66, 186] as const; // clear royal-blue ink, bold like an official seal

// Tiny deterministic PRNG so the stamp's ink texture is identical on every
// download instead of changing randomly each time.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function star5(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + rad * Math.cos(a);
    const py = y + rad * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// Draws text along a circle. Top text reads clockwise over the top; bottom
// text reads left-to-right along the bottom with upright letters.
function arcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  top: boolean,
  startSize: number,
  maxAngle: number
) {
  let size = startSize;
  let spacing = 0;
  let total = 0;
  const measure = () => {
    setFont(ctx, 900, size, SANS);
    spacing = size * 0.12;
    total = 0;
    for (const ch of text) total += ctx.measureText(ch).width + spacing;
    total -= spacing;
  };
  measure();
  while (total / radius > maxAngle && size > startSize * 0.55) {
    size -= 0.25;
    measure();
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const span = total / radius;
  let angle = top ? -Math.PI / 2 - span / 2 : Math.PI / 2 + span / 2;
  for (const ch of text) {
    const cw = ctx.measureText(ch).width;
    const step = (cw / 2) / radius;
    angle += top ? step : -step;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.rotate(top ? angle + Math.PI / 2 : angle - Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    const next = (cw / 2 + spacing) / radius;
    angle += top ? next : -next;
  }
}

// Builds a single-colour round seal in the style of an official space-agency
// insignia: heavy double rim with curved lettering, and a solid starfield
// disc holding a planet, an orbit ring and a swooping vector wing.
function buildStamp(rimText: string, size: number, scale: number) {
  const px = Math.round(size * scale);
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(scale, scale);
  const S = size;
  const c = S / 2;
  const ink = `rgb(${STAMP_INK.join(',')})`;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const ring = (r: number, lw: number) => {
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  };
  // Heavy outer rim + thin inner rim.
  ring(S * 0.468, S * 0.058);
  ring(S * 0.374, S * 0.022);

  // Curved lettering: long title over the top, short name at the bottom.
  const parts = rimText
    .toUpperCase()
    .split('•')
    .map((p) => p.trim())
    .filter(Boolean);
  const bottomText = parts[0] ?? 'ARIJU-VII';
  const topText = parts.slice(1).join(' • ') || 'VERIFIED CERTIFICATE';
  const textR = S * 0.412;
  arcText(ctx, topText, c, c, textR, true, S * 0.068, Math.PI * 0.8);
  arcText(ctx, bottomText, c, c, textR, false, S * 0.074, Math.PI * 0.45);
  // Separator stars on the left and right of the rim.
  star5(ctx, c - textR, c, S * 0.028);
  star5(ctx, c + textR, c, S * 0.028);

  // Solid central disc (the "sky").
  const discR = S * 0.345;
  ctx.beginPath();
  ctx.arc(c, c, discR, 0, Math.PI * 2);
  ctx.fill();

  // Planet, orbit and vector geometry (relative to the disc centre).
  const pX = c - S * 0.01;
  const pY = c + S * 0.015;
  const pR = S * 0.165;
  const orbitTilt = (-22 * Math.PI) / 180;
  const orbitRx = S * 0.3;
  const orbitRy = S * 0.085;
  const orbitLw = S * 0.016;

  // Knock out a field of stars in the sky, away from the planet.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  const rand = mulberry32(42);
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (discR - S * 0.03);
    const sx = c + r * Math.cos(a);
    const sy = c + r * Math.sin(a);
    if (Math.hypot(sx - pX, sy - pY) < pR + S * 0.03) continue;
    const big = rand() < 0.22;
    if (big) {
      star5(ctx, sx, sy, S * (0.014 + rand() * 0.008));
    } else {
      ctx.beginPath();
      ctx.arc(sx, sy, S * (0.004 + rand() * 0.004), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Orbit ring and small satellite (knocked out of the sky).
  ctx.lineWidth = orbitLw;
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(pX, pY, orbitRx, orbitRy, orbitTilt, 0, Math.PI * 2);
  ctx.stroke();
  const satA = Math.PI * 1.15;
  const satX = pX + orbitRx * Math.cos(satA) * Math.cos(orbitTilt) - orbitRy * Math.sin(satA) * Math.sin(orbitTilt);
  const satY = pY + orbitRx * Math.cos(satA) * Math.sin(orbitTilt) + orbitRy * Math.sin(satA) * Math.cos(orbitTilt);
  ctx.beginPath();
  ctx.arc(satX, satY, S * 0.022, 0, Math.PI * 2);
  ctx.fill();

  // Planet (knocked out to paper).
  ctx.beginPath();
  ctx.arc(pX, pY, pR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front half of the orbit passes over the planet in ink.
  ctx.save();
  ctx.beginPath();
  ctx.arc(pX, pY, pR - S * 0.012, 0, Math.PI * 2);
  ctx.clip();
  ctx.lineWidth = orbitLw;
  ctx.beginPath();
  ctx.ellipse(pX, pY, orbitRx, orbitRy, orbitTilt, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  // Swooping forked vector wing across the planet, cut out to paper; an
  // ink outline keeps its edge visible where it crosses the pale planet
  // (kept inside the disc so the outline never prints on the rim gap).
  const u = S;
  const wing = () => {
    ctx.beginPath();
    ctx.moveTo(c - 0.31 * u, c + 0.0 * u);
    ctx.quadraticCurveTo(c - 0.02 * u, c - 0.06 * u, c + 0.28 * u, c - 0.175 * u);
    ctx.quadraticCurveTo(c + 0.02 * u, c + 0.04 * u, c - 0.12 * u, c + 0.25 * u);
    ctx.quadraticCurveTo(c - 0.07 * u, c + 0.13 * u, c - 0.03 * u, c + 0.055 * u);
    ctx.quadraticCurveTo(c - 0.17 * u, c + 0.03 * u, c - 0.31 * u, c + 0.0 * u);
    ctx.closePath();
  };
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  wing();
  ctx.fill();
  ctx.restore();
  // Ink on ink is invisible over the sky, so only the planet shows the edge.
  ctx.strokeStyle = ink;
  ctx.lineWidth = S * 0.016;
  wing();
  ctx.stroke();

  // Light wear: subtle uneven pressure and a few specks, but still bold.
  try {
    const img = ctx.getImageData(0, 0, px, px);
    const d = img.data;
    const wear = mulberry32(7);
    const fadeAngle = wear() * Math.PI * 2;
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const i = (y * px + x) * 4;
        if (d[i + 3] === 0) continue;
        const dx = x / px - 0.5;
        const dy = y / px - 0.5;
        const side = 0.95 + 0.05 * Math.cos(Math.atan2(dy, dx) - fadeAngle);
        const grain = 0.93 + 0.07 * wear();
        d[i + 3] = Math.round(d[i + 3] * side * grain);
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 160; i++) {
      const r = (0.3 + wear() * 1.0) * scale;
      ctx.globalAlpha = 0.25 + wear() * 0.45;
      ctx.beginPath();
      ctx.arc(wear() * px, wear() * px, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } catch (err) {
    console.warn('Stamp texture could not be applied', err);
  }
  return canvas;
}

function drawStamp(ctx: CanvasRenderingContext2D, rimText: string, cx: number, cy: number, size: number, scale: number) {
  const stamp = buildStamp(rimText, size, scale);
  if (!stamp) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-10 * Math.PI) / 180);
  // Bold, clearly visible impression; multiply keeps the signature showing through.
  ctx.globalAlpha = 0.95;
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(stamp, -size / 2, -size / 2, size, size);
  ctx.restore();
}

// Draws the signature PNG at its natural, fine stroke width (no thickening),
// recoloured to a single deep-navy ink so it reads cleanly on the paper.
const SIGNATURE_INK = '#0a1a3f';

function drawSignature(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scaleX = ctx.getTransform().a || 1;
  const tint = document.createElement('canvas');
  tint.width = Math.max(1, Math.round(w * scaleX));
  tint.height = Math.max(1, Math.round(h * scaleX));
  const tctx = tint.getContext('2d');
  if (!tctx) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  tctx.scale(scaleX, scaleX);
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(img, 0, 0, w, h);
  tctx.globalCompositeOperation = 'source-in';
  tctx.fillStyle = SIGNATURE_INK;
  tctx.fillRect(0, 0, w, h);
  ctx.drawImage(tint, x, y, w, h);
}

export async function renderCertificate({
  name,
  dateText,
  certificateId,
  verifyUrl,
  text,
  scale = RENDER_SCALE,
}: CertificateInput): Promise<HTMLCanvasElement> {
  const [, logo, signature] = await Promise.all([loadFonts(), loadImage(LOGO_SRC), loadImage(SIGNATURE_SRC)]);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(WIDTH * scale);
  canvas.height = Math.round(HEIGHT * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak tersedia');
  ctx.scale(canvas.width / WIDTH, canvas.height / HEIGHT);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawFrame(ctx);
  drawLogo(ctx, logo);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const centerX = WIDTH / 2;

  // Header: event, title, divider
  ctx.fillStyle = GOLD_TEXT;
  let orgSize = 24;
  setFont(ctx, 700, orgSize, SANS);
  while (orgSize > 16 && ctx.measureText(text.org).width + text.org.length * 1.5 > 1240) {
    orgSize -= 1;
    setFont(ctx, 700, orgSize, SANS);
  }
  drawTracked(ctx, text.org, centerX, 318, 1.5);

  ctx.fillStyle = NAVY;
  const headingText = text.heading.toUpperCase();
  const headingSize = fitFontSize(ctx, headingText, 600, TITLE, 74, 1240);
  setFont(ctx, 600, headingSize, TITLE);
  drawTracked(ctx, headingText, centerX, 392, 4);

  drawDivider(ctx, 450);

  // Recipient
  ctx.fillStyle = SLATE;
  setFont(ctx, 500, 36, SERIF, true);
  ctx.fillText(text.presented, centerX, 510);

  const nameSize = fitFontSize(ctx, name, 700, SERIF, 108, 1100);
  ctx.fillStyle = NAVY;
  setFont(ctx, 700, nameSize, SERIF);
  ctx.fillText(name, centerX, 600);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 420, 664);
  ctx.lineTo(centerX + 420, 664);
  ctx.stroke();

  ctx.fillStyle = SLATE;
  setFont(ctx, 400, fitFontSize(ctx, text.body, 400, SANS, 28, 1400), SANS);
  ctx.fillText(text.body, centerX, 722);

  // Bottom row: three aligned columns (date | QR + certificate ID | signature).
  // Content sits above the rule at LINE_Y; captions sit below it.
  const LINE_Y = 950;
  const CAPTION_Y = 988;
  const SUBCAPTION_Y = 1022;
  const dateCenter = 350;
  const signerCenter = WIDTH - 350;
  const columnHalf = 220;

  const drawRule = (x: number, width = 2) => {
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - columnHalf, LINE_Y);
    ctx.lineTo(x + columnHalf, LINE_Y);
    ctx.stroke();
  };

  // Left column: date
  ctx.fillStyle = NAVY;
  const dateSize = fitFontSize(ctx, dateText, 600, SERIF, 38, 400);
  setFont(ctx, 600, dateSize, SERIF);
  ctx.fillText(dateText, dateCenter, LINE_Y - 30);
  drawRule(dateCenter);
  ctx.fillStyle = MUTED;
  setFont(ctx, 700, 18, SANS);
  drawTracked(ctx, text.date.toUpperCase(), dateCenter, CAPTION_Y, 4);

  // Right column: signature, then signer name (bold) and title (regular)
  if (signature) {
    // The source PNG is tightly trimmed around the ink (transparent
    // background), so draw it whole at the same visual height as before,
    // with the strokes sitting right on the rule above the signer name.
    const signatureHeight = 150;
    const ratio = signature.naturalWidth / signature.naturalHeight;
    const signatureWidth = Math.min(ratio * signatureHeight, 400);
    const drawnHeight = signatureWidth / ratio;
    drawSignature(
      ctx,
      signature,
      signerCenter - signatureWidth / 2,
      LINE_Y + 2 - drawnHeight,
      signatureWidth,
      drawnHeight,
    );
  }
  // Thin signing line, identical to the date rule on the left.
  drawRule(signerCenter);

  // Faded ink stamp pressed over the signature, slightly off-centre.
  drawStamp(ctx, text.stamp ?? 'ARIJU-VII • VERIFIED CERTIFICATE •', signerCenter + 100, LINE_Y - 85, 205, scale);

  ctx.fillStyle = NAVY;
  const signerSize = fitFontSize(ctx, text.signerName, 700, SERIF, 34, 440);
  setFont(ctx, 700, signerSize, SERIF);
  ctx.fillText(text.signerName, signerCenter, CAPTION_Y);

  ctx.fillStyle = SLATE;
  const titleSize = fitFontSize(ctx, text.signerTitle, 400, SANS, 20, 460);
  setFont(ctx, 400, titleSize, SANS);
  ctx.fillText(text.signerTitle, signerCenter, SUBCAPTION_Y);

  // Center column: QR code linking to the verification page + certificate ID
  const qrSize = 124;
  drawQrCode(ctx, verifyUrl, centerX, 800, qrSize);

  ctx.fillStyle = MUTED;
  setFont(ctx, 700, 16, SANS);
  drawTracked(ctx, text.certIdLabel.toUpperCase(), centerX, 952, 3);
  ctx.fillStyle = NAVY;
  const idSize = fitFontSize(ctx, certificateId, 700, SANS, 24, 340);
  setFont(ctx, 700, idSize, SANS);
  ctx.fillText(certificateId, centerX, CAPTION_Y);

  return canvas;
}

export function certificateToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return canvasToBlob(canvas);
}

// Builds an A4 landscape PDF with the high-resolution certificate filling the
// page edge to edge. jsPDF is loaded on demand to keep the main bundle small.
export async function certificateToPdf(
  canvas: HTMLCanvasElement,
  meta: { title: string; recipient: string; certificateId: string }
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setProperties({
    title: `${meta.title} - ${meta.recipient} (${meta.certificateId})`,
    subject: meta.title,
    author: 'ARIJU-VII',
    creator: 'ARIJU-VII - NASA Space Apps Challenge',
    keywords: meta.certificateId,
  });
  // Lossless PNG keeps text and QR edges perfectly crisp when zoomed or printed.
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  return pdf.output('blob');
}
