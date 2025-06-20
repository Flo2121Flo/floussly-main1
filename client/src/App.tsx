import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "./components/Layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import { AMLDashboard } from './components/AMLDashboard';
import FloussChat from './pages/FloussChat';
import FloussDrop from './pages/FloussDrop';
import { useTranslation } from 'react-i18next';
import { Toaster } from './components/ui/toaster';
import { PaymentRequests } from './pages/PaymentRequests';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  [key: string]: any;
}

function App() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const ProtectedRoute = ({ component: Component, path, ...rest }: ProtectedRouteProps) => {
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
    }

    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', path);
      return <Redirect to="/login" />;
    }

    return <Component {...rest} />;
  };

  const publicRoutes = [
    { path: "/login", component: Login },
    { path: "/register", component: Register },
  ];

  const protectedRoutes = [
    { path: "/", component: Dashboard },
    { path: "/home", component: Home },
    { path: "/dashboard", component: Dashboard },
  ];
  
  return (
    <Layout>
      <Switch>
        {publicRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} component={Component} />
        ))}
        
        {protectedRoutes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            component={(props: any) => (
              <ProtectedRoute component={Component} path={path} {...props} />
            )}
          />
        ))}
        
        <Route path="/aml/:userId" element={<AMLDashboard />} />
        
        <Route path="/chat/:chatId?" component={FloussChat} />
        <Route path="/treasure" component={FloussDrop} />
        
        <Route
          path="/payment-requests"
          element={
            <ProtectedRoute>
              <PaymentRequests />
            </ProtectedRoute>
          }
        />
        
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </Layout>
  );
}

export default App;
