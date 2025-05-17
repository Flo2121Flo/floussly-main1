import { useTranslation } from "../lib/i18n";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { BankAccount } from '../types/bank';
import BankAccountList from '../components/bank/BankAccountList';
import BankAccountForm from '../components/bank/BankAccountForm';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

// UI components
import {
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
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>();
  const [activeTab, setActiveTab] = useState("all");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>(null);
  const [dataIsLoading, setDataIsLoading] = useState(true);
  
  // Get the current userId (in a real app, this would come from auth)
  const userId = 1; // Demo user ID
  
  // Fetch bank accounts
  const { data: accounts = [], isLoading, error } = useQuery<BankAccount[]>({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/bank-accounts?userId=${userId}`);
        setDataIsLoading(false);
      return response.json().then(data => data.success ? data.accounts : []);
    },
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
    if (accounts && withdrawAmount !== null && !dataIsLoading && accounts.length > 0) {
      // Set the default account as selected, or the first account if no default exists
      const defaultAccount = accounts.find((account: any) => account.isDefault) || accounts[0];
      setSelectedAccount(defaultAccount);
      setIsFormOpen(true);
    }
  }, [accounts, withdrawAmount, dataIsLoading]);

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: async (account: Omit<BankAccount, 'id'>) => {
      const response = await apiRequest('POST', '/api/bank-accounts', account);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      toast({
        title: t('bank.accountCreated'),
        description: t('bank.accountCreatedMessage'),
      });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...account }: BankAccount) => {
      const response = await apiRequest('PUT', `/api/bank-accounts/${id}`, account);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      toast({
        title: t('bank.accountUpdated'),
        description: t('bank.accountUpdatedMessage'),
      });
      setIsFormOpen(false);
      setSelectedAccount(undefined);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/bank-accounts/${id}?userId=${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      toast({
        title: t('bank.accountDeleted'),
        description: t('bank.accountDeletedMessage'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
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
      setIsFormOpen(false);
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
    if (selectedAccount) {
      updateMutation.mutate({ ...values, id: selectedAccount.id });
    } else {
      createMutation.mutate(values);
    }
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
    setIsFormOpen(true);
  };

  // Function to open delete confirmation dialog
  const handleDeleteClick = (account: any) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
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
  const filteredAccounts = accounts ? 
    (activeTab === "all" ? accounts : 
     activeTab === "default" ? accounts.filter((account: any) => account.isDefault) : 
     accounts.filter((account: any) => account.status === activeTab)
    ) : [];

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  if (error) {
    return <div>{t('common.error')}: {error.message}</div>;
  }

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
        <Button onClick={() => {
          setSelectedAccount(undefined);
          setIsFormOpen(true);
        }}>
              {t("bankAccounts.addAccount")}
            </Button>
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
            <BankAccountList
              accounts={filteredAccounts}
              onSelect={(account) => {
                setSelectedAccount(account);
                setIsFormOpen(true);
              }}
              onDelete={(id) => {
                handleDeleteClick(filteredAccounts.find((a) => a.id === id));
              }}
            />
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
                onClick={() => setIsFormOpen(true)}
                size="lg"
                className="rounded-full px-6"
              >
                {t("bankAccounts.addAccount")}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedAccount ? t('bank.editAccount') : t('bank.addAccount')}
            </DialogTitle>
          </DialogHeader>
          <BankAccountForm
            account={selectedAccount}
            onSubmit={onSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedAccount(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}