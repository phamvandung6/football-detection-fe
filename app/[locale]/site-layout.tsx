"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

interface SiteLayoutProps {
  children: ReactNode;
  locale: string;
}

export function SiteLayout({ children, locale }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar locale={locale} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer locale={locale} />
      <Toaster position="top-right" richColors />
    </div>
  );
}
