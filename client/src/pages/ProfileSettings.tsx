import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, 
  Key, 
  ShieldAlert, 
  History, 
  HelpCircle, 
  Headset, 
  Star, 
  LogOut, 
  Bell, 
  Fingerprint,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ui/theme-provider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ProfileSettings() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();

  if (!user) return null;

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "This feature is not available in the demo"
    });
  };

  const settingsItems = [
    {
      title: t("settings.security.title"),
      items: [
        { icon: Key, label: t("settings.security.changePin"), action: () => toast({ title: "Change PIN", description: "This feature is not available in the demo" }) },
        { icon: ShieldAlert, label: t("settings.security.securitySettings"), action: () => toast({ title: "Security Settings", description: "This feature is not available in the demo" }) },
        { icon: History, label: t("settings.security.loginActivity"), action: () => toast({ title: "Login Activity", description: "This feature is not available in the demo" }) }
      ]
    },
    {
      title: t("settings.support.title"),
      items: [
        { icon: HelpCircle, label: t("settings.support.helpCenter"), action: () => toast({ title: "Help Center", description: "This feature is not available in the demo" }) },
        { icon: Headset, label: t("settings.support.contactSupport"), action: () => toast({ title: "Contact Support", description: "This feature is not available in the demo" }) },
        { icon: Star, label: t("settings.support.rateApp"), action: () => toast({ title: "Rate App", description: "This feature is not available in the demo" }) }
      ]
    }
  ];

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
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Avatar className="w-16 h-16 mr-4">
              <AvatarImage src={user.profileImage || ''} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-lg">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            </div>
          </div>
          <Button 
            className="w-full mt-4 py-2 text-sm font-medium"
            onClick={handleEditProfile}
          >
            {t("settings.editProfile")}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">{t("settings.preferences")}</h3>
          
          <div className="space-y-4">
            <ThemeToggle variant="switch" />
            
            <LanguageSelector variant="switch" />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                  <Bell className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.notifications")}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  defaultChecked
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                  <Fingerprint className="text-muted-foreground h-5 w-5" />
                </div>
                <span>{t("settings.biometricLogin")}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  defaultChecked
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {settingsItems.map((section, index) => (
        <Card key={index} className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">{section.title}</h3>
            
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={itemIndex} 
                    className="flex justify-between items-center w-full"
                    onClick={item.action}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                        <Icon className="text-muted-foreground h-5 w-5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            className="w-full mb-6 flex items-center justify-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("settings.logout")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout from your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={logout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <p className="text-center text-xs text-muted-foreground mb-6">
        {t("settings.version")}
      </p>
    </div>
  );
}