import { useEffect } from "react";
import { cn } from "@/lib/utils";

/** Pause CSS animations while the tab is hidden (saves battery/CPU). */
export function useAnimationVisibilityPause() {
  useEffect(() => {
    const handler = () => {
      document.body.style.setProperty(
        "--animation-play-state",
        document.hidden ? "paused" : "running",
      );
    };
    handler();
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
}

/** Four corner rivets for a metal plate. Purely decorative. */
export function Rivets({ className }: { className?: string }) {
  const positions = ["top-1.5 left-1.5", "top-1.5 right-1.5", "bottom-1.5 left-1.5", "bottom-1.5 right-1.5"];
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {positions.map((pos) => (
        <span
          key={pos}
          className={cn(
            "absolute size-1.5 rounded-full bg-steel",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.8)]",
            pos,
          )}
        />
      ))}
    </span>
  );
}

/** Welding sparks that fly out on hover of the parent (`group`). */
export function SparkBurst({ className }: { className?: string }) {
  const sparks = [
    { left: "8%", bottom: "10%", delay: "0s" },
    { left: "26%", bottom: "6%", delay: "0.12s" },
    { left: "52%", bottom: "12%", delay: "0.05s" },
    { left: "74%", bottom: "8%", delay: "0.2s" },
    { left: "90%", bottom: "14%", delay: "0.28s" },
  ];
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-visible opacity-0 transition-opacity duration-150 group-hover:opacity-100",
        className,
      )}
    >
      {sparks.map((s) => (
        <span
          key={s.left}
          className="absolute size-[3px] rounded-full bg-accent shadow-[0_0_6px_var(--weld)] group-hover:animate-spark-fly"
          style={{ left: s.left, bottom: s.bottom, animationDelay: s.delay }}
        />
      ))}
    </span>
  );
}

/** Rotating spotlight beams + drifting dust motes for the hero. */
export function YardAtmosphere() {
  useAnimationVisibilityPause();
  const dust = Array.from({ length: 36 }, (_, i) => ({
    mobileHidden: i >= 18,
    left: `${(i * 37) % 100}%`,
    top: `${(i * 53) % 100}%`,
    delay: `${(i % 15) * 1}s`,
    duration: `${13 + (i % 7)}s`,
    scale: 0.6 + ((i % 5) * 0.25),
  }));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#132a49,#0b1f3a)]" />
      <div className="beam-layer gpu absolute -inset-[40%] opacity-70" />
      <div
        className="beam-layer absolute -inset-[55%] opacity-40 [animation-direction:reverse] [animation-duration:38s]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--poppy)_14%,transparent),transparent_62%)]" />
      {dust.map((d) => (
        <span
          key={`${d.left}-${d.top}-${d.delay}`}
          className={cn("dust-dot", d.mobileHidden && "hidden sm:block")}
          style={{
            left: d.left,
            top: d.top,
            animationDelay: d.delay,
            animationDuration: d.duration,
            transform: `scale(${d.scale})`,
          }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,var(--navy-deep))]" />
    </div>
  );
}
