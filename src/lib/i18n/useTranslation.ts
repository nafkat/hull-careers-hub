import { useI18n } from "./context";
import { translations } from "./translations";

export function useTranslation() {
  const { lang } = useI18n();
  const t = translations[lang];
  return { t, lang };
}
