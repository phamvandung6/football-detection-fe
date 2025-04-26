"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { Link } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function HeroSection() {
  const t = useTranslations();
  const { user, isAuthenticated, isLoading } = useAuthSession();
  const params = useParams();
  const locale = params.locale as string;

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

  const isAdmin = user?.roles.includes("admin");

  return (
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

          {/* Navigation buttons */}
          <motion.div
            className="flex flex-wrap gap-4 justify-center mt-8 min-h-[52px]"
            variants={itemVariants}
          >
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-32 rounded-full" />
                <Skeleton className="h-12 w-32 rounded-full" />
              </>
            ) : (
              <>
                <Link href="/upload">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="default"
                      size="lg"
                      className="rounded-full backdrop-blur-sm bg-primary hover:bg-primary/90 transition-all duration-300 px-8"
                    >
                      {t("upload.title")}
                    </Button>
                  </motion.div>
                </Link>
                {isAdmin && (
                  <Link href="/dashboard">
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
                )}
                {!isAuthenticated && (
                  <Link href="/auth/login">
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
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
