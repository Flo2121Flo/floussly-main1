import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import logoSrc from "@/assets/logo.svg";
import { RectangleEllipsis } from "lucide-react";
import { useState } from "react";

const phoneSchema = z.object({
  phone: z.string().regex(/^\d{9,10}$/, {
    message: "Phone number must be 9-10 digits",
  }),
});

type FormValues = z.infer<typeof phoneSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const [isPhoneLogin, setIsPhoneLogin] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Prefix the phone number with Moroccan code if it doesn't already have it
    const formattedPhone = values.phone.startsWith("+212") 
      ? values.phone 
      : `+212${values.phone}`;
    
    await login(formattedPhone);
  };

  return (
    <div className="p-6 pt-12">
      <div className="flex justify-between items-center mb-8">
        <div className="w-16">
          <img src={logoSrc} alt="Floussly Logo" className="w-full h-full object-contain" />
        </div>
        <ThemeToggle />
      </div>
      
      <h1 className="font-poppins font-bold text-3xl mb-3">{t("auth.welcome")}</h1>
      <p className="text-muted-foreground mb-8">{t("auth.signInMessage")}</p>
      
      {isPhoneLogin ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-8">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t("auth.phoneNumber")}</FormLabel>
                  <div className="flex">
                    <div className="bg-card border border-input rounded-l-lg px-3 flex items-center text-muted-foreground">
                      <span>+212</span>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="6 XX XX XX XX"
                        className="flex-1 border-l-0 rounded-l-none"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : t("auth.continue")}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="mb-8">
          <p className="text-center text-red-500 mb-4">Email login not available in this version</p>
          <Button 
            className="w-full"
            onClick={() => setIsPhoneLogin(true)}
          >
            Switch to Phone Login
          </Button>
        </div>
      )}
      
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="h-px bg-border flex-1"></div>
        <span className="text-muted-foreground text-sm">or</span>
        <div className="h-px bg-border flex-1"></div>
      </div>
      
      <Button
        variant="outline"
        className="w-full mb-6 flex items-center justify-center"
        onClick={() => setIsPhoneLogin(!isPhoneLogin)}
      >
        <RectangleEllipsis className="mr-2 h-4 w-4" />
        {t("auth.signInWithEmail")}
      </Button>
      
      <p className="text-center text-sm text-muted-foreground">
        {t("auth.dontHaveAccount")}{" "}
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium text-primary"
          onClick={() => setLocation("/otp-verification")}
        >
          {t("auth.signUp")}
        </Button>
      </p>
    </div>
  );
}
