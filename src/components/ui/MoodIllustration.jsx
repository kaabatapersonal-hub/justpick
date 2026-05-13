function LazyIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.12)" />
      {/* Sofa back rest */}
      <rect x="33" y="90" width="134" height="34" rx="9" fill="rgba(255,255,255,0.55)" />
      {/* Sofa seat */}
      <rect x="33" y="118" width="134" height="44" rx="9" fill="rgba(255,255,255,0.45)" />
      {/* Left arm */}
      <rect x="26" y="95" width="22" height="67" rx="8" fill="rgba(255,255,255,0.5)" />
      {/* Right arm */}
      <rect x="152" y="95" width="22" height="67" rx="8" fill="rgba(255,255,255,0.5)" />
      {/* Cushion divider */}
      <line x1="100" y1="118" x2="100" y2="162" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      {/* Blanket draped over */}
      <path
        d="M45 122 Q62 113 80 120 Q100 110 120 120 Q138 113 155 122 L155 158 Q138 150 120 158 Q100 148 80 158 Q62 150 45 158 Z"
        fill="rgba(255,255,255,0.28)"
      />
      {/* TV Remote */}
      <rect x="108" y="130" width="28" height="16" rx="4" fill="rgba(255,255,255,0.6)" />
      <circle cx="116" cy="136" r="2" fill="rgba(118,75,162,0.5)" />
      <circle cx="123" cy="136" r="2" fill="rgba(118,75,162,0.5)" />
      <circle cx="130" cy="136" r="2" fill="rgba(118,75,162,0.5)" />
      {/* Z floating */}
      <text x="110" y="80" fill="white" fontSize="24" fontFamily="sans-serif" fontWeight="bold" opacity="0.88">z</text>
      <text x="126" y="63" fill="white" fontSize="17" fontFamily="sans-serif" fontWeight="bold" opacity="0.65">z</text>
      <text x="138" y="50" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold" opacity="0.42">z</text>
    </svg>
  );
}

function BrokeIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.12)" />
      {/* Wallet body */}
      <rect x="42" y="84" width="116" height="72" rx="10" fill="rgba(255,255,255,0.48)" />
      {/* Wallet flap (top curve) */}
      <path d="M42 95 Q100 70 158 95 L158 84 Q100 58 42 84 Z" fill="rgba(255,255,255,0.62)" />
      {/* Interior empty card slots */}
      <rect x="58" y="104" width="84" height="14" rx="4" fill="rgba(255,255,255,0.22)" />
      <rect x="58" y="124" width="60" height="14" rx="4" fill="rgba(255,255,255,0.22)" />
      {/* Empty label */}
      <text x="82" y="115" fill="rgba(245,87,108,0.6)" fontSize="9" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1">EMPTY</text>
      {/* Sad face on wallet */}
      <circle cx="140" cy="131" r="10" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <circle cx="137" cy="129" r="1.5" fill="rgba(255,255,255,0.8)" />
      <circle cx="143" cy="129" r="1.5" fill="rgba(255,255,255,0.8)" />
      <path d="M136 135 Q140 132 144 135" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Flying coin (top right) */}
      <circle cx="158" cy="58" r="14" fill="rgba(255,255,255,0.55)" />
      <text x="151" y="64" fill="rgba(240,147,251,0.9)" fontSize="14" fontFamily="sans-serif" fontWeight="bold">$</text>
      {/* Motion lines from coin */}
      <line x1="140" y1="53" x2="126" y2="49" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <line x1="140" y1="59" x2="125" y2="58" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <line x1="140" y1="65" x2="126" y2="68" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AdventurousIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.12)" />
      {/* Rocket body */}
      <ellipse cx="100" cy="102" rx="22" ry="42" fill="rgba(255,255,255,0.72)" />
      {/* Nose cone */}
      <path d="M78 70 Q100 36 122 70 Z" fill="rgba(255,255,255,0.88)" />
      {/* Porthole window */}
      <circle cx="100" cy="96" r="11" fill="rgba(79,172,254,0.55)" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
      <circle cx="100" cy="96" r="5" fill="rgba(0,242,254,0.4)" />
      {/* Left fin */}
      <path d="M78 118 L56 148 L78 136 Z" fill="rgba(255,255,255,0.55)" />
      {/* Right fin */}
      <path d="M122 118 L144 148 L122 136 Z" fill="rgba(255,255,255,0.55)" />
      {/* Flame outer */}
      <ellipse cx="100" cy="148" rx="13" ry="18" fill="rgba(255,220,80,0.85)" />
      {/* Flame inner */}
      <ellipse cx="100" cy="151" rx="7" ry="11" fill="rgba(255,160,40,0.95)" />
      {/* Flame core */}
      <ellipse cx="100" cy="153" rx="3.5" ry="6" fill="rgba(255,255,200,0.9)" />
      {/* Stars */}
      <circle cx="46" cy="58" r="3.5" fill="rgba(255,255,255,0.9)" />
      <circle cx="160" cy="68" r="4.5" fill="rgba(255,255,255,0.9)" />
      <circle cx="38" cy="135" r="2.5" fill="rgba(255,255,255,0.7)" />
      <circle cx="166" cy="42" r="3" fill="rgba(255,255,255,0.8)" />
      <circle cx="162" cy="130" r="2" fill="rgba(255,255,255,0.6)" />
      <circle cx="55" cy="158" r="2" fill="rgba(255,255,255,0.65)" />
      {/* Star sparkle lines on big star */}
      <line x1="46" y1="52" x2="46" y2="48" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="46" y1="64" x2="46" y2="68" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="58" x2="36" y2="58" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="52" y1="58" x2="56" y2="58" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ProductiveIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.12)" />
      {/* Laptop base/keyboard */}
      <rect x="44" y="136" width="112" height="10" rx="4" fill="rgba(255,255,255,0.65)" />
      {/* Hinge detail */}
      <rect x="60" y="134" width="80" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
      {/* Laptop screen frame */}
      <rect x="52" y="78" width="96" height="62" rx="6" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" />
      {/* Screen surface */}
      <rect x="58" y="84" width="84" height="50" rx="3" fill="rgba(67,233,123,0.2)" />
      {/* Big checkmark on screen */}
      <path
        d="M76 110 L90 125 L124 93"
        stroke="rgba(56,249,215,1)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Coffee cup */}
      <rect x="150" y="120" width="24" height="22" rx="4" fill="rgba(255,255,255,0.5)" />
      {/* Cup handle */}
      <path d="M174 126 Q184 126 184 131 Q184 136 174 136" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Steam from cup */}
      <path d="M157 116 Q159 108 157 100" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M163 114 Q165 106 163 98" stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Small plant pot */}
      <path d="M30 148 Q26 132 34 132 L46 132 Q54 132 50 148 Z" fill="rgba(255,255,255,0.45)" />
      {/* Pot rim */}
      <rect x="26" y="148" width="28" height="5" rx="2" fill="rgba(255,255,255,0.55)" />
      {/* Plant stem */}
      <path d="M40 132 Q40 120 40 110" stroke="rgba(67,233,123,0.8)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Plant leaves */}
      <path d="M40 120 Q30 112 26 118 Q30 122 40 120 Z" fill="rgba(67,233,123,0.7)" />
      <path d="M40 113 Q50 105 54 111 Q50 115 40 113 Z" fill="rgba(56,249,215,0.7)" />
    </svg>
  );
}

function HungryIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.12)" />
      {/* Bowl */}
      <path d="M52 115 Q52 162 100 165 Q148 162 148 115 Z" fill="rgba(255,255,255,0.52)" />
      {/* Bowl lip (ellipse) */}
      <ellipse cx="100" cy="115" rx="48" ry="11" fill="rgba(255,255,255,0.68)" />
      {/* Bowl inner shadow */}
      <ellipse cx="100" cy="118" rx="40" ry="8" fill="rgba(250,112,154,0.15)" />
      {/* Noodles / food layer 1 */}
      <path
        d="M70 125 Q83 118 95 127 Q108 118 120 125 Q132 118 140 125"
        stroke="rgba(254,225,64,0.75)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Noodles / food layer 2 */}
      <path
        d="M68 137 Q82 129 97 138 Q112 129 130 137"
        stroke="rgba(250,112,154,0.7)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Fork (left) */}
      <line x1="46" y1="95" x2="46" y2="162" stroke="rgba(255,255,255,0.65)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="39" y1="95" x2="39" y2="112" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="95" x2="46" y2="112" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="53" y1="95" x2="53" y2="112" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Fork tine connector */}
      <path d="M39 112 Q46 118 53 112" stroke="rgba(255,255,255,0.55)" strokeWidth="2" fill="none" />
      {/* Spoon (right) */}
      <ellipse cx="154" cy="97" rx="9" ry="12" fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
      <line x1="154" y1="109" x2="154" y2="162" stroke="rgba(255,255,255,0.65)" strokeWidth="3.5" strokeLinecap="round" />
      {/* Steam lines */}
      <path d="M84 100 Q81 90 84 79" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M100 97 Q97 87 100 76" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M116 100 Q113 90 116 79" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx="148" cy="76" r="4" fill="rgba(255,255,255,0.85)" />
      <line x1="148" y1="68" x2="148" y2="64" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <line x1="148" y1="84" x2="148" y2="88" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <line x1="140" y1="76" x2="136" y2="76" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <line x1="156" y1="76" x2="160" y2="76" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="86" r="2.5" fill="rgba(255,255,255,0.65)" />
      <circle cx="162" cy="145" r="2" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

const ILLUSTRATION_MAP = {
  lazy: LazyIllustration,
  broke: BrokeIllustration,
  adventurous: AdventurousIllustration,
  productive: ProductiveIllustration,
  hungry: HungryIllustration,
};

export default function MoodIllustration({ mood }) {
  const Svg = ILLUSTRATION_MAP[mood.id] ?? LazyIllustration;
  return (
    <div className="relative w-48 h-48">
      <div className="w-full h-full rounded-3xl overflow-hidden backdrop-blur-sm bg-white/10 shadow-xl">
        <Svg />
      </div>
      {/* Emoji badge pinned to bottom-right */}
      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-xl shadow-md">
        {mood.emoji}
      </div>
    </div>
  );
}
