import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { SITES, type LandingSite } from '@/lib/lunarData';
import { useLocale } from '@/i18n/useLocale';

// NASA SVS CGI Moon Kit: LROC WAC colour mosaic (poles filled with LOLA) and
// the LOLA elevation map used as a bump map for crater relief.
const COLOR_MAP = '/moon-lroc-color-2k.jpg';
const BUMP_MAP = '/moon-lola-elevation-1k.jpg';

const DEG = Math.PI / 180;
const MAX_PITCH = 80 * DEG;

/** Unit vector for a selenographic lat/lon on three's SphereGeometry UV layout. */
function latLonToVector(lat: number, lon: number) {
  const phi = (lon + 180) * DEG;
  const cl = Math.cos(lat * DEG);
  return new THREE.Vector3(-Math.cos(phi) * cl, Math.sin(lat * DEG), Math.sin(phi) * cl);
}

/** Globe rotation that brings a site to the centre of the view. */
function orientationFor(site: LandingSite) {
  const yaw = Math.PI / 2 - (site.lon + 180) * DEG;
  const pitch = Math.max(-72 * DEG, Math.min(72 * DEG, site.lat * DEG));
  return { yaw, pitch };
}

function shortestAngle(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
}

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const MARKER_COLOR: Record<LandingSite['status'], string> = {
  historic: 'bg-amber-300 shadow-[0_0_0_5px_rgba(252,211,77,0.28)]',
  candidate: 'bg-cyan-300 shadow-[0_0_0_5px_rgba(103,232,249,0.28)]',
};

