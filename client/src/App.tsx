import { Switch, Route, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import Splash from "@/pages/Splash";
import LanguageSelection from "@/pages/LanguageSelection";
import Login from "@/pages/Login";
import OtpVerification from "@/pages/OtpVerification";
import Kyc from "@/pages/Kyc";
import Home from "@/pages/Home";
import SendMoney from "@/pages/SendMoney";
import QrCode from "@/pages/QrCode";
import Daret from "@/pages/Daret";
import AgentMap from "@/pages/AgentMap";
import FinanceOverview from "@/pages/FinanceOverview";
import Notifications from "@/pages/Notifications";
import ProfileSettings from "@/pages/ProfileSettings";
import Profile from "@/pages/Profile";
import PaymentPage from "@/pages/PaymentPage";
import CameraScan from "@/pages/CameraScan";
import FinancialHealth from "@/pages/FinancialHealth";
import Transactions from "@/pages/Transactions";
import TransactionDetail from "@/pages/TransactionDetail";
import BankAccounts from "@/pages/BankAccounts";
import TestFeeCalculator from "@/pages/TestFeeCalculator";
import { useEffect } from "react";
import Layout from "./components/Layout";

// Main App component
function App() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);

  // Check if user is authenticated (for demo purposes we're skipping actual authentication)
  const isAuthenticated = true; // This would normally come from an auth service
  const isDemoMode = true; // Setting to true allows access to all pages without auth
  
  // Function to create protected routes that redirect to login if not authenticated
  const ProtectedRoute = ({ component: Component, ...rest }: any) => {
    if (isDemoMode || isAuthenticated) {
      return <Component {...rest} />;
    } else {
      // Redirect to login and remember where they were trying to go
      window.localStorage.setItem('redirectAfterLogin', rest.path);
      window.location.href = '/login';
      return null;
    }
  };
  
  return (
    <Layout>
      <Switch>
        {/* Public onboarding routes */}
        <Route path="/splash" component={Splash} />
        <Route path="/language" component={LanguageSelection} />
        <Route path="/login" component={Login} />
        <Route path="/otp-verification" component={OtpVerification} />
        
        {/* Protected main routes */}
        <Route path="/" component={(props: any) => <ProtectedRoute component={Home} path="/" {...props} />} />
        <Route path="/send-money" component={(props: any) => <ProtectedRoute component={SendMoney} path="/send-money" {...props} />} />
        <Route path="/qr-code" component={(props: any) => <ProtectedRoute component={QrCode} path="/qr-code" {...props} />} />
        <Route path="/tontine" component={(props: any) => <ProtectedRoute component={Daret} path="/tontine" {...props} />} />
        <Route path="/daret" component={(props: any) => <ProtectedRoute component={Daret} path="/daret" {...props} />} />
        <Route path="/agent-map" component={(props: any) => <ProtectedRoute component={AgentMap} path="/agent-map" {...props} />} />
        <Route path="/finance-overview" component={(props: any) => <ProtectedRoute component={FinanceOverview} path="/finance-overview" {...props} />} />
        <Route path="/finance" component={(props: any) => <ProtectedRoute component={FinanceOverview} path="/finance" {...props} />} />
        <Route path="/financial-health" component={(props: any) => <ProtectedRoute component={FinancialHealth} path="/financial-health" {...props} />} />
        <Route path="/transactions" component={(props: any) => <ProtectedRoute component={Transactions} path="/transactions" {...props} />} />
        <Route path="/transaction/:id" component={(props: any) => <ProtectedRoute component={TransactionDetail} path="/transaction/:id" {...props} />} />
        <Route path="/notifications" component={(props: any) => <ProtectedRoute component={Notifications} path="/notifications" {...props} />} />
        <Route path="/settings" component={(props: any) => <ProtectedRoute component={ProfileSettings} path="/settings" {...props} />} />
        <Route path="/camera-scan" component={(props: any) => <ProtectedRoute component={CameraScan} path="/camera-scan" {...props} />} />
        <Route path="/profile" component={(props: any) => <ProtectedRoute component={Profile} path="/profile" {...props} />} />
        
        {/* Protected payment and banking routes */}
        <Route path="/payment-page" component={(props: any) => <ProtectedRoute component={PaymentPage} path="/payment-page" {...props} />} />
        <Route path="/payment" component={(props: any) => <ProtectedRoute component={PaymentPage} path="/payment" {...props} />} />
        <Route path="/withdraw" component={(props: any) => <ProtectedRoute component={PaymentPage} path="/withdraw" {...props} />} />
        <Route path="/special-offers" component={(props: any) => <ProtectedRoute component={PaymentPage} path="/special-offers" {...props} />} />
        <Route path="/bank-accounts" component={(props: any) => <ProtectedRoute component={BankAccounts} path="/bank-accounts" {...props} />} />
        
        {/* KYC route - needs authentication but is part of onboarding */}
        <Route path="/kyc" component={(props: any) => <ProtectedRoute component={Kyc} path="/kyc" {...props} />} />
        
        {/* Testing tools */}
        <Route path="/test-fee-calculator" component={(props: any) => <ProtectedRoute component={TestFeeCalculator} path="/test-fee-calculator" {...props} />} />
        
        {/* Fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
