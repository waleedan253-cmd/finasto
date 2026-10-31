"use client";

import { useEffect, useState, type SVGProps } from "react";
import Image from "next/image";

const LOGO_IN_MS = 700; // medallion fade/scale-in
const HOLD_MS = 1600; // gate stays closed before opening
const OPEN_MS = 1600; // gate opening duration
const SESSION_KEY = "finasto-intro-seen";
const INTRO_EVENT = "finasto-intro-done"; // the hero carousel waits for this before it starts

// Palette pulled from the tea slides: sunlit leaf green, weathered stone, warm wood, soft gold
const BRICK = "#c4593b";
const BRICK_MORTAR = "#9a4128";
const STONE_LIGHT = "#e2d9c8";
const STONE_DARK = "#a39886";
const GOLD = "#e0b558";
const GOLD_LIGHT = "#f9e3a8";
const GOLD_DEEP = "#9c6f1f";
const WOOD = "#7b4b2a";

// Balinese split temple gate (candi bentar)
function BaliGate({ strokeWidth = 1.6, ...props }: SVGProps<SVGSVGElement>) {
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
      const fill = `hsl(${9 + rnd() * 9}, ${46 + rnd() * 16}%, ${40 + rnd() * 14}%)`;
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
      style={{ filter: "drop-shadow(-10px 14px 18px rgba(40,50,20,0.28))" }}
    >
      <defs>
        <pattern id={`${id}-brick`} width="112" height="56" patternUnits="userSpaceOnUse">
          <rect width="112" height="56" fill={BRICK} />
          {BRICK_RECTS.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width="14" height="7" fill={b.fill} />
          ))}
          <path d={MORTAR_PATH} stroke={BRICK_MORTAR} strokeWidth="1" fill="none" />
        </pattern>
        {/* contact shadow under each projecting cornice */}
        <linearGradient id={`${id}-ao`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0f06" stopOpacity="0.5" />
          <stop offset="1" stopColor="#2a0f06" stopOpacity="0" />
        </linearGradient>
        {/* sunlight grazing the inner edge */}
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={STONE_LIGHT} />
          <stop offset="1" stopColor={STONE_DARK} />
        </linearGradient>
        {/* soft shade on the outer side, warm sun toward the gap, light falling from above */}
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a1c0c" stopOpacity="0.3" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.02" />
          <stop offset="1" stopColor="#ffd88a" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d6" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff6d6" stopOpacity="0" />
          <stop offset="1" stopColor="#1c2a10" stopOpacity="0.22" />
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
      <rect x={PLINTH.x} y={PLINTH.y} width={400 - PLINTH.x} height={PLINTH.h} fill={`url(#${id}-stone)`} />
      {BODIES.map((r, i) => (
        <rect key={`b${i}`} x={r.x} y={r.y} width={400 - r.x} height={r.h} fill={`url(#${id}-brick)`} />
      ))}
      {CORNICES.map((r, i) => (
        <rect key={`c${i}`} x={r.x} y={r.y} width={400 - r.x} height={r.h} fill={`url(#${id}-stone)`} />
      ))}

      {/* weathering grain + light/shadow, clipped to the tower */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect
          x="0"
          y="-30"
          width="400"
          height="830"
          filter={`url(#${id}-grain)`}
          opacity="0.18"
          style={{ mixBlendMode: "multiply" }}
        />
        <rect x="0" y="-30" width="400" height="830" fill={`url(#${id}-shade)`} />
        <rect x="0" y="-30" width="400" height="830" fill={`url(#${id}-top)`} />
        {CORNICES.map((r, i) => (
          <rect key={`ao${i}`} x={r.x} y={r.y + r.h} width={400 - r.x} height={28} fill={`url(#${id}-ao)`} />
        ))}
        <rect x="372" y="-30" width="28" height="830" fill={`url(#${id}-rim)`} />
      </g>

      {/* plinth moldings */}
      <g stroke={`url(#${id}-gold)`} strokeWidth="1.4" fill="none" opacity="0.9">
        <path d="M20 752H400M20 770H400" />
      </g>
      <path d="M20 740H400" stroke="#2a211b" strokeWidth="1.5" opacity="0.6" />

      {/* moss on the weathered base */}
      <g fill="#6aa84f">
        <ellipse cx="62" cy="743" rx="42" ry="6" opacity="0.55" />
        <ellipse cx="190" cy="742" rx="56" ry="5" opacity="0.45" />
        <ellipse cx="320" cy="743" rx="46" ry="6" opacity="0.5" />
        <ellipse cx="120" cy="790" rx="60" ry="6" opacity="0.4" />
        <ellipse cx="280" cy="792" rx="70" ry="5" opacity="0.35" />
      </g>

      {/* cornices: gold fillet on top, dentil row beneath */}
      {CORNICES.map((r, i) => (
        <g key={`cg${i}`}>
          <path d={`M${r.x} ${r.y + 0.8}H400`} stroke={`url(#${id}-gold)`} strokeWidth="1.8" />
          <path
            d={`M${r.x + 4} ${r.y + r.h * 0.62}H400`}
            stroke="#2a211b"
            strokeOpacity="0.5"
            strokeWidth={Math.max(2.5, r.h * 0.22)}
            strokeDasharray="5 4"
          />
          <path d={`M${r.x} ${r.y + r.h - 0.6}H400`} stroke="#1f1814" strokeOpacity="0.55" strokeWidth="1.2" />
        </g>
      ))}

      {/* carved niches with gold leaf */}
      {NICHES.map(([cx, top, w, h], i) => (
        <g key={`n${i}`}>
          <path d={niche(cx, top, w, h)} fill="rgba(90,32,16,0.4)" />
          <path d={niche(cx, top, w, h)} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.6" />
          <path
            d={niche(cx, top + 6, w - 12, h - 6)}
            fill="none"
            stroke={GOLD}
            strokeOpacity="0.45"
            strokeWidth="0.8"
          />
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
      <g style={{ filter: "drop-shadow(0 0 6px rgba(249,227,168,0.9))" }}>
        <rect x="378" y="-12" width="22" height="8" fill={`url(#${id}-gold)`} />
        <path d="M389 -12 C379 -22 389 -28 394 -34 C399 -28 409 -22 399 -12Z" fill={`url(#${id}-gold)`} />
      </g>
    </svg>
  );
}

// ───────── Botanicals: sunlit leaves, jasmine, butterfly pea, lemongrass ─────────
const LEAF_FILL = "url(#leaf-grad)";

function Leaf({ r, s, o = 1 }: { r: number; s: number; o?: number }) {
  return (
    <g transform={`rotate(${r}) scale(${s})`} opacity={o}>
      <path d="M0 0 C14 -20 16 -56 0 -90 C-16 -56 -14 -20 0 0Z" fill={LEAF_FILL} />
      <path d="M0 0V-86" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      {[1, 2, 3, 4, 5].map((k) => (
        <path
          key={k}
          d={`M0 ${-k * 14}L10 ${-k * 14 - 8}M0 ${-k * 14}L-10 ${-k * 14 - 8}`}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.6"
          fill="none"
        />
      ))}
    </g>
  );
}

// A palm frond: curved rib with paired leaflets sweeping forward
function PalmFrond({ p1, p2, flip = 1 }: { p1: [number, number]; p2: [number, number]; flip?: 1 | -1 }) {
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
      <path d={leaflets.join("")} stroke="#a3d977" strokeWidth="2.2" opacity="0.9" />
      <path d={rib} stroke="#5aa845" strokeWidth="2.6" />
    </g>
  );
}

// Jasmine blossom (as in the Flovera slide)
function Jasmine({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M0 0 C-7 -8 -6 -18 0 -22 C6 -18 7 -8 0 0Z"
          fill="#fffdf4"
          stroke="#e7e0c4"
          strokeWidth="0.5"
        />
      ))}
      <circle r="3" fill="#f2c94c" />
    </g>
  );
}

