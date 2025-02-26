"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import VideoList from "./VideoList";
import AnalyticsSection from "./AnalyticsSection";

export default function DashboardLayout() {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="space-y-8 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Dashboard Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <FilterBar variants={itemVariants} />

      {/* Analytics Section */}
      <AnalyticsSection variants={itemVariants} />

      {/* Video List */}
      <VideoList variants={itemVariants} />
    </motion.div>
  );
} 