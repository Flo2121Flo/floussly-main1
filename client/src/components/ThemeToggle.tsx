import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "../lib/i18n";

export default function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "switch" }) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  if (variant === "switch") {
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
            <Moon className="text-muted-foreground h-5 w-5" />
          </div>
          <span>{t("settings.darkMode")}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="icon"
      onClick={toggleTheme}
      className="rounded-full bg-card"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-secondary" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
