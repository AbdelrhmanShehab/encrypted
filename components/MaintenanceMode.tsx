"use client";

import { motion } from "framer-motion";
import Logo from "./Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function MaintenanceMode() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Logo/Banner */}
        <div className="flex justify-center">
          <Logo size="lg" href={null} />
        </div>

        {/* Maintenance Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-bone">
            {t("maintenance_title" as any) || "We'll be back shortly"}
          </h1>
          <p className="text-lg md:text-xl text-bone/65 leading-relaxed">
            {t("maintenance_desc" as any) || 
              "We're currently updating our store to provide you with the best fashion experience. Thank you for your patience!"}
          </p>
        </div>

        {/* Visual Decoration */}
        <div className="flex justify-center py-4">
          <div className="h-1 w-24 bg-[#00f23a] rounded-full" />
        </div>

        <p className="font-mono text-xs uppercase tracking-widest text-[#00f23a]">ENCRYPTED // STATUS: UPDATING</p>

        {/* Footer */}
        <p className="text-sm text-bone/40 pt-8">
          © {new Date().getFullYear()} Encrypted. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
