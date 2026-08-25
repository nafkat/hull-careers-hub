import { useI18n } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { lang, toggleLang } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLang}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[2px] border border-steel/50 bg-card/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[1px] text-fog transition-colors hover:border-primary hover:text-foreground"
      aria-label={`Switch to ${lang === "el" ? "English" : "Ελληνικά"}`}
    >
      <span className={lang === "el" ? "text-foreground" : "text-fog"}>GR</span>
      <span className="text-steel">/</span>
      <span className={lang === "en" ? "text-foreground" : "text-fog"}>EN</span>
    </button>
  );
}
