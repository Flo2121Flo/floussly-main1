import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <Toaster />
    <App />
  </Providers>
);
