"use client";

import { useParams } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;

  return <AuthForm type="register" locale={locale} />;
}
