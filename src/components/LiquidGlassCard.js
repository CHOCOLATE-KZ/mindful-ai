export default function LiquidGlassCard({ children, className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/50 ${className}`}>
      <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl saturate-150" />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <filter id="lg-noise" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.012"
              numOctaves="1"
              seed="8"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.008 0.012; 0.012 0.02; 0.008 0.012"
                dur="12s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
            <feSpecularLighting
              in="soft"
              surfaceScale="4"
              specularConstant="1"
              specularExponent="80"
              lightingColor="white"
              result="spec"
            >
              <fePointLight x="-200" y="-200" z="250" />
            </feSpecularLighting>
            <feComposite in="spec" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>

          <linearGradient id="lg-tint" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".65" />
            <stop offset=".45" stopColor="#fff" stopOpacity=".25" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#lg-tint)" filter="url(#lg-noise)" />
      </svg>

      <div className="relative p-8">{children}</div>
    </div>
  );
}
