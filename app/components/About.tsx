"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const text = "Empowering Students to Solve Real-World Problems Through Data";
  const words = text.split(" ");

  return (
    <section id="about" className="min-h-screen bg-slate-100 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[200px,1fr] gap-12">
          {/* Left side - Label */}
          <div>
            <div className="flex items-center gap-4">
              <div className="w-[6px] h-[6px] rounded-full bg-indigo-400" />
              <span className="text-sm uppercase tracking-wider text-gray-500">
                about
              </span>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-16">
            <motion.h2
              ref={ref}
              className="text-4xl md:text-6xl lg:text-7xl font-outfit font-light leading-tight max-w-4xl text-gray-900"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.2em]"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>

            <div className="max-w-3xl">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={
                  isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                }
                transition={{
                  duration: 0.8,
                  delay: 0.8,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="text-xl text-gray-700 mb-7 font-chillax"
              >
                Datathon is UCI&apos;s premier data science competition where
                students work in teams to solve real-world problems using data
                analytics and machine learning. Over the course of 36 hours,
                participants will have the opportunity to work with unique
                datasets, receive mentorship from industry professionals, and
                compete for prizes.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={
                  isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                }
                transition={{
                  duration: 0.8,
                  delay: 1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="text-xl text-gray-700 font-chillax mb-16"
              >
                Inspired by the Seven Wonders of the World, this year&apos;s
                Datathon challenges participants to analyze and derive insights
                from datasets related to world heritage sites, cultural
                landmarks, and historical monuments. Join us in exploring how
                data science can help preserve and understand humanity&apos;s
                greatest achievements.
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
