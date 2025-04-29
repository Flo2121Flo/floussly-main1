import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "../lib/i18n";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Globe } from "lucide-react";

const languageNames = {
  en: "English",
  fr: "Français",
  ar: "العربية",
  ber: "ⵜⴰⵎⴰⵣⵉⵖⵜ",
};

export function LanguageSelector() {
  const { language, setLanguage, isRtl } = useLanguage();
  const { t } = useTranslation();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("language.settings")}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("language.settings")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRtl ? "start" : "end"}
        className="w-40"
      >
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code as "en" | "fr" | "ar" | "ber")}
            className={language === code ? "bg-accent" : ""}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">{name}</span>
              {language === code && (
                <span className="text-xs text-muted-foreground">
                  {t("language.selected")}
                </span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
