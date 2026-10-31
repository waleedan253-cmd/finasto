"use client";

import { useEffect, useState, type SVGProps } from "react";
import Image from "next/image";

const LOGO_IN_MS = 600; // medallion + logo fade/scale-in
const HOLD_MS = 1500; // gate stays closed before opening
const OPEN_MS = 1500; // gate opening duration
const SESSION_KEY = "finasto-intro-seen";

// Original Balinese palette: fired red brick, weathered volcanic stone, gold leaf (prada)
const BRICK = "#c4593b";
const BRICK_MORTAR = "#9a4128";
const STONE_LIGHT = "#cfc5b6";
const STONE_DARK = "#8f8578";
const GOLD = "#e0b558";
const GOLD_LIGHT = "#f7dc9b";
const GOLD_DEEP = "#9c6f1f";

// Balinese split temple gate (candi bentar)
function BaliGate({
  strokeWidth = 1.6,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 21V16h2v-3h2v-3h3v11" />
      <path d="M21 21V16h-2v-3h-2v-3h-3v11" />
      <path d="M8.5 10V7.5M15.5 10V7.5M2 21h20" />
    </svg>
  );
}

// Deterministic per-brick color variation (same result on server and client)
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const BRICK_RECTS: { x: number; y: number; fill: string }[] = [];
let MORTAR_PATH = "";
(() => {
  const rnd = seeded(42);
  for (let row = 0; row < 8; row++) {
    const y = row * 7;
    const offset = row % 2 === 0 ? 0 : 7;
    MORTAR_PATH += `M0 ${y}H112`;
    for (let k = 0; k < 8; k++) {
      const x = offset + k * 14;
      const fill = `hsl(${9 + rnd() * 9}, ${46 + rnd() * 16}%, ${38 + rnd() * 14}%)`;
      BRICK_RECTS.push({ x, y, fill });
      if (x + 14 > 112) BRICK_RECTS.push({ x: x - 112, y, fill });
      MORTAR_PATH += `M${x} ${y}V${y + 7}`;
      if (x + 14 > 112) MORTAR_PATH += `M${x - 112} ${y}V${y + 7}`;
    }
  }
})();

// Tower geometry. Coordinates are in a 400-wide box; x=400 is the inner (seam) edge.
type Rect = { x: number; y: number; h: number };
const PLINTH: Rect = { x: 20, y: 740, h: 60 };
const BODIES: Rect[] = [
  { x: 60, y: 560, h: 180 },
  { x: 100, y: 400, h: 140 },
  { x: 140, y: 270, h: 114 },
  { x: 180, y: 170, h: 86 },
  { x: 225, y: 90, h: 66 },
  { x: 270, y: 40, h: 38 },
  { x: 330, y: 6, h: 24 },
];
const CORNICES: Rect[] = [
  { x: 44, y: 540, h: 20 },
  { x: 84, y: 384, h: 16 },
  { x: 124, y: 256, h: 14 },
  { x: 164, y: 156, h: 14 },
  { x: 209, y: 78, h: 12 },
  { x: 254, y: 30, h: 10 },
  { x: 314, y: -4, h: 10 },
];
// carved, gold-trimmed niches: [centerX, top, width, height]
const NICHES: [number, number, number, number][] = [
  [300, 596, 120, 120],
  [310, 416, 90, 108],
  [315, 286, 70, 84],
  [320, 184, 56, 60],
  [325, 102, 44, 44],
];

function niche(cx: number, top: number, w: number, h: number) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const r2 = w / 2;
  return `M${l} ${top + h} V${top + r2} A${r2} ${r2} 0 0 1 ${r} ${top + r2} V${top + h} Z`;
}

