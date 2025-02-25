"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

export default function DashboardPage() {
  const t = useTranslations();
  const [isHovering, setIsHovering] = useState(null);

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

  return (
    <motion.div
      className="space-y-8 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.description")}
          </p>
        </div>
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
        >
          {t("dashboard.uploadVideo")}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-4 w-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </Button>
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        <motion.div
          className="rounded-xl border bg-card text-card-foreground shadow-sm hover-card"
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          onMouseEnter={() => setIsHovering("myVideos")}
          onMouseLeave={() => setIsHovering(null)}
        >
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-primary/10 p-3">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                  animate={{
                    scale: isHovering === "myVideos" ? 1.2 : 1,
                    rotate: isHovering === "myVideos" ? 5 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="m15 3-6 6" />
                  <path d="m15 21-6-6" />
                  <path d="M11.5 12H13" />
                </motion.svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {t("dashboard.myVideos")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">0</span>{" "}
                  {t("dashboard.videos").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card text-card-foreground shadow-sm hover-card"
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          onMouseEnter={() => setIsHovering("processing")}
          onMouseLeave={() => setIsHovering(null)}
        >
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-blue-500/10 p-3">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-blue-500"
                  animate={{
                    rotate: isHovering === "processing" ? 360 : 0,
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 6 4 6-4 6-4-6 4-6" />
                </motion.svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {t("dashboard.processing")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-blue-500">0</span>{" "}
                  {t("dashboard.videos").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card text-card-foreground shadow-sm hover-card"
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          onMouseEnter={() => setIsHovering("completed")}
          onMouseLeave={() => setIsHovering(null)}
        >
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-green-500/10 p-3">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-500"
                  animate={{
                    scale: isHovering === "completed" ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    repeat: isHovering === "completed" ? Infinity : 0,
                    duration: 0.5,
                  }}
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </motion.svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {t("dashboard.completed")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-green-500">0</span>{" "}
                  {t("dashboard.videos").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card text-card-foreground shadow-sm hover-card"
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          onMouseEnter={() => setIsHovering("failed")}
          onMouseLeave={() => setIsHovering(null)}
        >
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="inline-block rounded-lg bg-red-500/10 p-3">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-red-500"
                  animate={{
                    y: isHovering === "failed" ? [0, -2, 0] : 0,
                  }}
                  transition={{
                    repeat: isHovering === "failed" ? Infinity : 0,
                    duration: 0.3,
                  }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </motion.svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  {t("dashboard.failed")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-red-500">0</span>{" "}
                  {t("dashboard.videos").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="rounded-xl border bg-card text-card-foreground shadow-sm hover-card"
        variants={itemVariants}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold">{t("dashboard.myVideos")}</h2>
          <div className="py-12 text-center">
            <motion.div
              className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="rounded-full bg-muted p-6 mb-4">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-10 w-10 text-muted-foreground"
                  animate={{ rotate: [0, -5, 0, 5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                >
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect x="2" y="6" width="14" height="12" rx="2" />
                </motion.svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {t("dashboard.notFound")}
              </h3>
              <p className="mb-6 mt-2 text-sm text-muted-foreground">
                {t("video.upload.dragDrop")}
              </p>
              <Button className="rounded-full shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1">
                {t("dashboard.uploadVideo")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 h-4 w-4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
