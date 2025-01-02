"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

const FAQ_ITEMS = [
  {
    question: "What is Datathon?",
    answer:
      "Datathon is a 36-hour data science competition where students work in teams to solve real-world problems using data analytics and machine learning. Participants will have access to unique datasets, mentorship, and workshops throughout the event.",
  },
  {
    question: "Who can participate?",
    answer:
      "All UCI students are welcome to participate, regardless of major or experience level. Whether you're a beginner or an experienced data scientist, you'll find opportunities to learn and grow.",
  },
  {
    question: "Do I need a team?",
    answer:
      "You can sign up individually or with a team of up to 4 people. Don't worry if you don't have a team - we'll have team formation events where you can meet other participants!",
  },
  {
    question: "What should I bring?",
    answer:
      "Bring your laptop, charger, and enthusiasm for data science! We'll provide meals, snacks, and all the resources you need throughout the event.",
  },
  {
    question: "When and where is it?",
    answer:
      "Datathon will be held April 11-13, 2025 at the Interdisciplinary Science and Engineering Building (ISEB).",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        className="py-6 w-full flex justify-between items-center text-left"
        onClick={onClick}
      >
        <span className="text-xl font-outfit text-gray-900">{question}</span>
        <span
          className={`ml-6 flex-shrink-0 transition-transform duration-200 text-indigo-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ↓
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
          marginBottom: isOpen ? "1.5rem" : "0rem",
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-gray-600 font-chillax">{answer}</p>
      </motion.div>
    </div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="min-h-screen bg-slate-100 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[200px,1fr] gap-12">
          {/* Left side - Label */}
          <div>
            <div className="flex items-center gap-4">
              <div className="w-[6px] h-[6px] rounded-full bg-indigo-400" />
              <span className="text-sm uppercase tracking-wider text-gray-500">
                faq
              </span>
            </div>
          </div>

          {/* Right side - Content */}
          <div>
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="max-w-2xl"
            >
              <h2 className="text-4xl md:text-5xl font-outfit font-light mb-12 text-gray-900">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {FAQ_ITEMS.map((item, index) => (
                  <FAQItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === index}
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