function Tower({ id }: { id: string }) {
  const all = [PLINTH, ...BODIES, ...CORNICES];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 -30 400 830"
      preserveAspectRatio="xMaxYMax meet"
      className="h-full w-full"
    >
      <defs>
        {/* running-bond brick courses */}
        {/* hand-laid brick: every brick has its own tone, like fired clay */}
        <pattern id={`${id}-brick`} width="112" height="56" patternUnits="userSpaceOnUse">
          <rect width="112" height="56" fill={BRICK} />
          {BRICK_RECTS.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width="14" height="7" fill={b.fill} />
          ))}
          <path d={MORTAR_PATH} stroke={BRICK_MORTAR} strokeWidth="1" fill="none" />
        </pattern>
        {/* contact shadow under each projecting cornice */}
        <linearGradient id={`${id}-ao`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0f06" stopOpacity="0.6" />
          <stop offset="1" stopColor="#2a0f06" stopOpacity="0" />
        </linearGradient>
        {/* warm rim light from the glowing gap */}
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0" />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={STONE_LIGHT} />
          <stop offset="1" stopColor={STONE_DARK} />
        </linearGradient>
        {/* shadow on the outer side, warm light from the gap */}
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a1208" stopOpacity="0.36" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.05" />
          <stop offset="1" stopColor="#ffb860" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_LIGHT} />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_DEEP} />
        </linearGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <clipPath id={`${id}-clip`}>
          {all.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={400 - r.x} height={r.h} />
          ))}
        </clipPath>
      </defs>

      {/* base fills */}
      <rect
        x={PLINTH.x}
        y={PLINTH.y}
        width={400 - PLINTH.x}
        height={PLINTH.h}
        fill={`url(#${id}-stone)`}
      />
      {BODIES.map((r, i) => (
        <rect
          key={`b${i}`}
          x={r.x}
          y={r.y}
          width={400 - r.x}
          height={r.h}
          fill={`url(#${id}-brick)`}
        />
      ))}
      {CORNICES.map((r, i) => (
        <rect
          key={`c${i}`}
          x={r.x}
          y={r.y}
          width={400 - r.x}
          height={r.h}
          fill={`url(#${id}-stone)`}
        />
      ))}

      {/* weathering grain + light/shadow, clipped to the tower */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect
          x="0"
          y="-30"
          width="400"
          height="830"
          filter={`url(#${id}-grain)`}
          opacity="0.16"
          style={{ mixBlendMode: "multiply" }}
        />
        <rect x="0" y="-30" width="400" height="830" fill={`url(#${id}-shade)`} />
        {/* ambient occlusion under every cornice */}
        {CORNICES.map((r, i) => (
          <rect
            key={`ao${i}`}
            x={r.x}
            y={r.y + r.h}
            width={400 - r.x}
            height={28}
            fill={`url(#${id}-ao)`}
          />
        ))}
        {/* warm rim light along the inner edge */}
        <rect x="376" y="-30" width="24" height="830" fill={`url(#${id}-rim)`} />
      </g>

      {/* plinth moldings */}
      <g stroke={`url(#${id}-gold)`} strokeWidth="1.4" fill="none" opacity="0.9">
        <path d="M20 752H400M20 770H400" />
      </g>
      <path d="M20 740H400" stroke="#2a211b" strokeWidth="1.5" opacity="0.7" />

      {/* moss on the weathered base */}
      <g fill="#6aa84f">
        <ellipse cx="62" cy="743" rx="42" ry="6" opacity="0.5" />
        <ellipse cx="190" cy="742" rx="56" ry="5" opacity="0.4" />
        <ellipse cx="320" cy="743" rx="46" ry="6" opacity="0.45" />
        <ellipse cx="120" cy="790" rx="60" ry="6" opacity="0.35" />
        <ellipse cx="280" cy="792" rx="70" ry="5" opacity="0.3" />
      </g>

      {/* cornices: gold fillet on top, dentil row beneath */}
      {CORNICES.map((r, i) => (
        <g key={`cg${i}`}>
          <path d={`M${r.x} ${r.y + 0.8}H400`} stroke={`url(#${id}-gold)`} strokeWidth="1.8" />
          <path
            d={`M${r.x + 4} ${r.y + r.h * 0.62}H400`}
            stroke="#2a211b"
            strokeOpacity="0.55"
            strokeWidth={Math.max(2.5, r.h * 0.22)}
            strokeDasharray="5 4"
          />
          <path
            d={`M${r.x} ${r.y + r.h - 0.6}H400`}
            stroke="#1f1814"
            strokeOpacity="0.6"
            strokeWidth="1.2"
          />
        </g>
      ))}

      {/* carved niches with gold leaf */}
      {NICHES.map(([cx, top, w, h], i) => (
        <g key={`n${i}`}>
          <path d={niche(cx, top, w, h)} fill="rgba(90,32,16,0.42)" />
          <path
            d={niche(cx, top, w, h)}
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="1.6"
          />
          <path
            d={niche(cx, top + 6, w - 12, h - 6)}
            fill="none"
            stroke={GOLD}
            strokeOpacity="0.45"
            strokeWidth="0.8"
          />
          {/* lotus / patra motif */}
          <g
            transform={`translate(${cx} ${top + h * 0.58}) scale(${w / 120})`}
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M0 22 C-14 10 -14 -10 0 -22 C14 -10 14 10 0 22Z" />
            <path d="M0 22 C-26 14 -30 -6 -18 -18 C-10 -8 -8 6 0 22Z" />
            <path d="M0 22 C26 14 30 -6 18 -18 C10 -8 8 6 0 22Z" />
            <circle cx="0" cy="0" r="3" fill={GOLD} stroke="none" />
          </g>
        </g>
      ))}

      {/* gold finial (pinnacle) */}
      <g style={{ filter: "drop-shadow(0 0 6px rgba(247,220,155,0.8))" }}>
        <rect x="378" y="-12" width="22" height="8" fill={`url(#${id}-gold)`} />
        <path
          d="M389 -12 C379 -22 389 -28 394 -34 C399 -28 409 -22 399 -12Z"
          fill={`url(#${id}-gold)`}
        />
      </g>
    </svg>
  );
}

