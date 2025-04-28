import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Moon, 
  Bell, 
  Globe, 
  Eye, 
  Check,
  Key, 
  Shield, 
  History, 
  HelpCircle, 
  Headset, 
  Star,
  LogOut,
  ChevronRight,
  Fingerprint
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/ui/theme-provider";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Profile() {
  const [_, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  let { user, logout } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // State for notification and biometric login preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState(true);
  const [notificationCount, setNotificationCount] = useState(1);
  
  // Create a mock user for testing if no user is found
  if (!user) {
    user = {
      id: 1,
      username: "mohalami",
      password: "hashed_password",
      name: "Mohammed Alami", 
      phone: "+212600000000",
      email: "mohammed@example.com",
      profileImage: null,
      isVerified: true,
      role: "user",
      language: "en",
      createdAt: new Date()
    };
    
    // Create a mock logout function if the real one is not available
    if (!logout) {
      logout = () => {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully"
        });
        setLocation("/login");
      };
    }
  }

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "This feature is not available in the demo"
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'en': return 'English';
      case 'fr': return 'Français';
      case 'ar': return 'العربية';
      case 'ber': return 'ⵜⴰⵎⴰⵣⵉⵖⵜ';
      default: return 'English';
    }
  };

  const getLanguageFlag = (code: string) => {
    switch (code) {
      case 'en': return '🇬🇧';
      case 'fr': return '🇫🇷';
      case 'ar': return '🇲🇦';
      case 'ber': return '🏳️';
      default: return '🇬🇧';
    }
  };

  const currentLanguage = i18n.language || 'en';

  // Function to toggle notifications with animation effect
  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    if (newState) {
      // When enabling notifications, add a new notification
      setNotificationCount(1);
    } else {
      // When disabling notifications, clear notifications
      setNotificationCount(0);
    }
  };

  // Function to toggle biometric login with animation effect
  const toggleBiometricLogin = () => {
    const newState = !biometricLoginEnabled;
    setBiometricLoginEnabled(newState);
    
    // Show fingerprint animation briefly
    const fingerprintEl = document.getElementById('biometric-icon');
    if (fingerprintEl) {
      fingerprintEl.classList.add('animate-pulse');
      setTimeout(() => {
        fingerprintEl.classList.remove('animate-pulse');
      }, 1000);
    }
  };

  return (
    <div className="p-6 pt-12 pb-20">
      <Button 
        variant="ghost" 
        className="mb-8 flex items-center text-muted-foreground p-0"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <h1 className="font-poppins font-bold text-3xl mb-6">{t("settings.title")}</h1>
      
      <Card className="mb-6 bg-card">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <Avatar className="w-16 h-16 mr-4">
              <AvatarImage src={user.profileImage || undefined} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-lg">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            </div>
          </div>
          <Button 
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleEditProfile}
          >
            {t("settings.editProfile")}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6 bg-card">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t("settings.preferences")}</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Moon className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.darkMode")}</span>
              </div>
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Globe className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.language")}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-muted-foreground px-0" type="button">
                    <span className="mr-2">{getLanguageFlag(currentLanguage)} {getLanguageName(currentLanguage)}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer py-2 px-3"
                    onClick={() => handleLanguageChange('en')}
                  >
                    <span className="mr-2">🇬🇧 English</span>
                    {currentLanguage === 'en' && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer py-2 px-3"
                    onClick={() => handleLanguageChange('fr')}
                  >
                    <span className="mr-2">🇫🇷 Français</span>
                    {currentLanguage === 'fr' && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer py-2 px-3"
                    onClick={() => handleLanguageChange('ar')}
                  >
                    <span className="mr-2">🇲🇦 العربية</span>
                    {currentLanguage === 'ar' && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer py-2 px-3"
                    onClick={() => handleLanguageChange('ber')}
                  >
                    <span className="mr-2">🏳️ ⵜⴰⵎⴰⵣⵉⵖⵜ</span>
                    {currentLanguage === 'ber' && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3 relative">
                  <Bell className="text-muted-foreground h-5 w-5" />
                  {notificationsEnabled && notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </div>
                <span>{t("settings.notifications")}</span>
              </div>
              <Switch 
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Fingerprint id="biometric-icon" className={`text-muted-foreground h-5 w-5 ${biometricLoginEnabled ? 'text-green-500' : ''}`} />
                </div>
                <span>{t("settings.biometricLogin")}</span>
              </div>
              <Switch 
                checked={biometricLoginEnabled}
                onCheckedChange={toggleBiometricLogin}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 bg-card">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t("settings.security.title")}</h3>
          
          <div className="space-y-4">
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => toast({ title: "Change PIN", description: "This feature is not available in the demo" })}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Key className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.security.changePin")}</span>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </button>
            
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => toast({ title: "Security Settings", description: "This feature is not available in the demo" })}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Shield className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.security.securitySettings")}</span>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </button>
            
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => toast({ title: "Login Activity", description: "This feature is not available in the demo" })}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <History className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.security.loginActivity")}</span>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 bg-card">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t("settings.support.title")}</h3>
          
          <div className="space-y-4">
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => toast({ title: "Help Center", description: "This feature is not available in the demo" })}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <HelpCircle className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.support.helpCenter")}</span>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </button>
            
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => toast({ title: "Contact Support", description: "This feature is not available in the demo" })}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Headset className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.support.contactSupport")}</span>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </button>
            
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => toast({ title: "Rate App", description: "This feature is not available in the demo" })}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Star className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.support.rateApp")}</span>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        variant="destructive" 
        className="w-full mb-6 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white"
        onClick={logout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {t("settings.logout")}
      </Button>
      
      <p className="text-center text-xs text-muted-foreground mb-6">
        {t("settings.version")}
      </p>
    </div>
  );
}