"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const WONDERS = [
  {
    video: "colosseum.mp4",
  },
  {
    video: "wall.mp4",
  },
  {
    video: "wall.mp4", // Temporary
  },
  {
    video: "colosseum.mp4", // Temporary
  },
  {
    video: "wall.mp4", // Temporary
  },
  {
    video: "colosseum.mp4", // Temporary
  },
  {
    video: "wall.mp4", // Temporary
  },
];

export default function Landing() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * WONDERS.length));
  }, []);

  const handleVideoEnd = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % WONDERS.length);
  };

  const currentWonder = WONDERS[currentIndex];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Navbar />

      <video
        autoPlay
        loop={false}
        muted
        playsInline
        onEnded={handleVideoEnd}
        key={currentWonder.video}
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={`/${currentWonder.video}`} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
        <div className="flex flex-col items-center">
          <div className="w-[300px] md:w-[600px]">
            <p className="text-right text-lg md:text-xl font-outfit tracking-wider mr-4">
              APR 11 - APR 13
            </p>
          </div>
          <h1 className="text-5xl md:text-8xl font-outfit font-extralight mb-4 tracking-tighter">
            datathon 2025
          </h1>
          <p className="text-xl md:text-5xl max-w-2xl font-dancing font-light mb-8">
            7 wonders of the world
          </p>
          <a
            href="#apply"
            className="text-white border-2 font-outfit border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all text-lg"
          >
            APPLY
          </a>
        </div>
      </div>
    </div>
  );
}
