"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function FooterNewsletter() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("common.emailRequired"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("common.invalidEmail"));
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success(t("common.subscribeSuccess"));
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">{t("common.newsletter")}</h3>
      <p className="text-sm text-muted-foreground">
        {t("common.newsletterDesc")}
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder={t("common.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-[200px]"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                {t("common.subscribing")}
              </>
            ) : (
              t("common.subscribe")
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("common.privacyNotice")}
        </p>
      </form>
    </div>
  );
}

function LoadingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
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
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