// ───────── Tropical foliage (fresh mid-tone greens, kept light and small) ─────────
const LEAF_FILL = "url(#leaf-grad)";

function Leaf({ r, s, o = 1 }: { r: number; s: number; o?: number }) {
  return (
    <g transform={`rotate(${r}) scale(${s})`} opacity={o}>
      <path d="M0 0 C14 -20 16 -56 0 -90 C-16 -56 -14 -20 0 0Z" fill={LEAF_FILL} />
      <path d="M0 0V-86" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      {[1, 2, 3, 4, 5].map((k) => (
        <path
          key={k}
          d={`M0 ${-k * 14}L10 ${-k * 14 - 8}M0 ${-k * 14}L-10 ${-k * 14 - 8}`}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="0.6"
          fill="none"
        />
      ))}
    </g>
  );
}

// A palm frond: curved rib with paired leaflets sweeping forward
function PalmFrond({
  p1,
  p2,
  flip = 1,
}: {
  p1: [number, number];
  p2: [number, number];
  flip?: 1 | -1;
}) {
  const rib = `M0 0 Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`;
  const leaflets: string[] = [];
  for (let t = 0.12; t <= 0.98; t += 0.065) {
    const x = 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    const y = 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    const dx = 2 * (1 - t) * p1[0] + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * (1 - t) * p1[1] + 2 * t * (p2[1] - p1[1]);
    const len = Math.hypot(dx, dy) || 1;
    const tx = dx / len;
    const ty = dy / len;
    const nx = -ty * flip;
    const ny = tx * flip;
    const L = 30 * (1 - 0.55 * t);
    leaflets.push(
      `M${x} ${y}L${x + nx * L + tx * L * 0.55} ${y + ny * L + ty * L * 0.55}`,
      `M${x} ${y}L${x - nx * L + tx * L * 0.55} ${y - ny * L + ty * L * 0.55}`
    );
  }
  return (
    <g fill="none" strokeLinecap="round">
      <path d={leaflets.join("")} stroke="#8fcb62" strokeWidth="2.2" opacity="0.85" />
      <path d={rib} stroke="#4f9a3c" strokeWidth="2.6" />
    </g>
  );
}

function FoliageDefs() {
  return (
    <defs>
      <linearGradient id="leaf-grad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#4f9a3c" />
        <stop offset="1" stopColor="#a6d97a" />
      </linearGradient>
    </defs>
  );
}

// Top-left corner cluster: palm fronds hanging into the scene
function FoliageTop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 240"
      className="absolute left-0 top-0 h-[40%] w-[62%]"
      style={{ transformOrigin: "0 0", animation: "finasto-sway-a 7s ease-in-out infinite" }}
    >
      <FoliageDefs />
      <g opacity="0.8">
        <PalmFrond p1={[90, 6]} p2={[180, 120]} />
        <PalmFrond p1={[40, 50]} p2={[100, 200]} flip={-1} />
      </g>
      <g opacity="0.7">
        <Leaf r={112} s={1.35} />
        <Leaf r={150} s={1.5} />
      </g>
    </svg>
  );
}

// Bottom-left corner cluster: banana leaves rising from the ground
function FoliageBottom({ small = false }: { small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 240"
      className={
        small
          ? "absolute bottom-0 left-0 h-[22%] w-[34%]"
          : "absolute bottom-0 left-0 h-[36%] w-[56%]"
      }
      style={{
        transformOrigin: "0 100%",
        animation: `finasto-sway-b ${small ? 5.5 : 8}s ease-in-out infinite`,
      }}
    >
      <FoliageDefs />
      <g transform="translate(0 240)">
        <g opacity={small ? 0.9 : 0.75}>
          <Leaf r={8} s={small ? 1.5 : 1.9} />
          <Leaf r={32} s={small ? 1.3 : 1.7} />
          <Leaf r={58} s={small ? 1.1 : 1.5} />
          <Leaf r={82} s={small ? 0.9 : 1.2} />
        </g>
      </g>
    </svg>
  );
}

