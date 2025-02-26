import HomeLayout from "@/components/home/HomeLayout";
import { Metadata } from "next";
import { generateMetadata } from "./metadata";

// Metadata cho trang chủ
export const metadata: Metadata = generateMetadata({
  title: "Football Detection - AI Video Analysis",
  description:
    "Analyze football videos with AI to detect players, ball, and key events in real-time.",
  path: "/",
});

export default function HomePage() {
  return <HomeLayout />;
}
