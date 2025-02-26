"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Simplified type definition for ThemeProvider props
type ThemeProviderProps = {
  children: React.ReactNode;
  [prop: string]: any;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 