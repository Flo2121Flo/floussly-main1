import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { ArrowLeft, Plus, Search, AlertCircle, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TontineCard, { Tontine } from "@/components/TontineCard";
import { useTontines } from "@/hooks/use-tontines";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { calculateTontineFee, formatCurrency } from "@/lib/financial-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";

const createTontineSchema = z.object({
  name: z.string().min(2, "Name is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be greater than 0",
  }),
  members: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 2, {
    message: "At least 2 members are required",
  }),
  startDate: z.string().min(1, "Start date is required"),
});

type FormValues = z.infer<typeof createTontineSchema>;

export default function Tontine() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { activeTontines, pastTontines, createTontine } = useTontines();
  const { user } = useAuth();
  let { wallet } = useWallet();
  const { toast } = useToast();
  
  // Create a mock wallet for testing if no wallet is found
  if (!wallet) {
    wallet = {
      id: "wallet-1",
      userId: "user-1",
      balance: 5000,
      currency: "MAD",
      updatedAt: new Date().toISOString()
    };
  }
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceFee, setServiceFee] = useState(0);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createTontineSchema),
    defaultValues: {
      name: "",
      amount: "",
      members: "",
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  // Watch form values to calculate service fee in real-time
  const amount = useWatch({ control: form.control, name: "amount" });
  const members = useWatch({ control: form.control, name: "members" });

  // Calculate the service fee whenever amount or members change
  useEffect(() => {
    const amountNum = Number(amount);
    const membersNum = Number(members);
    
    if (amountNum > 0 && membersNum >= 2) {
      const totalAmount = amountNum * membersNum;
      const fee = calculateTontineFee(totalAmount);
      setServiceFee(fee);
      
      // Check if user has enough balance for the fee
      if (wallet && wallet.balance < fee) {
        setInsufficientBalance(true);
      } else {
        setInsufficientBalance(false);
      }
    } else {
      setServiceFee(0);
      setInsufficientBalance(false);
    }
  }, [amount, members, wallet]);

  const onSubmit = async (values: FormValues) => {
    // Double-check balance before proceeding
    const totalAmount = Number(values.amount) * Number(values.members);
    const fee = calculateTontineFee(totalAmount);
    
    if (wallet && wallet.balance < fee) {
      toast({
        title: t("errors.insufficientFunds"),
        description: t("tontine.fee.needMoreFunds", { amount: fee }),
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createTontine({
        name: values.name,
        amount: Number(values.amount),
        totalMembers: Number(values.members),
        startDate: values.startDate,
      });
      
      toast({
        title: t("tontine.daretCreated"),
        description: t("tontine.serviceFeeCharged", { fee }),
      });
      
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: t("errors.createFailed", { entity: t("tontine.daret") }),
        description: error.message || t("errors.tryAgain"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 pt-12">
      <Button 
        variant="ghost" 
        className="mb-8 flex items-center text-muted-foreground p-0"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("nav.back")}
      </Button>
      
      <h1 className="font-poppins font-bold text-3xl mb-3">{t("tontine.daret")}</h1>
      <p className="text-muted-foreground mb-6">{t("tontine.manageGroups")}</p>
      
      <div className="flex justify-between mb-8">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 mr-2">
              <Plus className="mr-2 h-4 w-4" />
              {t("tontine.createNew")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("tontine.dialogTitle.create")}</DialogTitle>
              <DialogDescription>
                {t("tontine.dialogDescription.create")}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tontine.form.name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("tontine.form.namePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tontine.form.amount")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder={t("tontine.form.amountPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="members"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tontine.form.members")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="2" placeholder={t("tontine.form.membersPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tontine.form.startDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Show service fee information if both amount and members are filled */}
                {serviceFee > 0 && (
                  <div className="space-y-2">
                    {insufficientBalance ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t("tontine.fee.insufficientBalance")}</AlertTitle>
                        <AlertDescription>
                          {t("tontine.fee.needMoreFunds", { amount: serviceFee })}
                          {t("tontine.fee.currentBalance", { balance: wallet?.balance || 0 })}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>{t("tontine.fee.title")}</AlertTitle>
                        <AlertDescription>
                          {t("tontine.fee.description", { amount: serviceFee })}
                          {t("tontine.fee.totalAmount", { amount: Number(amount) * Number(members) })}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
                
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isLoading || insufficientBalance}
                  >
                    {isLoading ? t("common.creating") : t("tontine.createDaret")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 ml-2">
              <Search className="mr-2 h-4 w-4" />
              {t("tontine.joinExisting")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("tontine.dialogTitle.join")}</DialogTitle>
              <DialogDescription>
                {t("tontine.dialogDescription.join")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="daret-code">{t("tontine.form.daretCode")}</Label>
                <Input id="daret-code" placeholder={t("tontine.form.daretCodePlaceholder")} />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsJoinDialogOpen(false)}>
                {t("tontine.joinDaret")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <h3 className="font-medium text-lg mb-4">{t("tontine.yourActive")}</h3>
      
      {activeTontines.length > 0 ? (
        activeTontines.map((tontine: Tontine) => (
          <TontineCard key={tontine.id} tontine={tontine} />
        ))
      ) : (
        <p className="text-center text-muted-foreground py-4">
          {t("tontine.emptyActive")}
        </p>
      )}
      
      <h3 className="font-medium text-lg mb-4 mt-8">{t("tontine.past")}</h3>
      
      {pastTontines.length > 0 ? (
        pastTontines.map((tontine: Tontine) => (
          <TontineCard key={tontine.id} tontine={tontine} />
        ))
      ) : (
        <p className="text-center text-muted-foreground py-4">
          {t("tontine.emptyPast")}
        </p>
      )}
    </div>
  );
}
