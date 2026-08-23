export function OceanBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute inset-x-0 top-1/3 h-[70%] animate-drift bg-[radial-gradient(60%_50%_at_20%_40%,color-mix(in_oklab,var(--gold)_12%,transparent),transparent_70%)]" />
      <svg
        className="absolute inset-x-0 bottom-0 h-[38%] w-[140%] animate-wave text-primary/20"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,192L60,181.3C120,171,240,149,360,160C480,171,600,213,720,224C840,235,960,213,1080,186.7C1200,160,1320,128,1380,112L1440,96L1440,320L0,320Z"
        />
      </svg>
      <svg
        className="absolute inset-x-0 bottom-0 h-[30%] w-[140%] animate-wave-slow text-gold/10"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,224L80,208C160,192,320,160,480,165.3C640,171,800,213,960,224C1120,235,1280,213,1360,202.7L1440,192L1440,320L0,320Z"
        />
      </svg>
    </div>
  );
}
