"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HoverInteractWrapperProps {
  children: ReactNode;
  className?: string;
  scaleAmt?: number;
}

export function HoverInteractWrapper({
  children,
  className = "",
  scaleAmt = 1.02,
}: HoverInteractWrapperProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: scaleAmt,
        boxShadow: "0px 10px 30px rgba(59, 130, 246, 0.3)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}
