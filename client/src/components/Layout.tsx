import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  // Display bottom navigation on all pages
  const showBottomNav = true;
  
  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 relative">
      {children}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}
