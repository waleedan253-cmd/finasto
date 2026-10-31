// Decorative, code-drawn botanical scene (tea sprig, camellia flower, coffee branch)
// inside an arch frame. No external image files, so it is sharp on every screen.

const LEAF = "M0 0 C11 -14 13 -42 0 -68 C-13 -42 -11 -14 0 0Z";

function Leaf({
  x,
  y,
  r,
  s,
  fill = "url(#ba-leaf-a)",
}: {
  x: number;
  y: number;
  r: number;
  s: number;
  fill?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d={LEAF} fill={fill} />
      <path d="M0 0V-62" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9" />
      {[1, 2, 3, 4].map((k) => (
        <path
          key={k}
          d={`M0 ${-k * 13}L9 ${-k * 13 - 8}M0 ${-k * 13}L-9 ${-k * 13 - 8}`}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.7"
          fill="none"
        />
      ))}
    </g>
  );
}

function Cherry({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="url(#ba-cherry)" />
      <ellipse
        cx={x - r * 0.32}
        cy={y - r * 0.36}
        rx={r * 0.3}
        ry={r * 0.18}
        fill="rgba(255,255,255,0.5)"
      />
      <circle cx={x + r * 0.1} cy={y - r * 0.95} r="1.7" fill="#5b2a1c" />
    </g>
  );
}

export function BotanicalArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 480 600"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="ba-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef2e8" />
          <stop offset="1" stopColor="#f7f1e7" />
        </linearGradient>
        <radialGradient id="ba-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#e0a56d" stopOpacity="0.6" />
          <stop offset="1" stopColor="#e0a56d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ba-leaf-a" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#234d2a" />
          <stop offset="1" stopColor="#5f9a45" />
        </linearGradient>
        <linearGradient id="ba-leaf-b" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3e762f" />
          <stop offset="1" stopColor="#8fcb62" />
        </linearGradient>
        <linearGradient id="ba-leaf-c" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#173a20" />
          <stop offset="1" stopColor="#2f6a3a" />
        </linearGradient>
        <radialGradient id="ba-cherry" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#e8584a" />
          <stop offset="1" stopColor="#8f2820" />
        </radialGradient>
        <linearGradient id="ba-petal" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f1e6cc" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <clipPath id="ba-arch">
          <path d="M20 600 V230 A220 220 0 0 1 460 230 V600 Z" />
        </clipPath>
      </defs>

      <g clipPath="url(#ba-arch)">
        {/* sky */}
        <rect width="480" height="600" fill="url(#ba-bg)" />
        <circle cx="240" cy="230" r="170" fill="url(#ba-sun)" />

        {/* distant hills */}
        <path
          d="M0 600 V470 C80 430 150 460 230 440 S400 430 480 460 V600Z"
          fill="#3e762f"
          opacity="0.18"
        />
        <path
          d="M0 600 V525 C100 495 190 525 280 510 S420 505 480 525 V600Z"
          fill="#234d2a"
          opacity="0.26"
        />

        {/* tea sprig (left) */}
        <path
          d="M-10 570 C60 480 110 405 175 330"
          stroke="#234d2a"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Leaf x={36} y={508} r={-48} s={1.15} />
        <Leaf x={62} y={478} r={42} s={1.1} fill="url(#ba-leaf-b)" />
        <Leaf x={92} y={443} r={-44} s={1.05} />
        <Leaf x={118} y={410} r={38} s={1.1} fill="url(#ba-leaf-b)" />
        <Leaf x={144} y={372} r={-36} s={1} />
        <Leaf x={168} y={338} r={14} s={0.95} fill="url(#ba-leaf-b)" />

        {/* coffee branch (right) */}
        <path
          d="M495 585 C425 505 385 435 335 372"
          stroke="#173a20"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Leaf x={450} y={548} r={-58} s={1.3} fill="url(#ba-leaf-c)" />
        <Leaf x={420} y={512} r={30} s={1.25} fill="url(#ba-leaf-a)" />
        <Leaf x={392} y={478} r={-52} s={1.2} fill="url(#ba-leaf-c)" />
        <Leaf x={366} y={440} r={26} s={1.15} fill="url(#ba-leaf-a)" />
        <Leaf x={344} y={402} r={-40} s={1.05} fill="url(#ba-leaf-c)" />
        <Cherry x={412} y={534} />
        <Cherry x={426} y={548} r={10} />
        <Cherry x={398} y={550} r={10} />
        <Cherry x={372} y={466} r={10} />
        <Cherry x={386} y={480} r={9.5} />
        <Cherry x={360} y={482} r={9.5} />

        {/* back leaves behind the flower */}
        <Leaf x={255} y={338} r={-38} s={1.5} fill="url(#ba-leaf-a)" />
        <Leaf x={255} y={338} r={38} s={1.5} fill="url(#ba-leaf-b)" />

        {/* camellia (tea) flower */}
        <g transform="translate(255 330)">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`rotate(${i * 72})`}>
              <path
                d="M0 0 C-26 -26 -24 -62 0 -78 C24 -62 26 -26 0 0Z"
                fill="url(#ba-petal)"
                stroke="#e6d9bd"
                strokeWidth="0.9"
              />
              <path
                d="M0 -6 C-8 -24 -7 -46 0 -60"
                stroke="rgba(190,160,100,0.35)"
                strokeWidth="0.8"
              />
            </g>
          ))}
          {Array.from({ length: 28 }).map((_, i) => {
            const a = (i / 28) * Math.PI * 2;
            const rad = 11 + (i % 3) * 4;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * rad}
                cy={Math.sin(a) * rad}
                r="2"
                fill="#e8b84a"
              />
            );
          })}
          <circle r="6" fill="#d9a02f" />
        </g>

        {/* foreground leaves */}
        <Leaf x={70} y={600} r={22} s={2.1} fill="url(#ba-leaf-c)" />
        <Leaf x={20} y={600} r={-12} s={1.8} fill="url(#ba-leaf-a)" />
        <Leaf x={420} y={604} r={-24} s={2} fill="url(#ba-leaf-c)" />
      </g>

      {/* frame */}
      <path
        d="M20 600 V230 A220 220 0 0 1 460 230 V600"
        stroke="#c98245"
        strokeWidth="1.6"
      />
      <path
        d="M34 600 V230 A206 206 0 0 1 446 230 V600"
        stroke="#c98245"
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeDasharray="3 5"
      />
    </svg>
  );
}