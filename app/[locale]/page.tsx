"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function HomePage() {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const bounceVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center space-y-24">
      {/* Hero Section with integrated Upload UI */}
      <section className="w-full py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background elements - softer gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background z-0"></div>
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-60 animate-pulse-slow"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full filter blur-xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-green-500/5 rounded-full filter blur-xl"></div>

        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern-dark opacity-[0.02] dark:opacity-[0.04]"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              className="space-y-4 max-w-3xl mx-auto mb-12"
              variants={itemVariants}
            >
              <motion.div
                className="inline-block mb-4"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="inline-block py-1 px-4 rounded-full text-sm font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/10 shadow-sm">
                  {t("app.beta")}
                </span>
              </motion.div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
                <span className="gradient-text inline-block">
                  {t("app.title")}
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                {t("app.description")}
              </p>
            </motion.div>

            {/* Combined Upload Card */}
            <motion.div
              className="w-full max-w-3xl glass rounded-xl p-8 shadow-lg border border-primary/10 relative overflow-hidden"
              variants={itemVariants}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-tr-full"></div>

              <div className="text-center relative z-10 space-y-6">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 border border-primary/20">
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
                    className="h-8 w-8 text-primary"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold">
                  {t("dashboard.uploadVideo")}
                </h2>
                <p className="text-muted-foreground">
                  {t("video.upload.dragDrop")}
                </p>

                <div className="border-2 border-dashed border-primary/20 rounded-lg p-12 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
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
                    className="mx-auto h-12 w-12 text-muted-foreground mb-4"
                  >
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                    <path d="m15 7 4-4" />
                    <path d="M8 12h6" />
                    <path d="m9 9 3 3-3 3" />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    {t("video.upload.requirements")}
                  </p>
                </div>

                <Link href="./dashboard">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      className="w-full rounded-full shadow-md hover:shadow-lg"
                      size="lg"
                    >
                      {t("dashboard.uploadNow")}
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Navigation buttons */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center mt-8"
              variants={itemVariants}
            >
              <Link href="./dashboard">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300 px-8"
                  >
                    {t("dashboard.title")}
                  </Button>
                </motion.div>
              </Link>
              <Link href="./auth/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300 px-8"
                  >
                    {t("auth.login")}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section - Moved to bottom */}
      <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 radial-gradient-ellipse"></div>

        <div className="container px-4 md:px-6 relative z-20">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 relative"
            >
              <span className="px-4 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary relative z-10">
                {t("features.title")}
              </span>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 blur-md z-0"></div>
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              <span className="gradient-text inline-block">
                {t("features.title")}
              </span>
            </h2>
            <p className="mx-auto max-w-[800px] text-muted-foreground text-lg">
              {t("features.description")}
            </p>
          </motion.div>

          <div className="grid gap-8 md:gap-12 lg:grid-cols-3">
            <motion.div
              className="glass rounded-xl p-8 shadow-lg hover-card relative overflow-hidden"
              variants={bounceVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full z-0"></div>
              <div className="relative z-10">
                <div className="rounded-lg bg-primary/10 p-4 mb-6 inline-block border border-primary/20 shadow-sm">
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
                    className="h-6 w-6 text-primary"
                  >
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect x="2" y="6" width="14" height="12" rx="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {t("features.upload")}
                </h3>
                <p className="text-muted-foreground">
                  {t("video.upload.requirements")}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="glass rounded-xl p-8 shadow-lg hover-card relative overflow-hidden"
              variants={bounceVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full z-0"></div>
              <div className="relative z-10">
                <div className="rounded-lg bg-blue-500/10 p-4 mb-6 inline-block border border-blue-500/20 shadow-sm">
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
                    className="h-6 w-6 text-blue-500"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M12 8v8" />
                    <path d="m8 12 8 0" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {t("features.process")}
                </h3>
                <p className="text-muted-foreground">
                  {t("video.processing.status")}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="glass rounded-xl p-8 shadow-lg hover-card relative overflow-hidden"
              variants={bounceVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full z-0"></div>
              <div className="relative z-10">
                <div className="rounded-lg bg-green-500/10 p-4 mb-6 inline-block border border-green-500/20 shadow-sm">
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
                    className="h-6 w-6 text-green-500"
                  >
                    <path d="M21 15V6" />
                    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M12 12H3" />
                    <path d="M16 6H3" />
                    <path d="M12 18H3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {t("features.analyze")}
                </h3>
                <p className="text-muted-foreground">
                  {t("dashboard.videoDetails")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Add the CSS for background patterns */}
      <style jsx global>{`
        .bg-grid-pattern-dark {
          background-image: linear-gradient(
              to right,
              rgba(127, 127, 127, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(127, 127, 127, 0.05) 1px,
              transparent 1px
            );
          background-size: 24px 24px;
        }

        .radial-gradient-ellipse {
          background-image: radial-gradient(
            ellipse at center,
            rgba(var(--primary-rgb), 0.15) 0%,
            rgba(var(--primary-rgb), 0) 70%
          );
        }

        .graduate-text {
          background: linear-gradient(to right, var(--primary), #4f46e5);
          -webkit-background-clip: text;
          color: transparent;
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
