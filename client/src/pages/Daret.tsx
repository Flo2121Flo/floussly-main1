import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { ArrowLeft, Plus, Users, Calendar, Coins, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DaretCircle from "@/components/DaretCircle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useDarets, CreateDaretData } from "@/hooks/use-darets";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Daret name must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  totalMembers: z.coerce.number().int().min(2, {
    message: "A Daret must have at least 2 members.",
  }).max(20, {
    message: "Maximum 20 members allowed for a Daret.",
  }),
  startDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Please enter a valid date.",
  }),
});

export default function DaretPage() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Use the custom darets hook
  const { darets, isLoading, error, createDaret } = useDarets();
  
  // Set up form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      totalMembers: 5,
      startDate: new Date().toISOString().split('T')[0],
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to create a Daret.",
        variant: "destructive",
      });
      return;
    }
    
    const daretData: CreateDaretData = {
      name: values.name,
      amount: values.amount,
      totalMembers: values.totalMembers,
      startDate: new Date(values.startDate),
      currency: "MAD"
    };
    
    createDaret(daretData);
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const handleCreateDaret = () => {
    setIsCreateDialogOpen(true);
  };

  // Filter darets based on active tab
  const filteredDarets = darets?.filter(daret => {
    if (activeTab === "active") return daret.status === "active";
    if (activeTab === "payment_due") return daret.status === "payment_due";
    if (activeTab === "completed") return daret.status === "completed";
    return true;
  });

  return (
    <div className="p-6 pt-12 pb-24 max-w-7xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-muted-foreground p-0 hover:bg-transparent hover:text-primary"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <div className="relative mb-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-secondary/10 rounded-full blur-3xl -mb-10"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="font-poppins font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">{t("daret.title")}</h1>
            <p className="text-muted-foreground max-w-lg mt-1">{t("daret.description")}</p>
          </div>
          
          <Button onClick={handleCreateDaret} className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md transition-all duration-300 hover:shadow-xl">
            <Plus className="mr-2 h-4 w-4" />
            {t("daret.create")}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 p-1 rounded-xl bg-muted/50">
          <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            {t("daret.tabs.active")}
          </TabsTrigger>
          <TabsTrigger value="payment_due" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-destructive/80 data-[state=active]:to-destructive data-[state=active]:text-white data-[state=active]:shadow-md">
            {t("daret.tabs.paymentDue")}
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary/80 data-[state=active]:to-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md">
            {t("daret.tabs.completed")}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Create Daret Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none">
          <div className="bg-gradient-to-r from-primary to-primary-foreground p-6 text-white">
            <DialogTitle className="text-2xl font-semibold text-white">{t("daret.createNew")}</DialogTitle>
            <DialogDescription className="text-white/80 mt-1">
              {t("daret.createNewDescription")}
            </DialogDescription>
          </div>
          
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Daret Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Family Savings" 
                          {...field} 
                          className="border-input/50 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground/70 text-xs">
                        Give your Daret a descriptive name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Monthly Amount (MAD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Coins className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                          <Input 
                            className="pl-10 border-input/50 focus-visible:ring-primary" 
                            placeholder="500" 
                            type="number" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-muted-foreground/70 text-xs">
                        {t("daret.amountDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="totalMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">{t("daret.totalMembers")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users2 className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                          <Input 
                            className="pl-10 border-input/50 focus-visible:ring-primary" 
                            placeholder="5" 
                            type="number" 
                            min="2" 
                            max="20" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-muted-foreground/70 text-xs">
                        {t("daret.totalMembersDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">{t("daret.startDate")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                          <Input 
                            className="pl-10 border-input/50 focus-visible:ring-primary" 
                            type="date" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-muted-foreground/70 text-xs">
                        {t("daret.startDateDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md h-11 text-base font-medium"
                  >
                    {t("daret.create")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary/30 to-secondary/30"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-7 w-2/5 mb-2" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex gap-2 mb-5">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>
                <div className="flex justify-center py-3">
                  <div className="relative">
                    <Skeleton className="h-60 w-60 rounded-full" />
                    <Skeleton className="h-24 w-24 rounded-full absolute" style={{ top: 'calc(50% - 48px)', left: 'calc(50% - 48px)' }} />
                    {[1, 2, 3].map((avatar) => (
                      <Skeleton 
                        key={avatar} 
                        className="h-12 w-12 rounded-full absolute"
                        style={{ 
                          top: `calc(50% - 24px + ${Math.sin(avatar * 2.1) * 80}px)`, 
                          left: `calc(50% - 24px + ${Math.cos(avatar * 2.1) * 80}px)` 
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-6 w-2/3 mx-auto rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/20 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-destructive to-destructive/60"></div>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("daret.error")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">{t("daret.errorDescription")}</p>
            <Button 
              variant="outline" 
              className="mt-2 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30" 
              onClick={() => window.location.reload()}
            >
              {t("common.tryAgain")}
            </Button>
          </CardContent>
        </Card>
      ) : filteredDarets?.length === 0 ? (
        <Card className="border-primary/20 shadow-lg overflow-hidden bg-gradient-to-b from-background to-primary/5">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/60"></div>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("daret.noDarets")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">{t("daret.noActiveDescription")}</p>
            <Button 
              className="mt-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md transition-all duration-300" 
              onClick={handleCreateDaret}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("daret.startNew")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDarets?.map((daret) => (
            <DaretCircle 
              key={daret.id} 
              daret={daret} 
              members={daret.members}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
}