"use client";

import { useState, useEffect } from "react";
import { Blob } from "../ui/Blob";
import Navbar from "./Navbar";
import { config } from "@/app/config";
import { SignInButton } from "@clerk/nextjs";

const WONDERS = [
  {
    video: "colosseum.mp4",
  },
  {
    video: "wall.mp4",
  },
  {
    video: "tajmahal.mp4", // Temporary
  },
  {
    video: "christ.mp4", // Temporary
  },
  {
    video: "machu.mp4", // Temporary
  },
  {
    video: "chichen.mp4", // Temporary
  },
  {
    video: "pyramids.mp4", // Temporary
  },
];

export default function Landing() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * WONDERS.length));

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleVideoEnd = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % WONDERS.length);
  };

  const currentWonder = WONDERS[currentIndex];

  // Calculate the gradient position based on scroll
  const gradientPosition = Math.min(100, (scrollY / 500) * 50);
  const maskImage =
    scrollY === 0
      ? "linear-gradient(to right, black, black)" // Fully visible when not scrolled
      : `linear-gradient(to right, 
      transparent ${gradientPosition}%, 
      rgba(0, 0, 0, 0.5) ${gradientPosition + 25}%, 
      black ${gradientPosition + 50}%
    )`;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-auto">
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

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <Blob className="bg-indigo-300/30 top-[10%] -left-[10%] w-[500px] h-[500px] animate-delay-2000" />
        <Blob className="bg-blue-300/30 top-[20%] -right-[15%] w-[600px] h-[600px] animate-delay-3000" />
        <Blob className="bg-purple-300/30 bottom-[20%] left-1/4 w-[400px] h-[400px] animate-delay-4000" />
        <Blob className="bg-sky-300/30 bottom-1/2 right-[5%] w-[450px] h-[450px] animate-delay-5000" />
      </div>

      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4"
        style={{
          transform: `translateY(${-scrollY * 0.5}px)`,
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="w-[300px] md:w-[600px]">
            <p className="text-right text-lg md:text-xl font-outfit tracking-wider mr-4">
              APR 11 - APR 13
            </p>
          </div>
          <h1 className="text-5xl md:text-8xl font-outfit font-light mb-4 tracking-tight">
            Soar into Data
          </h1>
          <p className="text-xl md:text-5xl max-w-2xl font-dancing font-light mb-8">
            7 wonders of the world
          </p>
          {config.isApplicationOpen ? (
            <SignInButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              signUpForceRedirectUrl="/dashboard"
            >
              <a className="text-white border-2 font-outfit border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all text-lg cursor-pointer">
                APPLY
              </a>
            </SignInButton>
          ) : (
            <div className="space-y-2">
              <p className="text-xl font-outfit">
                Applications open {config.applicationOpenDate}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