// One half of the gate scene: dusk sky, glowing gap, tower, stone ground.
function GateHalf({ side, open }: { side: "left" | "right"; open: boolean }) {
  const isLeft = side === "left";
  const innerX = isLeft ? "100%" : "0%";
  return (
    <div
      className={`absolute inset-y-0 w-1/2 overflow-hidden will-change-transform ${
        isLeft ? "left-0" : "right-0"
      }`}
      style={{
        transform: open
          ? `translateX(${isLeft ? "-101%" : "101%"})`
          : "translateX(0)",
        transition: `transform ${OPEN_MS}ms cubic-bezier(0.77, 0, 0.18, 1)`,
        background: [
          `radial-gradient(ellipse 70% 58% at ${innerX} 76%, rgba(255,232,168,0.7) 0%, rgba(240,196,96,0.28) 42%, transparent 74%)`,
          "linear-gradient(180deg, #082014 0%, #0f3322 28%, #17492f 60%, #25693f 88%, #347c4a 100%)",
        ].join(", "),
      }}
    >
      {/* outer vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${
            isLeft ? "90deg" : "270deg"
          }, rgba(2,14,8,0.5) 0%, transparent 58%)`,
        }}
      />

      {/* distant hazy hills for atmospheric depth */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute inset-x-0 bottom-[5dvh] z-[2] h-[42%] w-full ${
          isLeft ? "" : "-scale-x-100"
        }`}
      >
        <defs>
          <linearGradient id={`hill-far-${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2f7a55" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1d5a3c" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id={`hill-near-${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a5236" stopOpacity="0.75" />
            <stop offset="1" stopColor="#0f3a26" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d="M0 70 C70 38 130 70 200 88 S330 118 400 128 V200 H0Z"
          fill={`url(#hill-far-${side})`}
          style={{ filter: "blur(1.5px)" }}
        />
        <path
          d="M0 112 C80 82 150 122 230 130 S340 150 400 156 V200 H0Z"
          fill={`url(#hill-near-${side})`}
        />
      </svg>

      {/* back foliage layer, softly blurred for depth (outer edge only) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-[5dvh] inset-x-0 top-0 z-[5] opacity-75 blur-[1.5px] ${
          isLeft ? "" : "-scale-x-100"
        }`}
      >
        <FoliageTop />
        <FoliageBottom />
      </div>

      {/* stone ground / temple steps */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-0 h-[5dvh] border-t border-[#e0b558]/50"
        style={{
          background: "linear-gradient(180deg, #9aa28c 0%, #6d7864 55%, #46503f 100%)",
        }}
      >
        {/* stone slab joints */}
        <div className="absolute inset-x-0 top-[45%] h-px bg-black/25" />
        <div className="absolute inset-x-0 top-[78%] h-px bg-black/30" />
        {/* moss creeping along the stone */}
        <div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg, rgba(106,168,79,0.55) 0%, rgba(62,118,47,0.25) 60%, transparent 100%)",
          }}
        />
      </div>

      {/* tower, mirrored for the right half (gap kept at the seam) */}
      <div
        className={`absolute bottom-[5dvh] left-0 right-3 top-0 z-10 md:right-10 ${
          isLeft ? "" : "-scale-x-100"
        }`}
      >
        <Tower id={`gate-${side}`} />
      </div>

      {/* small sharp foreground leaves in the bottom outer corner */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-[4dvh] inset-x-0 z-[15] h-[30%] ${
          isLeft ? "" : "-scale-x-100"
        }`}
      >
        <FoliageBottom small />
      </div>

      {/* gold edge at the seam */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 z-20 w-px bg-gradient-to-b from-transparent via-[#f7dc9b]/70 to-transparent ${
          isLeft ? "right-0" : "left-0"
        }`}
      />
    </div>
  );
}

const EMBERS = [
  { l: "46%", d: 0 },
  { l: "52%", d: 0.5 },
  { l: "49%", d: 1.1 },
  { l: "55%", d: 0.25 },
  { l: "44%", d: 0.8 },
  { l: "50%", d: 1.5 },
];

export default function IntroGate() {
  const [phase, setPhase] = useState<"visible" | "opening" | "done">("visible");
  const [logoIn, setLogoIn] = useState(false);

  useEffect(() => {
    // Show the intro only once per browser session
    if (sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => setLogoIn(true));
    const openTimer = setTimeout(() => setPhase("opening"), HOLD_MS);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem(SESSION_KEY, "1");
    }, HOLD_MS + OPEN_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(openTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (phase === "done") return null;

  const opening = phase === "opening";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes finasto-ember {
          0% { opacity: 0; transform: translateY(0) scale(.6); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-130px) scale(1); }
        }
        @keyframes finasto-beam {
          0% { opacity: 0; transform: translateX(-50%) scaleX(.15); }
          22% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) scaleX(1.3); }
        }
        @keyframes finasto-rays {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        @keyframes finasto-sway-a {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes finasto-sway-b {
          0%, 100% { transform: rotate(1.5deg); }
          50% { transform: rotate(-2deg); }
        }
      `}</style>

      {/* light pouring through the opening gap (sits behind the halves) */}
      {opening && (
        <div
          className="absolute inset-y-0 left-1/2 w-[70vw]"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 55%, rgba(255,236,190,0.95) 0%, rgba(255,196,110,0.45) 40%, transparent 72%)",
            animation: `finasto-beam ${OPEN_MS}ms ease-out forwards`,
          }}
        />
      )}

      {/* the two gate halves */}
      <GateHalf side="left" open={opening} />
      <GateHalf side="right" open={opening} />

      {/* center medallion with emblem + logo */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: opening ? 0 : logoIn ? 1 : 0,
          transform: opening ? "scale(1.15)" : logoIn ? "scale(1)" : "scale(0.92)",
          transition: opening
            ? `opacity ${OPEN_MS * 0.4}ms ease-in, transform ${OPEN_MS * 0.4}ms ease-in`
            : `opacity ${LOGO_IN_MS}ms ease-out, transform ${LOGO_IN_MS}ms ease-out`,
        }}
      >
        {/* sun rays falling through the gap */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 158deg at 50% -8%, transparent 0deg, rgba(255,236,180,0.2) 5deg, transparent 11deg, rgba(255,236,180,0.14) 16deg, transparent 22deg, rgba(255,236,180,0.2) 28deg, transparent 34deg, rgba(255,236,180,0.12) 38deg, transparent 44deg)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 78%)",
            maskImage: "linear-gradient(180deg, black 0%, transparent 78%)",
            animation: "finasto-rays 6s ease-in-out infinite",
          }}
        />
        {/* low mist along the ground */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[32%]"
          style={{
            background:
              "linear-gradient(0deg, rgba(214,238,220,0.32) 0%, rgba(214,238,220,0.1) 55%, transparent 100%)",
          }}
        />
        {/* fine film grain for a photographic feel */}
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.1] mix-blend-overlay">
          <filter id="intro-film-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#intro-film-grain)" />
        </svg>

        {/* rising gold embers */}
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="absolute bottom-[18%] h-1 w-1 rounded-full bg-[#f7dc9b]"
            style={{
              left: e.l,
              boxShadow: "0 0 10px 3px rgba(224,181,88,0.8)",
              animation: `finasto-ember 3.2s ease-out ${e.d}s infinite`,
            }}
          />
        ))}

        <div
          className="relative flex h-[200px] w-[200px] flex-col items-center justify-center gap-3 rounded-full md:h-[250px] md:w-[250px]"
          style={{
            background: "radial-gradient(circle at 50% 28%, #1e5a38 0%, #103a24 60%, #082014 100%)",
            boxShadow: [
              "0 0 0 1px rgba(247,220,155,0.9)",
              "0 0 0 6px rgba(8,32,20,0.95)",
              "0 0 0 7px rgba(224,181,88,0.55)",
              "0 28px 70px rgba(0,0,0,0.5)",
              "0 0 100px rgba(224,181,88,0.35)",
              "inset 0 1px 0 rgba(247,220,155,0.3)",
            ].join(", "),
          }}
        >
          <BaliGate
            strokeWidth={1.1}
            className="h-11 w-11 text-[#f7dc9b] drop-shadow-[0_0_14px_rgba(224,181,88,0.7)] md:h-14 md:w-14"
          />
          {/* medallion is deep emerald, so use the light-on-dark logo */}
          <Image
            src="/brand/finasto-logo-dark.png"
            alt="Finasto"
            width={240}
            height={240}
            priority
            className="h-auto w-24 md:w-32"
          />
        </div>
      </div>
    </div>
  );
}