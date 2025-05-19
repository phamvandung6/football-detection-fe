"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { ProcessingNotifications } from "@/components/videos/ProcessingNotifications";
import { ReactNode } from "react";

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
      <ProcessingNotifications locale={locale} />
    </div>
  );
}
