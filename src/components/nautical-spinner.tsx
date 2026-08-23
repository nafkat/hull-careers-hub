import { cn } from "@/lib/utils";

export function NauticalSpinner({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative size-12" role="status" aria-label={label ?? "Loading"}>
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-gold/70 [animation-duration:3s]" />
        <div className="absolute inset-[6px] rounded-full border border-primary/60" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="size-1.5 rounded-full bg-gold" />
        </div>
        <div className="absolute inset-[3px] animate-spin rounded-full border-t-2 border-primary [animation-duration:1.1s]" />
      </div>
      {label ? <p className="text-xs tracking-widest text-muted-foreground uppercase">{label}</p> : null}
    </div>
  );
}
