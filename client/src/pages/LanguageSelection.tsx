import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'ar',
    name: 'العربية',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true
  },
  {
    code: 'ber',
    name: 'Tamazight',
    nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
    flag: '🇲🇦'
  }
];

export default function LanguageSelection() {
  const { t, i18n } = useTranslation();
  const [_, setLocation] = useLocation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    setLocation('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">{t('languageSelection.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('languageSelection.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={i18n.language === language.code ? 'default' : 'outline'}
              className="w-full h-16 text-lg"
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="text-2xl mr-2">{language.flag}</span>
              <span>{language.nativeName}</span>
              {language.name !== language.nativeName && (
                <span className="text-muted-foreground ml-2">({language.name})</span>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
