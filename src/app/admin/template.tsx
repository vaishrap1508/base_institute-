"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut" 
      }}
      className="flex-1 flex flex-col min-w-0 h-full w-full relative"
    >
      {children}
    </motion.div>
  );
}
