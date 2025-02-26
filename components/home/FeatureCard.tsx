"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  gradientFrom?: string;
  iconBg?: string;
  iconBorder?: string;
};

// Animation variants
const bounceVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.03,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

export default function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  gradientFrom = "primary/5",
  iconBg = "primary/10",
  iconBorder = "primary/20",
}: FeatureCardProps) {
  return (
    <motion.div
      variants={bounceVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Card className="glass hover-card relative overflow-hidden">
        <CardContent className="p-8">
          <div
            className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-${gradientFrom} to-transparent rounded-bl-full z-0`}
          ></div>
          <div className="relative z-10">
            <div
              className={`rounded-lg bg-${iconBg} p-4 mb-6 inline-block border border-${iconBorder} shadow-sm`}
            >
              {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
