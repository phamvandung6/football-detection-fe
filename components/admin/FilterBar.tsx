"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

type FilterBarProps = {
  variants?: any;
};

export default function FilterBar({ variants }: FilterBarProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4 items-center justify-between"
      variants={variants}
    >
      <div className="relative w-full sm:w-72">
        <Input
          type="text"
          placeholder={t("dashboard.searchVideos")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              {t("dashboard.filterBy")}
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
                <path d="M3 6h18" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t("dashboard.filterAll")}</DropdownMenuItem>
            <DropdownMenuItem>
              {t("dashboard.filterProcessing")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              {t("dashboard.filterCompleted")}
            </DropdownMenuItem>
            <DropdownMenuItem>{t("dashboard.filterFailed")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              {t("dashboard.sortBy")}
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
                <path d="m3 16 4 4 4-4" />
                <path d="M7 20V4" />
                <path d="M21 8h-8" />
                <path d="M21 12h-8" />
                <path d="M21 16h-8" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t("dashboard.sortNewest")}</DropdownMenuItem>
            <DropdownMenuItem>{t("dashboard.sortOldest")}</DropdownMenuItem>
            <DropdownMenuItem>{t("dashboard.sortName")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="w-full sm:w-auto">
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
            className="mr-2 h-4 w-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {t("dashboard.uploadVideo")}
        </Button>
      </div>
    </motion.div>
  );
}
