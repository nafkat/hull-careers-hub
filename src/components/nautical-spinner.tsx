import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Industrial loading indicator: a riveted steel ring with a rotating
 * gear-toothed outer rim and a pulsing weld core.
 */
export function NauticalSpinner({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const { t } = useTranslation();
  const teeth = Array.from({ length: 12 }, (_, i) => i * 30);
  const rivets = [0, 90, 180, 270];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative size-12" role="status" aria-label={label ?? t.loading}>
        {/* rotating gear rim */}
        <div className="absolute inset-0 animate-spin [animation-duration:3.2s]">
          {teeth.map((deg) => (
            <span
              key={deg}
              className="absolute top-1/2 left-1/2 h-[5px] w-[3px] rounded-[1px] bg-steel"
              style={{ transform: `rotate(${deg}deg) translateY(-22px)` }}
            />
          ))}
        </div>
        {/* steel plate ring */}
        <div className="absolute inset-[6px] rounded-full border-2 border-steel bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
        {/* rivets on the plate */}
        {rivets.map((deg) => (
          <span
            key={deg}
            className="absolute top-1/2 left-1/2 size-1 rounded-full bg-muted-foreground/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
            style={{ transform: `rotate(${deg}deg) translateY(-12px)` }}
          />
        ))}
        {/* sweeping arc */}
        <div className="absolute inset-[6px] animate-spin rounded-full border-2 border-transparent border-t-primary [animation-duration:1.1s]" />
        {/* weld core */}
        <div className="absolute inset-0 grid place-items-center">
          <span className="size-1.5 animate-breathe rounded-full bg-accent shadow-[0_0_8px_var(--weld)]" />
        </div>
      </div>
      {label ? (
        <p className="font-mono text-[11px] tracking-[2px] text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}
    </div>
  );
}
