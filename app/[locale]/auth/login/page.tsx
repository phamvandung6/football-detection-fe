"use client";

import { useParams } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  const params = useParams();
  const locale = params.locale as string;

  return <AuthForm type="login" locale={locale} />;
}
