"use client";

import AppBootstrapper from "@/components/AppBootstrapper";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

/**
 * Wraps all client-only contexts (Session, Theme, Toast, Bootstrapper).
 */
export default function ProvidersShell({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <SessionProviderWrapper>
         <AppBootstrapper />
         <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors closeButton position="bottom-center" />
         </ThemeProvider>
      </SessionProviderWrapper>
   );
}
