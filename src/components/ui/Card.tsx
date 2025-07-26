import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/utils";

import { HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  gradient = false,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50",
        gradient && "bg-gradient-to-br from-white/90 to-gray-50/90",
        hover &&
          "hover:shadow-xl hover:border-blue-300/50 transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
