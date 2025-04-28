import { useTranslation } from "../lib/i18n";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { 
  ChevronLeft, Plus, Check, Pencil, Trash2, AlertCircle, 
  Building, CreditCard, Copy, ArrowRight, Landmark, User, CheckCircle2,
  Shield, ShieldCheck, AlertTriangle, Info, X, Loader2, Building2 
} from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// UI components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Separator } from "../components/ui/separator";

// Define the bank account schema for form validation
const bankAccountSchema = z.object({
  userId: z.number(),
  bankName: z.string().min(2, { message: "Bank name must be at least 2 characters" }),
  accountHolderName: z.string().min(2, { message: "Account holder name must be at least 2 characters" }),
  accountType: z.enum(["checking", "savings", "business"]),
  rib: z.string().min(20, { message: "RIB must be at least 20 characters" }),
  iban: z.string().optional(),
  swift: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

// Moroccan banks list
const moroccanBanks = [
  "Credit Agricole du Maroc",
  "Banque Populaire",
  "CIH Bank",
  "Attijariwafa Bank",
  "Bank of Africa (BMCE)",
  "BMCI",
  "CFG Bank",
  "Al Barid Bank",
  "Crédit du Maroc",
  "Société Générale Maroc"
];

// Bank icon mapping - you can replace these with actual bank logos if needed
const bankIcons: Record<string, any> = {
  default: <Landmark className="w-8 h-8 text-primary" />,
};

export default function BankAccounts() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>({});
  const [activeTab, setActiveTab] = useState("all");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>(null);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  
  // Get the current userId (in a real app, this would come from auth)
  const userId = 1; // Demo user ID
  
  // Fetch bank accounts
  const { data: bankAccounts } = useQuery({
    queryKey: ['/api/bank-accounts'],
    queryFn: () => apiRequest('GET', `/api/bank-accounts?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setDataIsLoading(false);
        return data.success ? data.accounts : [];
      })
  });

  // Clear the copy timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Parse URL parameters for actions (e.g., withdrawal)
  useEffect(() => {
    if (location) {
      const params = new URLSearchParams(location.split('?')[1]);
      const action = params.get('action');
      const amount = params.get('amount');
      
      if (action === 'withdraw' && amount) {
        setWithdrawAmount(parseFloat(amount));
        // We'll open the withdrawal dialog after we have accounts loaded
      }
    }
  }, [location]);
  
  // Open withdrawal dialog when bank accounts are loaded and we have a withdrawal amount
  useEffect(() => {
    if (bankAccounts && withdrawAmount !== null && !dataIsLoading && bankAccounts.length > 0) {
      // Set the default account as selected, or the first account if no default exists
      const defaultAccount = bankAccounts.find((account: any) => account.isDefault) || bankAccounts[0];
      setSelectedAccount(defaultAccount);
      setIsWithdrawDialogOpen(true);
    }
  }, [bankAccounts, withdrawAmount, dataIsLoading]);

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (data: BankAccountFormValues) => {
      const res = await apiRequest('POST', '/api/bank-accounts', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      setIsAddDialogOpen(false);
      toast({
        title: t("bankAccounts.successful").replace("{{action}}", "added"),
        description: t("bankAccounts.accountAdded"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("errors.title"),
        description: error.message || t("bankAccounts.errors.createFailed"),
        variant: "destructive",
      });
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async (data: BankAccountFormValues & { id: number }) => {
      const { id, ...rest } = data;
      const res = await apiRequest('PATCH', `/api/bank-accounts/${id}`, rest);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      setIsEditDialogOpen(false);
      toast({
        title: t("bankAccounts.successful").replace("{{action}}", "updated"),
        description: t("bankAccounts.accountUpdated"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("errors.title"),
        description: error.message || t("bankAccounts.errors.updateFailed"),
        variant: "destructive",
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/bank-accounts/${id}?userId=${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: t("bankAccounts.successful").replace("{{action}}", "deleted"),
        description: t("bankAccounts.accountDeleted"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("errors.title"),
        description: error.message || t("bankAccounts.errors.deleteFailed"),
        variant: "destructive",
      });
    },
  });

  // Set default account mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/bank-accounts/${id}/set-default`, { userId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      toast({
        title: t("bankAccounts.successful").replace("{{action}}", "updated"),
        description: t("bankAccounts.defaultSet"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("errors.title"),
        description: error.message || t("bankAccounts.errors.setDefaultFailed"),
        variant: "destructive",
      });
    },
  });
  
  // Bank transfer withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { accountId: number, amount: number }) => {
      const res = await apiRequest('POST', '/api/bank-transfers', {
        userId,
        bankAccountId: data.accountId,
        amount: data.amount,
        type: 'withdrawal',
        description: t("bankAccounts.withdraw"),
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] }); // Update wallet balance
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] }); // Update transaction history
      setIsWithdrawDialogOpen(false);
      setWithdrawAmount(null);
      
      // Reset the URL without the query parameters
      setLocation('/bank-accounts', { replace: true });
      
      toast({
        title: t("bankAccounts.successful").replace("{{action}}", "initiated"),
        description: t("bankAccounts.withdrawalInitiated"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("errors.title"),
        description: error.message || t("bankAccounts.errors.withdrawalFailed"),
        variant: "destructive",
      });
    },
  });
  
  // Handle withdrawal to bank account
  const handleWithdraw = () => {
    if (selectedAccount && withdrawAmount) {
      withdrawMutation.mutate({
        accountId: selectedAccount.id,
        amount: withdrawAmount
      });
    }
  };

  // Add account form
  const addForm = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      userId,
      bankName: "",
      accountHolderName: "",
      accountType: "checking",
      rib: "",
      iban: "",
      swift: "",
      isDefault: false,
    },
  });

  // Edit account form
  const editForm = useForm<BankAccountFormValues & { id: number }>({
    resolver: zodResolver(bankAccountSchema.extend({ id: z.number() })),
    defaultValues: {
      id: 0,
      userId,
      bankName: "",
      accountHolderName: "",
      accountType: "checking",
      rib: "",
      iban: "",
      swift: "",
      isDefault: false,
    },
  });

  const onSubmit = (values: BankAccountFormValues) => {
    createAccountMutation.mutate(values);
  };

  const onEdit = (values: BankAccountFormValues & { id: number }) => {
    updateAccountMutation.mutate(values);
  };

  // Function to open edit dialog and populate form
  const handleEditClick = (account: any) => {
    setSelectedAccount(account);
    editForm.reset({
      id: account.id,
      userId,
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      accountType: account.accountType,
      rib: account.rib,
      iban: account.iban || "",
      swift: account.swift || "",
      isDefault: account.isDefault,
    });
    setIsEditDialogOpen(true);
  };

  // Function to open delete confirmation dialog
  const handleDeleteClick = (account: any) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  // Get status badge color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "verified":
        return {
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          icon: <ShieldCheck className="w-3 h-3 mr-1" />
        };
      case "unverified":
        return {
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        };
      case "pending":
        return {
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          icon: <Info className="w-3 h-3 mr-1" />
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <Info className="w-3 h-3 mr-1" />
        };
    }
  };

  // Copy text to clipboard with visual feedback
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Filter accounts based on the active tab
  const filteredAccounts = bankAccounts ? 
    (activeTab === "all" ? bankAccounts : 
     activeTab === "default" ? bankAccounts.filter((account: any) => account.isDefault) : 
     bankAccounts.filter((account: any) => account.status === activeTab)
    ) : [];

  return (
    <div className="container py-6 max-w-4xl">
      {/* Header with back button and title */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("bankAccounts.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("bankAccounts.linkedAccounts")}
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1 rounded-full px-4">
              <Plus className="h-4 w-4 mr-1" />
              {t("bankAccounts.addAccount")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
              <div className="flex justify-between items-center px-6 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Landmark className="h-5 w-5 text-primary" />
                  </div>
                  <DialogTitle className="text-xl">{t("bankAccounts.addAccount")}</DialogTitle>
                </div>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
              <DialogDescription className="px-6 pb-4 text-sm">
                {t("bankAccounts.addAccountDescription")}
              </DialogDescription>
            </div>
            
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-primary" />
                      {t("bankAccounts.bankDetails")}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={addForm.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("bankAccounts.bankName")}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {moroccanBanks.map((bank) => (
                                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="accountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("bankAccounts.accountType")}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("bankAccounts.selectAccountTypePlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="checking">{t("bankAccounts.types.checking")}</SelectItem>
                                <SelectItem value="savings">{t("bankAccounts.types.savings")}</SelectItem>
                                <SelectItem value="business">{t("bankAccounts.types.business")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-primary" />
                      {t("bankAccounts.accountDetails")}
                    </h3>
                    <div className="grid gap-4">
                      <FormField
                        control={addForm.control}
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("bankAccounts.accountHolderName")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("bankAccounts.accountHolderNamePlaceholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4">
                        <FormField
                          control={addForm.control}
                          name="rib"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("bankAccounts.rib")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("bankAccounts.ribPlaceholder")} {...field} />
                              </FormControl>
                              <FormDescription className="text-xs">
                                {t("bankAccounts.ribDescription")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-primary" />
                      {t("bankAccounts.internationalDetails")}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={addForm.control}
                        name="iban"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("bankAccounts.iban")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("bankAccounts.ibanPlaceholder")} {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {t("bankAccounts.optional")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="swift"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("bankAccounts.swift")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("bankAccounts.swiftPlaceholder")} {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {t("bankAccounts.optional")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={addForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t("bankAccounts.isDefault")}</FormLabel>
                          <FormDescription>
                            {t("bankAccounts.defaultDescription")}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 p-6 border-t bg-background/80 backdrop-blur-sm">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("actions.cancel")}
              </Button>
              <Button 
                onClick={addForm.handleSubmit(onSubmit)}
                disabled={createAccountMutation.isPending}
                className="flex-1"
              >
                {createAccountMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" /> 
                    {t("actions.saving")}
                  </div>
                ) : (
                  t("actions.save")
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for filtering accounts */}
      <Tabs 
        defaultValue="all" 
        className="w-full" 
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6 w-full justify-start bg-transparent p-0 border-b">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            {t("common.all")}
          </TabsTrigger>
          <TabsTrigger
            value="default"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            {t("bankAccounts.default")}
          </TabsTrigger>
          <TabsTrigger
            value="verified"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            {t("bankAccounts.status.verified")}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            {t("bankAccounts.status.pending")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="pt-2">
          {/* Bank account list */}
          {dataIsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredAccounts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAccounts.map((account: any) => (
                <Card key={account.id} className={`overflow-hidden ${account.isDefault ? 'ring-2 ring-primary' : ''}`}>
                  <div className={`h-1.5 w-full ${account.isDefault ? 'bg-primary' : 'bg-muted'}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="mr-4 bg-primary/10 p-3 rounded-full">
                          {bankIcons[account.bankName] || bankIcons.default}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.bankName}</CardTitle>
                          <div className="flex items-center mt-1">
                            <Badge 
                              variant="outline" 
                              className={`flex items-center ${getStatusInfo(account.status).className}`}
                            >
                              {getStatusInfo(account.status).icon}
                              {t(`bankAccounts.status.${account.status}`)}
                            </Badge>
                            {account.isDefault && (
                              <Badge variant="secondary" className="ml-2 flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t("bankAccounts.default")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditClick(account)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("common.edit")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteClick(account)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("common.delete")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{t("bankAccounts.accountType")}</p>
                            <div className="flex items-center">
                              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </div>
                          <p className="text-sm font-medium capitalize mt-1">{t(`bankAccounts.types.${account.accountType}`)}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{t("bankAccounts.accountHolderName")}</p>
                            <div className="flex items-center">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </div>
                          <p className="text-sm font-medium mt-1">{account.accountHolderName}</p>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{t("bankAccounts.rib")}</p>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5"
                                    onClick={() => copyToClipboard(account.rib, `account-${account.id}-rib`)}
                                  >
                                    {copiedField === `account-${account.id}-rib` ? (
                                      <Check className="h-3 w-3 text-primary" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{copiedField === `account-${account.id}-rib` ? t("common.copied") : t("common.copy")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-sm font-mono tracking-tight mt-1 overflow-hidden text-ellipsis">
                            {account.rib}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {!account.isDefault ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setDefaultMutation.mutate(account.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        {setDefaultMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full mr-2" /> 
                            {t("actions.updating")}
                          </div>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" /> 
                            {t("bankAccounts.makeDefault")}
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="w-full">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => {
                            toast({
                              title: t("actions.topUp"),
                              description: t("bankAccounts.topUpFromBankDescription"),
                            });
                          }}
                        >
                          <ArrowRight className="h-3.5 w-3.5 mr-1" /> 
                          {t("actions.transferMoney")}
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-b from-muted/30 to-muted/60 rounded-lg p-8 text-center my-8">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <AlertCircle className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">{t("bankAccounts.noAccounts")}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("bankAccounts.noAccountsDescription")}</p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                size="lg"
                className="rounded-full px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("bankAccounts.addAccount")}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex justify-between items-center px-6 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-xl">{t("bankAccounts.editAccount")}</DialogTitle>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <DialogDescription className="px-6 pb-4 text-sm">
              {t("bankAccounts.editAccountDescription")}
            </DialogDescription>
          </div>
          
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <Form {...editForm}>
              <form className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Building className="w-4 h-4 mr-2 text-primary" />
                    {t("bankAccounts.bankDetails")}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={editForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bankAccounts.bankName")}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a bank" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {moroccanBanks.map((bank) => (
                                <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bankAccounts.accountType")}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("bankAccounts.selectAccountTypePlaceholder")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="checking">{t("bankAccounts.types.checking")}</SelectItem>
                              <SelectItem value="savings">{t("bankAccounts.types.savings")}</SelectItem>
                              <SelectItem value="business">{t("bankAccounts.types.business")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-primary" />
                    {t("bankAccounts.accountDetails")}
                  </h3>
                  <div className="grid gap-4">
                    <FormField
                      control={editForm.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bankAccounts.accountHolderName")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4">
                      <FormField
                        control={editForm.control}
                        name="rib"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("bankAccounts.rib")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("bankAccounts.ribPlaceholder")} {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              RIB (Relevé d'Identité Bancaire) - Moroccan bank identifier
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    {t("bankAccounts.internationalDetails")}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={editForm.control}
                      name="iban"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bankAccounts.iban")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("bankAccounts.ibanPlaceholder")} {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {t("bankAccounts.optional")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="swift"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bankAccounts.swift")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("bankAccounts.swiftPlaceholder")} {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {t("bankAccounts.optional")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={editForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t("bankAccounts.isDefault")}</FormLabel>
                        <FormDescription>
                          {t("bankAccounts.defaultDescription")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 p-6 border-t bg-background/80 backdrop-blur-sm">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button 
              onClick={editForm.handleSubmit(onEdit)}
              disabled={updateAccountMutation.isPending}
              className="flex-1"
            >
              {updateAccountMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" /> 
                  {t("actions.updating")}
                </div>
              ) : (
                t("actions.update")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {t("bankAccounts.deleteAccount")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>{t("bankAccounts.deleteConfirm")}</p>
              <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm mt-2 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 inline-block mr-2" />
                {t("bankAccounts.deleteWarning")}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:space-x-0">
            <AlertDialogCancel className="w-full mt-0">{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountMutation.mutate(selectedAccount.id)}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" /> 
                  {t("actions.deleting")}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("actions.delete")}
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Withdraw to Bank Account Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex justify-between items-center px-6 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-xl">{t("bankAccounts.withdrawToBank")}</DialogTitle>
              </div>
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {
                    setWithdrawAmount(null);
                    setLocation('/bank-accounts', { replace: true });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <DialogDescription className="px-6 pb-4 text-sm">
              {t("bankAccounts.withdrawToBankDescription")}
            </DialogDescription>
          </div>
          
          <div className="px-6 py-4">
            {/* Transaction Details */}
            <div className="mb-6 bg-muted/30 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t("payment.purpose")}</span>
                <span className="text-sm font-medium">{t("payment.withdrawalFromWallet")}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t("payment.amount")}</span>
                <span className="text-lg font-semibold text-primary">{withdrawAmount || 0} MAD</span>
              </div>
              
              {/* Transaction Fee Display */}
              <div className="border-t border-border my-2 pt-2">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="flex items-center">
                    {t("transaction.withdrawalFee")}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({withdrawAmount && withdrawAmount <= 500 ? '2.5%' : '3%'})
                    </span>
                  </span>
                  <span>
                    {withdrawAmount && withdrawAmount > 0 ? (
                      `MAD ${(withdrawAmount && withdrawAmount <= 500 
                        ? withdrawAmount * 0.025 
                        : Math.min(withdrawAmount * 0.03, 15)).toFixed(2)}`
                    ) : 'MAD 0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center font-medium text-sm">
                  <span>{t("transaction.total")}</span>
                  <span>
                    MAD {withdrawAmount && withdrawAmount > 0 ? (
                      (withdrawAmount + (withdrawAmount <= 500 ? withdrawAmount * 0.025 : Math.min(withdrawAmount * 0.03, 15))).toFixed(2)
                    ) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Bank Account Selection */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-3">{t("bankAccounts.selectBankAccount")}</h3>
              <div className="space-y-3">
                {selectedAccount && (
                  <div className={`flex items-center p-4 rounded-lg border border-primary bg-primary/5`}>
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mr-4">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {selectedAccount.bankName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t("bankAccounts.rib")}: {selectedAccount.rib?.substring(0, 10)}...
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {t("bankAccounts.default")}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Processing Time Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-6">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  {t("bankAccounts.transferTimeWarning")}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsWithdrawDialogOpen(false);
                  setWithdrawAmount(null);
                  setLocation('/bank-accounts', { replace: true });
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleWithdraw} 
                disabled={withdrawMutation.isPending}
                className="min-w-[120px]"
              >
                {withdrawMutation.isPending ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("actions.processing")}
                  </div>
                ) : (
                  t("bankAccounts.confirmWithdrawal")
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}