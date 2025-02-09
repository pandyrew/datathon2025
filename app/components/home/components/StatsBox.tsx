"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface StatsBoxProps {
  label: string;
  value: string;
  delay?: number;
}

export default function StatsBox({ label, value, delay = 0 }: StatsBoxProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="border border-gray-300 p-6 h-[300px] flex flex-col justify-between bg-white/90"
    >
      <p className="text-sm uppercase tracking-wider text-gray-500 mb-4 font-outfit">
        {label}
      </p>
      <p className="text-5xl text-indigo-400 font-outfit">{value}</p>
    </motion.div>
  );
}