// Butterfly pea flower (as in the Blue Moon slide)
function PeaFlower({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M0 0 C-10 -8 -9 -20 0 -24 C9 -20 10 -8 0 0Z"
          fill="#2b3fd6"
          stroke="#1b2a9e"
          strokeWidth="0.5"
        />
      ))}
      <circle r="5" fill="#f3e9a8" />
      <circle r="2" fill="#c9a227" />
    </g>
  );
}

function FoliageDefs() {
  return (
    <defs>
      <linearGradient id="leaf-grad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#4f9a3c" />
        <stop offset="1" stopColor="#bfe58a" />
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
      <g opacity="0.85">
        <PalmFrond p1={[90, 6]} p2={[180, 120]} />
        <PalmFrond p1={[40, 50]} p2={[100, 200]} flip={-1} />
      </g>
      <g opacity="0.75">
        <Leaf r={112} s={1.35} />
        <Leaf r={150} s={1.5} />
      </g>
    </svg>
  );
}

// Bottom-left corner cluster: banana leaves with jasmine, pea flowers and lemongrass
function FoliageBottom({ small = false }: { small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 240"
      className={small ? "absolute bottom-0 left-0 h-[22%] w-[34%]" : "absolute bottom-0 left-0 h-[36%] w-[56%]"}
      style={{
        transformOrigin: "0 100%",
        animation: `finasto-sway-b ${small ? 5.5 : 8}s ease-in-out infinite`,
      }}
    >
      <FoliageDefs />
      <g transform="translate(0 240)">
        <g opacity={small ? 0.95 : 0.85}>
          <Leaf r={8} s={small ? 1.5 : 1.9} />
          <Leaf r={32} s={small ? 1.3 : 1.7} />
          <Leaf r={58} s={small ? 1.1 : 1.5} />
          <Leaf r={82} s={small ? 0.9 : 1.2} />
        </g>
        {small ? (
          <>
            <Jasmine x={34} y={-40} s={0.9} r={12} />
            <PeaFlower x={70} y={-22} s={0.8} r={-20} />
          </>
        ) : (
          <>
            {/* lemongrass stalks */}
            <g stroke="#cfe3a0" strokeWidth="5" strokeLinecap="round">
              <path d="M60 0 L78 -52" />
              <path d="M72 0 L96 -46" />
              <path d="M84 0 L110 -38" />
            </g>
            <Jasmine x={40} y={-70} s={1.2} r={10} />
            <Jasmine x={74} y={-96} s={0.9} r={-14} />
            <PeaFlower x={112} y={-60} s={1.1} r={18} />
            <PeaFlower x={26} y={-30} s={0.9} r={-8} />
          </>
        )}
      </g>
    </svg>
  );
}

