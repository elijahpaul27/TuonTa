"use client";

import { useState, useEffect } from "react";
import { COMFORTING_WORDS, STUDY_HACKS, WITTY_QUOTES } from "@/lib/constants/engagement";
import { Sparkles, Lightbulb, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EngagementMessageProps {
  type: "comfort" | "hack" | "quote";
  className?: string;
}

export function EngagementMessage({ type, className = "" }: EngagementMessageProps) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let list: string[] = [];
    switch (type) {
      case "comfort":
        list = COMFORTING_WORDS;
        break;
      case "hack":
        list = STUDY_HACKS;
        break;
      case "quote":
        list = WITTY_QUOTES;
        break;
    }
    
    // Pick a random string safely on the client
    const randomIndex = Math.floor(Math.random() * list.length);
    setMessage(list[randomIndex]);
  }, [type]);

  const Icon = type === "comfort" ? Coffee : type === "hack" ? Lightbulb : Sparkles;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`flex items-start gap-3 p-4 rounded-xl bg-csc-blue-light/20 border border-csc-blue-mid/30 shadow-sm ${className}`}
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
            <Icon className="w-4 h-4 text-csc-blue-dark" />
          </div>
          <p className="text-sm font-medium text-slate-600 italic leading-relaxed pt-1">
            &ldquo;{message}&rdquo;
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
