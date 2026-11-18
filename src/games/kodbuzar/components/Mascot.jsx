// Kalitjon — o'yin yordamchisi. Kayfiyatlari: idle, think, happy, wow, sad, party.
// Butunlay SVG va CSS: rasm fayllari kerak emas.

const EYES = {
  idle: (
    <g className="m-eyes">
      <ellipse cx="47" cy="53" rx="6" ry="8" />
      <ellipse cx="73" cy="53" rx="6" ry="8" />
    </g>
  ),
  think: (
    <g className="m-eyes">
      <ellipse cx="49" cy="50" rx="6" ry="7" />
      <path d="M67 52 q6 -4 12 0" className="m-line" />
    </g>
  ),
  happy: (
    <g className="m-eyes">
      <path d="M41 55 q6 -9 12 0" className="m-line" />
      <path d="M67 55 q6 -9 12 0" className="m-line" />
    </g>
  ),
  party: (
    <g className="m-eyes">
      <path d="M47 46 l2.5 5 5.5 .8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.5 -.8z" />
      <path d="M73 46 l2.5 5 5.5 .8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.5 -.8z" />
    </g>
  ),
  wow: (
    <g className="m-eyes">
      <circle cx="47" cy="52" r="8" />
      <circle cx="73" cy="52" r="8" />
      <circle cx="49" cy="50" r="2.5" className="m-shine" />
      <circle cx="75" cy="50" r="2.5" className="m-shine" />
    </g>
  ),
  sad: (
    <g className="m-eyes">
      <ellipse cx="47" cy="55" rx="5" ry="6" />
      <ellipse cx="73" cy="55" rx="5" ry="6" />
      <path d="M39 45 l12 4" className="m-line" />
      <path d="M81 45 l-12 4" className="m-line" />
    </g>
  ),
};

const MOUTH = {
  idle: <path d="M53 66 q7 5 14 0" className="m-line" />,
  think: <path d="M54 67 h12" className="m-line" />,
  happy: <path d="M50 64 q10 10 20 0 z" className="m-fill" />,
  party: <path d="M48 63 q12 13 24 0 z" className="m-fill" />,
  wow: <ellipse cx="60" cy="67" rx="5" ry="6" className="m-fill" />,
  sad: <path d="M52 70 q8 -6 16 0" className="m-line" />,
};

export default function Mascot({ mood = 'idle', size = 88 }) {
  const m = EYES[mood] ? mood : 'idle';
  return (
    <span className={`mascot mood-${m}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs>
          <linearGradient id="m-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="m-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#4c1d95" />
          </linearGradient>
          <radialGradient id="m-bulb">
            <stop offset="0" stopColor="#fff7c2" />
            <stop offset="1" stopColor="#fbbf24" />
          </radialGradient>
        </defs>
        <ellipse className="m-shadow" cx="60" cy="114" rx="26" ry="4" />
        <g className="m-bot">
          <g className="m-antenna">
            <line x1="60" y1="24" x2="60" y2="10" />
            <circle cx="60" cy="8" r="6" fill="url(#m-bulb)" className="m-bulb" />
          </g>
          <g className="m-arm m-arm-l"><rect x="20" y="86" width="12" height="20" rx="6" fill="#7c3aed" /></g>
          <g className="m-arm m-arm-r"><rect x="88" y="86" width="12" height="20" rx="6" fill="#7c3aed" /></g>
          <rect x="34" y="82" width="52" height="28" rx="12" fill="url(#m-body)" />
          {/* Ko'kragidagi kalit teshigi */}
          <circle cx="60" cy="93" r="4.5" fill="#fbbf24" />
          <path d="M57.5 95 h5 l1.5 8 h-8z" fill="#fbbf24" />
          <circle cx="14" cy="54" r="7" fill="#7c3aed" />
          <circle cx="106" cy="54" r="7" fill="#7c3aed" />
          <rect x="16" y="22" width="88" height="64" rx="28" fill="url(#m-head)" />
          <rect x="26" y="33" width="68" height="44" rx="18" className="m-screen" />
          <ellipse cx="42" cy="30" rx="14" ry="4" fill="#fff" opacity="0.25" />
          {EYES[m]}
          {MOUTH[m]}
          {(m === 'happy' || m === 'party') && (
            <>
              <ellipse cx="36" cy="64" rx="5" ry="3" className="m-blush" />
              <ellipse cx="84" cy="64" rx="5" ry="3" className="m-blush" />
            </>
          )}
        </g>
      </svg>
    </span>
  );
}

/** Personaj va uning gap pufagi. text o'zgarganda pufak qayta "sakraydi". */
export function Coach({ mood, text, size }) {
  return (
    <div className="coach">
      <Mascot mood={mood} size={size} />
      <p className={`bubble mood-${mood}`} key={text} aria-live="polite">{text}</p>
    </div>
  );
}
