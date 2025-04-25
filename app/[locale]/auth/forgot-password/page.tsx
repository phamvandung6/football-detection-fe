"use client";

import { useParams } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;

  return <ForgotPasswordForm locale={locale} />;
}
