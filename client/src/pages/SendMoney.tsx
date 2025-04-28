import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "../lib/i18n";
import { ArrowLeft, Search, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ContactItem, { Contact } from "@/components/ContactItem";
import { useContacts } from "@/hooks/use-contacts";
import { useWallet } from "@/hooks/use-wallet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAchievementContext } from "@/context/AchievementContext";
import { motion, AnimatePresence } from "framer-motion";
import MoroccanLoader from "@/components/animations/MoroccanLoader";
import DecorativeBorder from "@/components/animations/DecorativeBorder";
import { FlousslyTransactionType, calculateFlousslyFee, formatCurrency } from "@/lib/financial-utils";
import { FlousslyFeeDisplay } from "@/components/FlousslyFeeDisplay";

// Define the form schema
const sendMoneySchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be greater than 0",
  }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof sendMoneySchema>;

export default function SendMoney() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { recentContacts } = useContacts();
  const { wallet } = useWallet();
  const { toast } = useToast();
  const { showCelebration } = useAchievementContext();
  // Use the imported Contact interface for proper typing and ensure it's initialized properly
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // For TypeScript narrowing to work properly with the selectedContact
  const safeSelectedContact = selectedContact as Contact | null;
  const [isLoading, setIsLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize form without the recipient field
  const form = useForm<FormValues>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      amount: "",
      note: "",
    },
  });

  // Handle contact selection separately from form
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setRecipientError(null); // Clear any recipient errors
  };

  const onSubmit = async (values: FormValues) => {
    // Check if a contact is selected
    if (!safeSelectedContact) {
      setRecipientError("Please select a recipient");
      return;
    }
    
    const amount = Number(values.amount);
    
    // Check if user has sufficient balance
    if (amount > wallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to complete this transfer",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setTransferAmount(amount);
    
    // Mock sending money (in a real app this would be an API call)
    console.log(`Sending ${amount} to ${safeSelectedContact.name}`);
    
    setTimeout(() => {
      // Set transfer success to trigger animation
      setTransferSuccess(true);
      
      // Show the celebration animation with Moroccan-inspired design
      showCelebration("transfer", { amount });
      
      toast({
        title: t("transfers.moneySent"),
        description: t("transfers.sentConfirmation", { 
          currency: wallet.currency, 
          amount: amount, 
          recipient: safeSelectedContact.name 
        }),
      });
      
      // Delay the redirect to allow the user to see the animation
      setTimeout(() => {
        setIsLoading(false);
        setLocation("/");
      }, 2000);
    }, 1500);
  };

  // Get current amount from form
  const currentAmount = form.watch("amount") ? Number(form.watch("amount")) : 0;
  
  // Calculate transfer fee using the Floussly fee structure
  const fee = currentAmount > 0 
    ? calculateFlousslyFee(FlousslyTransactionType.WALLET_TO_WALLET, currentAmount)
    : 0;
  const total = currentAmount + fee;

  return (
    <div className="p-6 pt-12 pb-20 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          className="mb-8 flex items-center text-muted-foreground p-0 group transition-all duration-300"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="group-hover:text-foreground transition-colors duration-300">
            {t("nav.back")}
          </span>
        </Button>
      </motion.div>
      
      {/* If a contact is selected, show green header with contact info */}
      {safeSelectedContact ? (
        <div className="bg-emerald-600 text-white rounded-3xl p-6 mb-8 text-center relative overflow-hidden">
          <div className="mb-2">
            {safeSelectedContact.image ? (
              <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border-2 border-white mb-2">
                <img 
                  src={safeSelectedContact.image} 
                  alt={safeSelectedContact.name} 
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-700 flex items-center justify-center text-3xl font-semibold border-2 border-white mb-2">
                {safeSelectedContact.name.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold mb-1">{safeSelectedContact.name}</h2>
          <p className="text-emerald-100">{safeSelectedContact.phone}</p>
          
          {/* No hidden fields needed */}
        </div>
      ) : (
        <>
          <h1 className="font-poppins font-bold text-3xl mb-6">{t("transaction.title")}</h1>

          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">{t("transaction.yourBalance")}</p>
              <p className="font-poppins font-bold text-2xl">
                {wallet.currency} {new Intl.NumberFormat().format(wallet.balance)}
              </p>
            </CardContent>
          </Card>
          
          {/* Contact selection when no contact is selected yet */}
          <div className="mb-8">
            <label className="text-sm font-medium">{t("transaction.recipient")}</label>
            <div className="relative mt-2">
              <Input 
                placeholder={t("transaction.searchRecipient")}
                className="pl-10"
                value={safeSelectedContact ? safeSelectedContact.name : ""}
                readOnly
                onClick={() => setLocation("/contacts")}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            {recipientError && (
              <p className="text-sm text-destructive mt-2">{recipientError}</p>
            )}
          </div>
        </>
      )}
      
      <div className="relative">
        {/* Moroccan-inspired decorative border that appears during loading */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
            >
              <MoroccanLoader className="mb-4" />
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <p className="font-medium mb-1">{t("transaction.processing")}</p>
                <p className="text-sm text-muted-foreground">
                  {safeSelectedContact && `${t("transaction.sendingTo")} ${safeSelectedContact.name}`}
                </p>
                
                {transferSuccess && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 flex flex-col items-center"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ 
                        times: [0, 0.6, 1],
                        duration: 0.5
                      }}
                      className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground mb-2"
                    >
                      <SendHorizonal className="h-5 w-5" />
                    </motion.div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="font-medium text-sm"
                    >
                      {t("transaction.transferSuccess", { amount: transferAmount })}
                    </motion.p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative">
          
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">{t("transaction.recentContacts")}</label>
              <div className="flex overflow-x-auto space-x-4 pb-2">
                {recentContacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ContactItem 
                      contact={contact} 
                      onSelect={handleContactSelect}
                      isSelected={safeSelectedContact?.id === contact.id}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Amount section with large display */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4">{t("transaction.amount")}</h2>
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex justify-center items-baseline gap-2">
                  <span className="text-xl font-medium">MAD</span>
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormControl>
                        <Input 
                          type="text"
                          className="w-40 text-center text-4xl font-bold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            // Add a console log to see if this is triggered
                            console.log(`Amount changed to ${e.target.value}`);
                          }}
                        />
                      </FormControl>
                    )}
                  />
                </div>
              </div>
              
              {/* Quick amount buttons */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                {[100, 200, 500, 1000, 2000, 5000].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={Number(form.watch("amount")) === amount ? "default" : "outline"}
                    className="py-6 text-base font-normal"
                    onClick={() => {
                      form.setValue("amount", amount.toString());
                      console.log(`Set amount to ${amount}`);
                    }}
                  >
                    {t("common.currency")} {amount}
                  </Button>
                ))}
              </div>
              
              {/* Fee display beneath the amount buttons */}
              <div className="mt-6 border border-border rounded-lg p-3 bg-muted/30">
                {currentAmount > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-primary">{t("transaction.feeStructure")}</h3>
                    <FlousslyFeeDisplay 
                      amount={currentAmount}
                      currency={wallet.currency}
                      transactionType={FlousslyTransactionType.WALLET_TO_WALLET}
                    />
                    <div className="flex justify-between items-center font-medium pt-2 border-t border-border">
                      <span>{t("transaction.total")}:</span>
                      <span>{wallet.currency} {total.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-2 text-sm text-muted-foreground">
                    {t("transaction.enterAmountToSeeFees")}
                  </div>
                )}
              </div>
              
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive mt-2">{form.formState.errors.amount.message}</p>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel>{t("transaction.note")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("transaction.noteHint")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Send Money button styled to match the screenshot */}
            <Button 
              type="submit" 
              className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-lg rounded-xl relative overflow-hidden"
              disabled={isLoading || !safeSelectedContact || currentAmount <= 0 || total > wallet.balance}
            >
              <span className="flex items-center justify-center gap-2">
                <SendHorizonal className="h-5 w-5" />
                {isLoading ? t("common.processing") : t("transaction.sendMoney")}
              </span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