export default function Moon3D({ selectedId, onSelect }: Props) {
  const { t } = useLocale();
  const wrapRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Always start rotating on every device. Many Windows laptops/desktops report
  // "reduce motion" by default, which used to leave the globe frozen; the slow
  // spin can still be paused with the button below.
  const [autoRotate, setAutoRotate] = useState(true);

  // Shared mutable state between React and the render loop.
  const ctrl = useRef({
    yaw: -Math.PI / 2 - 25 * DEG,
    pitch: -18 * DEG,
    targetYaw: null as number | null,
    targetPitch: null as number | null,
    autoRotate: true,
    dragging: false,
  });

  useEffect(() => {
    ctrl.current.autoRotate = autoRotate;
  }, [autoRotate]);

  // Turn the globe towards the selected site.
  useEffect(() => {
    const site = SITES.find((s) => s.id === selectedId);
    if (!site) return;
    const { yaw, pitch } = orientationFor(site);
    const c = ctrl.current;
    c.targetYaw = shortestAngle(c.yaw, yaw);
    c.targetPitch = pitch;
    setAutoRotate(false);
  }, [selectedId]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let renderer: THREE.WebGLRenderer;
    try {
      // 'default' lets laptops stay on the integrated GPU instead of waking the
      // discrete one just for a single sphere.
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
    } catch (err) {
      console.warn('WebGL unavailable, showing the flat Moon instead', err);
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'block h-full w-full cursor-grab touch-none active:cursor-grabbing';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    wrap.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 4.1);

    const globe = new THREE.Group();
    scene.add(globe);

    const loader = new THREE.TextureLoader();
    let dirty = true; // re-render only when something actually changed
    const colorMap = loader.load(COLOR_MAP, () => {
      dirty = true;
      setLoaded(true);
    });
    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const bumpMap = loader.load(BUMP_MAP, () => {
      dirty = true;
    });

    // 128×80 segments is visually identical at this size and ~35% fewer vertices.
    const geometry = new THREE.SphereGeometry(1, 128, 80);
    const material = new THREE.MeshStandardMaterial({
      map: colorMap,
      bumpMap,
      bumpScale: 2.2,
      roughness: 1,
      metalness: 0,
    });
    const moon = new THREE.Mesh(geometry, material);
    globe.add(moon);

    // Thin halo ring marking the Artemis zone (84°–90° S).
    const zoneGeometry = new THREE.TorusGeometry(Math.cos(84 * DEG) * 1.003, 0.004, 8, 128);
    const zoneMaterial = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.85 });
    const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
    zone.rotation.x = Math.PI / 2;
    zone.position.y = -Math.sin(84 * DEG) * 1.003;
    globe.add(zone);

    const sun = new THREE.DirectionalLight(0xfff7ea, 3.1);
    sun.position.set(-3, 1.2, 3.4);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x8fa3c7, 0.32));

    const anchors = SITES.map((site) => ({ id: site.id, local: latLonToVector(site.lat, site.lon) }));

    let width = 1;
    let height = 1;
    // Cached marker box sizes (measured once per resize, never inside the
    // write phase of a frame, so there is no layout thrashing).
    const markerSize = new Map<string, { w: number; h: number }>();
    const DOT_OFFSET = 15; // p-2 (8px) + half of the 14px dot
    const EDGE = 4; // keep labels this many px inside the frame
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      markerSize.clear();
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    // Web fonts change label widths once they arrive; re-measure then.
    document.fonts?.ready.then(() => {
      markerSize.clear();
      dirty = true;
    });

    // Pointer drag rotation.
    const el = renderer.domElement;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      ctrl.current.dragging = true;
      ctrl.current.targetYaw = null;
      ctrl.current.targetPitch = null;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!ctrl.current.dragging) return;
      const k = 3.2 / Math.max(width, 240);
      ctrl.current.yaw += (e.clientX - lastX) * k;
      ctrl.current.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, ctrl.current.pitch + (e.clientY - lastY) * k));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      ctrl.current.dragging = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    // Only animate while the globe is on screen.
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);

    const world = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const projected = new THREE.Vector3();
    let raf = 0;
    let last = performance.now();
    let lastYaw = NaN;
    let lastPitch = NaN;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      const c = ctrl.current;

      if (c.targetYaw !== null && c.targetPitch !== null) {
        const ease = 1 - Math.pow(0.002, dt);
        c.yaw += (c.targetYaw - c.yaw) * ease;
        c.pitch += (c.targetPitch - c.pitch) * ease;
        if (Math.abs(c.targetYaw - c.yaw) < 0.001 && Math.abs(c.targetPitch - c.pitch) < 0.001) {
          c.targetYaw = null;
          c.targetPitch = null;
        }
      } else if (c.autoRotate && !c.dragging) {
        c.yaw += dt * 0.12;
      }

      // Nothing moved: skip the GPU work entirely (idle globe costs ~0).
      if (!dirty && c.yaw === lastYaw && c.pitch === lastPitch) return;
      dirty = false;
      lastYaw = c.yaw;
      lastPitch = c.pitch;

      globe.rotation.set(c.pitch, c.yaw, 0, 'XYZ');
      globe.updateMatrixWorld();
      renderer.render(scene, camera);

      // Read phase: measure any marker whose size is unknown.
      for (const a of anchors) {
        if (markerSize.has(a.id)) continue;
        const node = markerRefs.current[a.id];
        if (node && node.offsetWidth) markerSize.set(a.id, { w: node.offsetWidth, h: node.offsetHeight });
      }

      // Write phase: place the dot exactly on its site, put the label on the
      // side facing the Moon's centre, and clamp the whole marker inside the
      // frame so labels never get cut off at the edge on any screen size.
      for (const a of anchors) {
        const node = markerRefs.current[a.id];
        if (!node) continue;
        world.copy(a.local).applyMatrix4(globe.matrixWorld);
        toCamera.copy(camera.position).sub(world).normalize();
        const facing = world.dot(toCamera);
        projected.copy(world).project(camera);
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const show = facing > 0.08;
        const size = markerSize.get(a.id) ?? { w: 0, h: 0 };
        const flip = x > width / 2;
        let left = flip ? x - (size.w - DOT_OFFSET) : x - DOT_OFFSET;
        let top = y - size.h / 2;
        left = Math.max(EDGE, Math.min(width - size.w - EDGE, left));
        top = Math.max(EDGE, Math.min(height - size.h - EDGE, top));
        if (node.dataset.flip !== String(flip)) {
          node.dataset.flip = String(flip);
          node.classList.toggle('flex-row-reverse', flip);
        }
        node.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
        node.style.opacity = show ? String(Math.min(1, facing * 3)) : '0';
        node.style.pointerEvents = show ? 'auto' : 'none';
        node.tabIndex = show ? 0 : -1;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      geometry.dispose();
      material.dispose();
      zoneGeometry.dispose();
      zoneMaterial.dispose();
      colorMap.dispose();
      bumpMap.dispose();
      renderer.dispose();
      el.remove();
    };
  }, []);

  function resetView() {
    const c = ctrl.current;
    c.targetYaw = shortestAngle(c.yaw, -Math.PI / 2 - 25 * DEG);
    c.targetPitch = -18 * DEG;
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
      <div
        className="pointer-events-none absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.28),transparent_70%)] blur-2xl"
        aria-hidden="true"
      />
      <div
        ref={wrapRef}
        className="absolute inset-0 overflow-hidden"
        role="group"
        aria-label={t('Interactive 3D Moon with landing sites', 'Bulan 3D interaktif dengan lokasi pendaratan')}
      >
        {failed && (
          <div
            className="absolute inset-[8%] rounded-full bg-cover bg-center shadow-[inset_-40px_-30px_70px_rgba(2,6,23,0.85)]"
            style={{ backgroundImage: `url(${COLOR_MAP})`, backgroundSize: '200% 100%' }}
            aria-hidden="true"
          />
        )}
        {!loaded && !failed && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            {t('Loading NASA Moon map…', 'Memuat peta Bulan NASA…')}
          </div>
        )}
        {!failed &&
          SITES.map((site) => {
            const active = site.id === selectedId;
            return (
              <button
                key={site.id}
                ref={(node) => {
                  markerRefs.current[site.id] = node;
                }}
                type="button"
                onClick={() => onSelect(site.id)}
                aria-pressed={active}
                aria-label={`${site.short} – ${t('show details', 'lihat detail')}`}
                className="group absolute left-0 top-0 flex items-center gap-2 rounded-full p-2 opacity-0 transition-opacity duration-150 focus-visible:outline-none"
              >
                <span
                  className={`relative block h-3.5 w-3.5 rounded-full ring-2 ring-slate-950 transition-transform group-hover:scale-125 group-focus-visible:scale-125 ${
                    MARKER_COLOR[site.status]
                  } ${active ? 'scale-150' : ''}`}
                >
                  {active && <span className="absolute -inset-2 animate-ping rounded-full border-2 border-white/70" />}
                </span>
                <span
                  className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold shadow-lg transition ${
                    active
                      ? 'bg-white text-slate-950'
                      : 'bg-slate-950/80 text-slate-100 group-hover:bg-white group-hover:text-slate-950'
                  }`}
                >
                  {site.short}
                </span>
              </button>
            );
          })}
      </div>

      {!failed && (
        <div className="absolute bottom-1 right-1 flex gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            aria-pressed={autoRotate}
            title={autoRotate ? t('Stop rotation', 'Hentikan putaran') : t('Auto-rotate', 'Putar otomatis')}
            aria-label={autoRotate ? t('Stop rotation', 'Hentikan putaran') : t('Auto-rotate', 'Putar otomatis')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-slate-200 backdrop-blur hover:bg-white/10"
          >
            {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={resetView}
            title={t('Reset view', 'Atur ulang tampilan')}
            aria-label={t('Reset view', 'Atur ulang tampilan')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-slate-200 backdrop-blur hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
