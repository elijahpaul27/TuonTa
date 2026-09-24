"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

export function DashboardMotionLayout({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      {children}
    </motion.div>
  );
}

export function DashboardMotionItem({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function AnimatedHoverBadge({ children }: { children: ReactNode }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, rotate: -2 }} 
      transition={{ type: "spring", stiffness: 300 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
