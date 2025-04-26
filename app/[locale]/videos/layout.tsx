"use client";

import { ReactNode } from "react";

interface VideosLayoutProps {
  children: ReactNode;
}

export default function VideosLayout({ children }: VideosLayoutProps) {
  return <>{children}</>;
}