// Wooden lattice screen, like the one in the tea photographs
function Lattice({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      style={{
        opacity: 0.4,
        filter: "blur(1.2px)",
        WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 55%)",
        maskImage: "linear-gradient(180deg, black 0%, transparent 55%)",
      }}
    >
      <defs>
        <pattern id={`${id}-lat`} width="46" height="46" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="46" height="46" fill="none" />
          <path d="M0 3H46M0 43H46M3 0V46M43 0V46" stroke={WOOD} strokeWidth="5" />
          <path d="M3 3H43V43H3Z" fill="none" stroke="#a8713f" strokeWidth="1" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-lat)`} />
    </svg>
  );
}

// One half of the gate scene: sunlit morning sky, glowing gap, tower, stone ground.
function GateHalf({ side, open }: { side: "left" | "right"; open: boolean }) {
  const isLeft = side === "left";
  const innerX = isLeft ? "100%" : "0%";
  return (
    <div
      className={`absolute inset-y-0 w-1/2 overflow-hidden will-change-transform ${isLeft ? "left-0" : "right-0"}`}
      style={{
        transform: open ? `translateX(${isLeft ? "-101%" : "101%"})` : "translateX(0)",
        transition: `transform ${OPEN_MS}ms cubic-bezier(0.77, 0, 0.18, 1)`,
        background: [
          `radial-gradient(ellipse 75% 62% at ${innerX} 70%, rgba(255,248,214,0.95) 0%, rgba(255,232,160,0.45) 42%, transparent 76%)`,
          "linear-gradient(180deg, #d7ecde 0%, #e6f1d4 32%, #f2f0c4 62%, #cfe3a6 88%, #a9cf84 100%)",
        ].join(", "),
      }}
    >
      {/* wooden lattice far behind, out of focus */}
      <div aria-hidden="true" className={`absolute inset-y-0 z-[1] w-[70%] ${isLeft ? "left-0" : "right-0"}`}>
        <Lattice id={`lat-${side}`} />
      </div>

      {/* distant hazy hills for atmospheric depth */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute inset-x-0 bottom-[5dvh] z-[2] h-[42%] w-full ${isLeft ? "" : "-scale-x-100"}`}
      >
        <defs>
          <linearGradient id={`hill-far-${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fc79a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#6fae7c" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`hill-near-${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4f9a5e" stopOpacity="0.7" />
            <stop offset="1" stopColor="#3b7d4a" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d="M0 70 C70 38 130 70 200 88 S330 118 400 128 V200 H0Z"
          fill={`url(#hill-far-${side})`}
          style={{ filter: "blur(1.5px)" }}
        />
        <path d="M0 112 C80 82 150 122 230 130 S340 150 400 156 V200 H0Z" fill={`url(#hill-near-${side})`} />
      </svg>

      {/* back foliage layer, softly blurred for depth */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-[5dvh] top-0 z-[5] opacity-80 blur-[1.5px] ${
          isLeft ? "" : "-scale-x-100"
        }`}
      >
        <FoliageTop />
        <FoliageBottom />
      </div>

      {/* stone slab ground, like the tea-table stone */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-0 h-[5dvh] border-t border-[#e0b558]/60"
        style={{ background: "linear-gradient(180deg, #d8cfbd 0%, #b3a994 55%, #8d8472 100%)" }}
      >
        <div className="absolute inset-x-0 top-[45%] h-px bg-black/20" />
        <div className="absolute inset-x-0 top-[78%] h-px bg-black/25" />
        <div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg, rgba(120,180,90,0.5) 0%, rgba(80,140,60,0.2) 60%, transparent 100%)",
          }}
        />
      </div>

      {/* tower, mirrored for the right half (gap kept at the seam) */}
      <div
        className={`absolute bottom-[5dvh] left-0 right-3 top-0 z-10 md:right-10 ${isLeft ? "" : "-scale-x-100"}`}
      >
        <Tower id={`gate-${side}`} />
      </div>

      {/* small sharp foreground leaves and flowers in the bottom outer corner */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-[4dvh] z-[15] h-[30%] ${isLeft ? "" : "-scale-x-100"}`}
      >
        <FoliageBottom small />
      </div>

      {/* gold edge at the seam */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 z-20 w-px bg-gradient-to-b from-transparent via-[#f9e3a8]/90 to-transparent ${
          isLeft ? "right-0" : "left-0"
        }`}
      />
    </div>
  );
}

// Drifting blossoms: jasmine white, butterfly-pea blue, rose pink
const PETALS = [
  { l: "12%", d: 0, t: 9, c: "#fffdf4", s: 10, dx: "40px" },
  { l: "28%", d: 2.2, t: 11, c: "#3347d8", s: 8, dx: "-30px" },
  { l: "41%", d: 0.9, t: 10, c: "#f06a8e", s: 9, dx: "50px" },
  { l: "57%", d: 3.1, t: 12, c: "#fffdf4", s: 9, dx: "-45px" },
  { l: "70%", d: 1.4, t: 9.5, c: "#f06a8e", s: 8, dx: "35px" },
  { l: "84%", d: 2.7, t: 11, c: "#3347d8", s: 10, dx: "-40px" },
];

export default function IntroGate() {
  const [phase, setPhase] = useState<"visible" | "opening" | "done">("visible");
  const [logoIn, setLogoIn] = useState(false);

  useEffect(() => {
    // Show the intro once per browser session, and skip it for reduced-motion users
    const markDone = () => {
      (window as unknown as { __finastoIntroDone?: boolean }).__finastoIntroDone = true;
      window.dispatchEvent(new Event(INTRO_EVENT));
    };
    // Open any page with ?intro in the URL to force the intro to replay while testing
    const force = new URLSearchParams(window.location.search).has("intro");
    let seen = false;
    try {
      seen = !force && !!sessionStorage.getItem(SESSION_KEY);
    } catch {}
    if (seen) {
      setPhase("done");
      markDone();
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => setLogoIn(true));
    const openTimer = setTimeout(() => setPhase("opening"), HOLD_MS);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      markDone();
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
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
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes finasto-petal {
          0% { opacity: 0; transform: translate3d(0,-8vh,0) rotate(0deg); }
          12% { opacity: 0.95; }
          85% { opacity: 0.9; }
          100% { opacity: 0; transform: translate3d(var(--dx),92vh,0) rotate(520deg); }
        }
        @keyframes finasto-beam {
          0% { opacity: 0; transform: translateX(-50%) scaleX(.15); }
          22% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) scaleX(1.3); }
        }
        @keyframes finasto-rays {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes finasto-dapple {
          0% { transform: translate3d(-2%, -1%, 0) scale(1); }
          50% { transform: translate3d(2%, 1.5%, 0) scale(1.04); }
          100% { transform: translate3d(-2%, -1%, 0) scale(1); }
        }
        @keyframes finasto-sway-a {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes finasto-sway-b {
          0%, 100% { transform: rotate(1.5deg); }
          50% { transform: rotate(-2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="finasto-sway"], [style*="finasto-dapple"], [style*="finasto-rays"] { animation: none !important; }
          [style*="finasto-petal"] { display: none !important; }
        }
      `}</style>

      {/* light pouring through the opening gap (sits behind the halves) */}
      {opening && (
        <div
          className="absolute inset-y-0 left-1/2 w-[34vw]"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 55%, rgba(255,252,232,0.55) 0%, rgba(255,236,170,0.22) 40%, transparent 72%)",
            animation: `finasto-beam ${OPEN_MS * 0.7}ms ease-out forwards`,
          }}
        />
      )}

      {/* the two gate halves */}
      <GateHalf side="left" open={opening} />
      <GateHalf side="right" open={opening} />

      {/* atmosphere and medallion, fades out as the gate opens */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: opening ? 0 : logoIn ? 1 : 0,
          transform: opening ? "scale(1.12)" : logoIn ? "scale(1)" : "scale(0.94)",
          transition: opening
            ? `opacity ${OPEN_MS * 0.4}ms ease-in, transform ${OPEN_MS * 0.4}ms ease-in`
            : `opacity ${LOGO_IN_MS}ms ease-out, transform ${LOGO_IN_MS}ms ease-out`,
        }}
      >
        {/* sun rays falling through the canopy */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 158deg at 50% -8%, transparent 0deg, rgba(255,250,215,0.38) 5deg, transparent 11deg, rgba(255,250,215,0.26) 16deg, transparent 22deg, rgba(255,250,215,0.38) 28deg, transparent 34deg, rgba(255,250,215,0.22) 38deg, transparent 44deg)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 78%)",
            maskImage: "linear-gradient(180deg, black 0%, transparent 78%)",
            animation: "finasto-rays 6s ease-in-out infinite",
          }}
        />
        {/* dappled leaf-light drifting across the scene */}
        <div
          aria-hidden="true"
          className="absolute -inset-[5%]"
          style={{
            background: [
              "radial-gradient(ellipse 14% 10% at 18% 22%, rgba(255,250,220,0.5), transparent 70%)",
              "radial-gradient(ellipse 10% 14% at 36% 58%, rgba(255,250,220,0.4), transparent 70%)",
              "radial-gradient(ellipse 16% 9% at 72% 30%, rgba(255,250,220,0.45), transparent 70%)",
              "radial-gradient(ellipse 9% 12% at 84% 68%, rgba(255,250,220,0.35), transparent 70%)",
            ].join(", "),
            animation: "finasto-dapple 12s ease-in-out infinite",
            mixBlendMode: "soft-light",
          }}
        />
        {/* low morning mist along the ground */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[34%]"
          style={{
            background:
              "linear-gradient(0deg, rgba(255,255,244,0.5) 0%, rgba(240,250,230,0.18) 55%, transparent 100%)",
          }}
        />
        {/* fine film grain for a photographic feel */}
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.08] mix-blend-multiply">
          <filter id="intro-film-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#intro-film-grain)" />
        </svg>

        {/* drifting blossoms */}
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="absolute top-0"
            style={
              {
                left: p.l,
                width: p.s,
                height: p.s * 1.4,
                background: p.c,
                borderRadius: "70% 0 70% 0",
                boxShadow: "0 1px 3px rgba(40,50,20,0.25)",
                "--dx": p.dx,
                animation: `finasto-petal ${p.t}s linear ${p.d}s infinite`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* deep-green medallion with a gold ring: the one dark anchor in the bright scene */}
        <div
          className="relative flex h-[200px] w-[200px] flex-col items-center justify-center gap-3 rounded-full md:h-[250px] md:w-[250px]"
          style={{
            background: "radial-gradient(circle at 50% 28%, #2f7a4a 0%, #1b5233 60%, #0f3322 100%)",
            boxShadow: [
              "0 0 0 1px rgba(249,227,168,0.95)",
              "0 0 0 6px rgba(15,51,34,0.95)",
              "0 0 0 7px rgba(224,181,88,0.65)",
              "0 24px 60px rgba(40,60,20,0.35)",
              "0 0 90px rgba(255,236,170,0.55)",
              "inset 0 1px 0 rgba(249,227,168,0.35)",
              "inset 0 -12px 24px rgba(0,0,0,0.25)",
            ].join(", "),
          }}
        >
          <BaliGate
            strokeWidth={1.1}
            className="h-11 w-11 text-[#f9e3a8] drop-shadow-[0_0_12px_rgba(224,181,88,0.7)] md:h-14 md:w-14"
          />
          {/* medallion is deep green, so keep the light-on-dark logo */}
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