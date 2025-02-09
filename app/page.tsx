"use client";

import { useEffect, useState } from "react";
import {
  Landing,
  About,
  Stats,
  Sponsors,
  FAQ,
  Contact,
} from "./components/home";
import Navbar from "./components/home/Navbar";
import { Blob, Corner, Divider, FloatingLine } from "./components/ui";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Landing />
      <Navbar />
      <main className="relative">
        <div className="h-screen pointer-events-none" />{" "}
        {/* Spacer for first viewport */}
        <div
          className="relative min-h-[200vh] bg-gradient-to-b from-transparent via-white to-white"
          style={{
            transform: `translateY(${Math.min(scrollY * 0.1, 100)}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Decorative Corners */}
          <Corner className="top-0 left-0" />
          <Corner className="top-0 right-0 rotate-90" />
          <Corner className="bottom-0 left-0 -rotate-90" />
          <Corner className="bottom-0 right-0 rotate-180" />

          {/* Floating Lines */}
          <FloatingLine className="top-[10%] left-[10%]" />
          <FloatingLine className="top-[30%] right-[20%]" />
          <FloatingLine className="bottom-[20%] left-[30%]" />
          <FloatingLine className="bottom-[40%] right-[15%]" />

          {/* Animated Background Blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <Blob className="bg-indigo-300/20 top-[10%] -left-[10%] w-[500px] h-[500px] animate-delay-2000" />
            <Blob className="bg-blue-300/20 top-[20%] -right-[15%] w-[600px] h-[600px] animate-delay-3000" />
            <Blob className="bg-purple-300/20 bottom-[20%] left-1/4 w-[400px] h-[400px] animate-delay-4000" />
            <Blob className="bg-sky-300/20 bottom-1/2 right-[5%] w-[450px] h-[450px] animate-delay-5000" />
          </div>

          <div className="relative z-10">
            <About />
            <Divider />
            <Stats />
            <Divider />
            <Sponsors />
            <Divider />
            <FAQ />
            <Divider />
            <Contact />
          </div>
        </div>
      </main>
    </>
  );
}
