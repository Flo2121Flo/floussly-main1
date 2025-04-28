import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "./components/Layout";
import NotFound from "@/pages/not-found";
import Splash from "@/pages/Splash";
import LanguageSelection from "@/pages/LanguageSelection";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import OtpVerification from "@/pages/OtpVerification";
import Kyc from "@/pages/Kyc";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
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

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  [key: string]: any;
}

// Main App component
function App() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);

  // Function to create protected routes that redirect to login if not authenticated
  const ProtectedRoute = ({ component: Component, path, ...rest }: ProtectedRouteProps) => {
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
    }

    if (!isAuthenticated) {
      // Store the intended destination
      localStorage.setItem('redirectAfterLogin', path);
      return <Redirect to="/login" />;
    }

    return <Component {...rest} />;
  };

  // Public routes that don't require authentication
  const publicRoutes = [
    { path: "/splash", component: Splash },
    { path: "/language", component: LanguageSelection },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/otp-verification", component: OtpVerification },
  ];

  // Protected routes that require authentication
  const protectedRoutes = [
    { path: "/", component: Dashboard },
    { path: "/home", component: Home },
    { path: "/dashboard", component: Dashboard },
    { path: "/send-money", component: SendMoney },
    { path: "/qr-code", component: QrCode },
    { path: "/tontine", component: Daret },
    { path: "/daret", component: Daret },
    { path: "/agent-map", component: AgentMap },
    { path: "/finance-overview", component: FinanceOverview },
    { path: "/finance", component: FinanceOverview },
    { path: "/financial-health", component: FinancialHealth },
    { path: "/transactions", component: Transactions },
    { path: "/transaction/:id", component: TransactionDetail },
    { path: "/notifications", component: Notifications },
    { path: "/settings", component: ProfileSettings },
    { path: "/camera-scan", component: CameraScan },
    { path: "/profile", component: Profile },
    { path: "/payment-page", component: PaymentPage },
    { path: "/payment", component: PaymentPage },
    { path: "/withdraw", component: PaymentPage },
    { path: "/special-offers", component: PaymentPage },
    { path: "/bank-accounts", component: BankAccounts },
    { path: "/kyc", component: Kyc },
    { path: "/test-fee-calculator", component: TestFeeCalculator },
  ];
  
  return (
    <Layout>
      <Switch>
        {/* Public routes */}
        {publicRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} component={Component} />
        ))}
        
        {/* Protected routes */}
        {protectedRoutes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            component={(props: any) => (
              <ProtectedRoute component={Component} path={path} {...props} />
            )}
          />
        ))}
        
        {/* Fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
