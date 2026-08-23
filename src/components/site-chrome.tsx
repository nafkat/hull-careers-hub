import { Link } from "@tanstack/react-router";
import { Anchor } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Anchor className="size-5 text-gold" />
          <span className="font-display text-lg tracking-[0.28em] text-foreground">
            EUROHULL
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/jobs" className="transition-colors hover:text-foreground">
            Open roles
          </Link>
          <Link to="/admin" className="transition-colors hover:text-foreground">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-muted-foreground">
        <span className="font-display tracking-[0.28em] text-foreground">EUROHULL</span>
        <p>Building the Future of Maritime — Elefsina & Piraeus shipyards, Greece.</p>
        <p className="text-xs">© {new Date().getFullYear()} EUROHULL Shipyards S.A.</p>
      </div>
    </footer>
  );
}
