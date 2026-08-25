import { Link } from "@tanstack/react-router";
import { Anchor } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function SiteHeader() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Anchor className="size-5 text-gold" />
          <span className="font-display text-lg tracking-[0.28em] text-foreground">
            EUROHULL
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hidden transition-colors hover:text-foreground sm:inline">
            {t.nav.home}
          </Link>
          <Link to="/jobs" className="transition-colors hover:text-foreground">
            {t.nav.positions}
          </Link>
          <Link to="/admin" className="transition-colors hover:text-foreground">
            {t.nav.admin}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-muted-foreground">
        <span className="font-display tracking-[0.28em] text-foreground">EUROHULL</span>
        <p>{t.footer.tagline}</p>
        <p className="text-xs">
          © {new Date().getFullYear()} {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
