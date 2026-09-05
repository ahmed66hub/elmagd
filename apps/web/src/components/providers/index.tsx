"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "./auth-provider";
import { ContentProvider } from "./content-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

/** كل الـ providers في مكان واحد حتى لا يتضخم layout.tsx. */
export function AppProviders({ children }: { children: ReactNode }) {
  // ContentProvider أولًا لأن ThemeProvider يقرأ منه الوضع الافتراضي للموقع.
  return (
    <ContentProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ContentProvider>
  );
}

export { useAuth } from "./auth-provider";
export { useContent, useSettings } from "./content-provider";
export { useTheme } from "./theme-provider";
export { useToast } from "./toast-provider";
