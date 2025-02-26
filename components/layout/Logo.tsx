"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface LogoProps {
  locale: string;
}

export function Logo({ locale }: LogoProps) {
  const t = useTranslations();

  return (
    <Link
      href={`/${locale}`}
      className="text-xl font-bold flex items-center gap-2 transition-transform hover:scale-105"
    >
      <FootballIcon className="h-6 w-6 text-primary animate-pulse-slow" />
      <motion.span
        className="gradient-text"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {t("app.title")}
      </motion.span>
    </Link>
  );
}

function FootballIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M12 7v4l3 3" />
      <path d="m7 17 2.5-2.5" />
      <path d="m14.5 14.5 2.5 2.5" />
      <path d="M7 7.5 9.5 10" />
      <path d="m14.5 9.5 2.5-2" />
    </svg>
  );
}
