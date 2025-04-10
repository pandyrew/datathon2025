"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const SPONSORS = [
  {
    name: "Melissa Education",
    logo: "/sponsors/melissa_logo.png",
    url: "https://www.melissa.com/education/"
  },
  {
    name: "SPFB",
    logo: "/sponsors/spfb.png",
    url: "https://asuci.uci.edu/president/spfb/"
  },
  {
    name: "Merage",
    logo: "/sponsors/merage.png",
    url: "https://merage.uci.edu"
  },
  {
    name: "Strata Scratch",
    logo: "/sponsors/strata.png",
    url: "https://stratascratch.com"
  },
];


export default function Sponsors() {
  const ref = useRef(null);
  const logosRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const areLogosInView = useInView(logosRef, { once: true, margin: "-100px" });

  return (
    <section id="sponsors" className="min-h-[500px] bg-white py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[200px,1fr] gap-12">
          {/* Left side - Label */}
          <div>
            <div className="flex items-center gap-4">
              <div className="w-[6px] h-[6px] rounded-full bg-indigo-400" />
              <span className="text-sm uppercase tracking-wider text-gray-500">
                sponsors
              </span>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-24">
            {/* Sponsors */}
            <motion.div
              ref={logosRef}
              initial={{ y: 20 }}
              animate={areLogosInView ? { y: 0 } : { y: 20 }}
              transition={{
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              {/* <h3 className="text-2xl font-outfit font-light mb-12 text-gray-900">
                Sponsors
              </h3> */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                {SPONSORS.map((sponsor, index) => (
                  <a
                    key={sponsor.name}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-transform duration-300 hover:scale-105"
                  >
                    <motion.div
                      initial={{ y: 20 }}
                      animate={areLogosInView ? { y: 0 } : { y: 20 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      }}
                      className="aspect-square relative flex items-center justify-center"
                    >
                      <Image
                        src={sponsor.logo}
                        alt={sponsor.name}
                        fill
                        className="object-contain"
                      />
                    </motion.div>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Sponsorship CTA */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="max-w-2xl bg-slate-100 p-12"
            >
              <h3 className="text-3xl md:text-4xl font-outfit font-light mb-4 text-gray-900">
                Interested in sponsoring?
              </h3>
              <p className="text-lg text-gray-600 font-chillax mb-8">
                Support the next generation of data scientists and connect with
                talented students.
              </p>
              <a
                href="mailto:dataclub@uci.edu"
                className="inline-flex items-center text-indigo-500 hover:text-indigo-600 font-outfit text-lg transition-colors"
              >
                dataclub@uci.edu
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
