"use client";

import { Link } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";

interface FooterLinksProps {
  locale: string;
  title: string;
  links: Array<{
    href: string;
    label: string;
  }>;
}

export function FooterLinks({ locale, title, links }: FooterLinksProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">{title}</h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <FooterLink
            key={index}
            locale={locale}
            href={link.href}
            label={link.label}
          />
        ))}
      </ul>
    </div>
  );
}

interface FooterLinkProps {
  locale: string;
  href: string;
  label: string;
}

function FooterLink({ locale, href, label }: FooterLinkProps) {
  return (
    <motion.li
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <ChevronRightIcon />
        {label}
      </Link>
    </motion.li>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-70"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
