import { useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useContacts } from "@/hooks/use-contacts";
import { useTranslation } from "../lib/i18n";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionItem, { Transaction } from "@/components/TransactionItem";
import ContactItem, { Contact } from "@/components/ContactItem";
import {
  ArrowLeftIcon,
  FileTextIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
  CalendarIcon,
  ClockIcon,
  ScanIcon,
  Users,
  X,
  Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Transactions() {
  const { transactions, totalAmount } = useTransactions();
  const { contacts, recentContacts, isLoading: contactsLoading } = useContacts();
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [mainView, setMainView] = useState<"history" | "send">("send");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [searchContactTerm, setSearchContactTerm] = useState<string>("");

  // Filter transactions based on active tab and search term
  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(tx => tx.type === activeTab);
    }
    
    // Apply search filter (case insensitive)
    if (searchValue.trim()) {
      const term = searchValue.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.title.toLowerCase().includes(term) || 
        tx.category?.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term)
      );
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => {
    if (!searchContactTerm) return true;
    const term = searchContactTerm.toLowerCase();
    return contact.name.toLowerCase().includes(term) || contact.phone.includes(term);
  });

  // Handle send money
  const handleSendMoney = () => {
    // In a real app, this would send the transaction to the backend
    console.log(`Sending ${amount} to ${selectedContact?.name}`);
    
    // Reset the form
    setSelectedContact(null);
    setAmount("");
    setMainView("history");
  };

  return (
    <div className="min-h-screen pb-16 overflow-hidden">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-b from-primary/95 to-primary/80 text-primary-foreground pt-8 pb-6 px-6 rounded-b-3xl shadow-md">
        <div className="absolute inset-0 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-5">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-full bg-white/10 mr-3 hover:bg-white/20 text-white"
              onClick={() => mainView === "send" && selectedContact ? setSelectedContact(null) : setLocation("/")}
            >
              <ArrowLeftIcon size={18} />
            </Button>
            <h1 className="text-2xl font-bold">
              {mainView === "history" ? t("transaction.history") : t("transaction.sendMoney")}
            </h1>
            
            <div className="ml-auto flex">
              {mainView === "history" ? (
                <Button 
                  variant="ghost"
                  className="rounded-lg h-9 px-3 bg-white/10 hover:bg-white/20 text-white text-sm"
                  onClick={() => setMainView("send")}
                >
                  <Send size={16} className="mr-2" />
                  {t("transaction.send")}
                </Button>
              ) : (
                <Button 
                  variant="ghost"
                  className="rounded-lg h-9 px-3 bg-white/10 hover:bg-white/20 text-white text-sm"
                  onClick={() => setMainView("history")}
                >
                  <FileTextIcon size={16} className="mr-2" />
                  {t("transaction.history")}
                </Button>
              )}
            </div>
          </div>
          
          {mainView === "history" && (
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-white/70 mb-1">{t("transaction.thisMonth")}</p>
                <h2 className="text-2xl font-bold">
                  {t("common.currency")} {new Intl.NumberFormat().format(totalAmount)}
                </h2>
              </div>
              
              <Button 
                variant="ghost" 
                className="bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg h-8"
                onClick={() => setLocation("/finance-overview")}
              >
                <FileTextIcon size={14} className="mr-1" />
                {t("transaction.overview")}
              </Button>
            </div>
          )}
          
          {mainView === "send" && selectedContact && (
            <div className="flex flex-col items-center mt-2">
              <Avatar className="w-16 h-16 mb-2 border-2 border-white/30">
                <AvatarImage src={selectedContact.image} alt={selectedContact.name} />
                <AvatarFallback className="bg-white/20 text-white">
                  {selectedContact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-lg font-semibold text-white">{selectedContact.name}</p>
              <p className="text-sm text-white/70">{selectedContact.phone}</p>
            </div>
          )}
        </div>
      </div>
      
      {mainView === "history" && (
        <>
          {/* Search and filters */}
          <div className="px-6 pt-5 pb-3">
            <div className="relative mb-4">
              <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder={t("transaction.search")}
                className="pl-9 pr-9 py-5 bg-muted/30 border-muted/50 rounded-xl"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchValue && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
                  onClick={() => setSearchValue("")}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 h-9 bg-muted/30 p-0.5 rounded-lg">
                  <TabsTrigger value="all" className="rounded-md text-xs h-8 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    {t("transaction.all")}
                  </TabsTrigger>
                  <TabsTrigger value="send" className="rounded-md text-xs h-8 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <ArrowUpRightIcon size={12} className="mr-1" />
                    {t("transaction.sent")}
                  </TabsTrigger>
                  <TabsTrigger value="receive" className="rounded-md text-xs h-8 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <ArrowDownLeftIcon size={12} className="mr-1" />
                    {t("transaction.received")}
                  </TabsTrigger>
                  <TabsTrigger value="topup" className="rounded-md text-xs h-8 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <PlusIcon size={12} className="mr-1" />
                    {t("transaction.topup")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex ml-2">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-muted bg-card">
                  <FilterIcon size={15} />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-muted bg-card ml-2">
                  <CalendarIcon size={15} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Transaction list */}
          <div className="px-6">
            {filteredTransactions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-8 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                  <FileTextIcon size={24} className="text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">{t("transaction.noTransactions")}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-4">{t("transaction.noTransactionsMessage")}</p>
                <Button 
                  onClick={() => setMainView("send")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t("transaction.createNew")}
                </Button>
              </motion.div>
            ) : (
              <div className="py-2 space-y-4">
                {filteredTransactions.map((transaction, index) => (
                  <TransactionItem 
                    key={transaction.id}
                    transaction={transaction}
                    animationDelay={index}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {mainView === "send" && (
        <div className="px-6 pt-5">
          {!selectedContact ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search tabs */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">{t("transaction.searchMethods")}</h3>
                </div>
                <Tabs defaultValue="by-contact" className="w-full">
                  <TabsList className="flex space-x-1 h-14 p-1 bg-muted/30 rounded-lg mb-6">
                    <TabsTrigger 
                      value="by-contact" 
                      className="flex-1 rounded-md text-xs h-12 py-2 px-1 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <Users size={14} className="mb-1" />
                        <span className="text-[10px] leading-tight">{t("transaction.searchContacts")}</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="by-code" 
                      className="flex-1 rounded-md text-xs h-12 py-2 px-1 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <FileTextIcon size={14} className="mb-1" />
                        <span className="text-[10px] leading-tight">{t("transaction.searchByCode")}</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="scan-qr" 
                      className="flex-1 rounded-md text-xs h-12 py-2 px-1 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <ScanIcon size={14} className="mb-1" />
                        <span className="text-[10px] leading-tight">{t("transaction.scanCode")}</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="by-contact">
                    <div className="relative">
                      <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder={t("transaction.searchContacts")}
                        className="pl-9 pr-9 py-5 bg-muted/30 border-muted/50 rounded-xl"
                        value={searchContactTerm}
                        onChange={(e) => setSearchContactTerm(e.target.value)}
                      />
                      {searchContactTerm && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
                          onClick={() => setSearchContactTerm("")}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="by-code">
                    <div className="relative">
                      <FileTextIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder={t("transaction.enterFlousslyCode")}
                        className="pl-9 pr-9 py-5 bg-muted/30 border-muted/50 rounded-xl"
                      />
                      <Button 
                        variant="ghost"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 rounded-lg bg-primary/20 hover:bg-primary/30 px-3 text-xs"
                      >
                        {t("common.search")}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="scan-qr" className="text-center">
                    <Button 
                      onClick={() => setLocation("/camera-scan")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 py-6 px-8 rounded-xl text-base flex items-center"
                    >
                      <ScanIcon size={18} className="mr-2" />
                      {t("qrCode.scanCode")}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Recent contacts */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-4 flex items-center">
                  <Users size={14} className="mr-2 text-muted-foreground" />
                  {t("transaction.recentContacts")}
                </h3>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {recentContacts.map((contact) => (
                    <ContactItem 
                      key={contact.id} 
                      contact={contact} 
                      onSelect={setSelectedContact}
                    />
                  ))}
                </div>
              </div>
              
              {/* All contacts */}
              <div>
                <h3 className="text-sm font-medium mb-4">{t("transaction.allContacts")}</h3>
                <div className="space-y-1">
                  {contactsLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center p-6 bg-muted/20 rounded-xl">
                      <p className="text-muted-foreground">{t("transaction.noContactsFound")}</p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div 
                        key={contact.id}
                        className="flex items-center py-3 px-4 rounded-xl hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <Avatar className="w-10 h-10 mr-3">
                          <AvatarImage src={contact.image} alt={contact.name} />
                          <AvatarFallback className="bg-primary/20">
                            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-5"
            >
              {/* Amount input */}
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">{t("transaction.amount")}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg font-bold">
                    {t("transaction.currencySymbol")}
                  </span>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    className="text-2xl font-bold pl-10 pr-4 py-6 bg-muted/20 border-muted rounded-xl text-center"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Quick amounts */}
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-3">
                  {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                    <Button 
                      key={amt}
                      variant="outline" 
                      className="rounded-xl py-5 border-muted bg-muted/10"
                      onClick={() => setAmount(amt.toString())}
                    >
                      {t("transaction.currencySymbol")} {amt}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Send button */}
              <div className="mt-auto">
                <Button 
                  className="w-full py-6 text-lg font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!amount || parseFloat(amount) <= 0}
                  onClick={handleSendMoney}
                >
                  <Send className="mr-2" size={18} />
                  {t("transaction.sendMoney")}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 py-3 text-sm rounded-xl"
                  onClick={() => setSelectedContact(null)}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}
            
      {/* Floating Action Button (only on history view) */}
      {mainView === "history" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="fixed bottom-20 right-6 z-50"
        >
          <Button 
            className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            onClick={() => setMainView("send")}
          >
            <PlusIcon size={24} />
          </Button>
        </motion.div>
      )}
    </div>
  );
}