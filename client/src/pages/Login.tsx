import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import logoSrc from "@/assets/logo.svg";
import { RectangleEllipsis } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 pt-12 bg-background">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="w-16">
            <img src={logoSrc} alt="Floussly Logo" className="w-full h-full object-contain" />
          </div>
          <ThemeToggle />
        </div>
        
        <h1 className="font-poppins font-bold text-3xl mb-3">{t("auth.welcome")}</h1>
        <p className="text-muted-foreground mb-8">{t("auth.signInMessage")}</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t("auth.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t("auth.password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t("auth.loading") : t("auth.signIn")}
            </Button>
          </form>
        </Form>
        
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="h-px bg-border flex-1"></div>
          <span className="text-muted-foreground text-sm">{t("auth.or")}</span>
          <div className="h-px bg-border flex-1"></div>
        </div>
        
        <Button
          variant="outline"
          className="w-full mb-6 flex items-center justify-center"
          onClick={() => setIsPhoneLogin(!isPhoneLogin)}
        >
          <RectangleEllipsis className="mr-2 h-4 w-4" />
          {isPhoneLogin ? t("auth.signInWithEmail") : t("auth.signInWithPhone")}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.dontHaveAccount")}{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-medium text-primary"
            onClick={() => setLocation("/register")}
          >
            {t("auth.signUp")}
          </Button>
        </p>
      </div>
    </div>
  );
}
