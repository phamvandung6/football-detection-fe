"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
