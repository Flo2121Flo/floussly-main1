import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "../lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSelector({ variant = "select" }: { variant?: "select" | "grid" | "switch" }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", flag: "🇲🇦" },
    { code: "ber", name: "ⵜⴰⵎⴰⵣⵉⵖⵜ", flag: "🏳️" }
  ];
  
  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4 w-4/5 max-w-xs mx-auto">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant="outline"
            className="p-4 h-auto flex flex-col items-center justify-center card-shadow hover:bg-muted"
            onClick={() => setLanguage(lang.code)}
          >
            <span className="text-2xl mb-2">{lang.flag}</span>
            <span className={`text-sm font-medium ${lang.code === "ar" ? "font-tajawal" : ""}`}>
              {lang.name}
            </span>
          </Button>
        ))}
      </div>
    );
  }
  
  if (variant === "switch") {
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
            <Globe className="text-muted-foreground h-5 w-5" />
          </div>
          <span>{t("settings.language")}</span>
        </div>
        <Select
          value={language}
          onValueChange={setLanguage}
        >
          <SelectTrigger className="w-32 bg-transparent border-none focus:ring-0">
            <SelectValue placeholder={t("settings.language")} />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center">
                  <span className="mr-2">{lang.flag}</span>
                  <span className={lang.code === "ar" ? "font-tajawal" : ""}>
                    {lang.name}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  return (
    <Select
      value={language}
      onValueChange={setLanguage}
    >
      <SelectTrigger className="w-32">
        <SelectValue placeholder={t("settings.language")} />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center">
              <span className="mr-2">{lang.flag}</span>
              <span className={lang.code === "ar" ? "font-tajawal" : ""}>
                {lang.name}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
