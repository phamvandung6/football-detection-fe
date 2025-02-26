"use client";

import { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import { Toaster } from "@/components/ui/sonner";

export default function HomeLayout() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center space-y-24">
      {/* Hero Section with integrated Upload UI */}
      <HeroSection />

      {/* Key Features Section */}
      <FeaturesSection />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
