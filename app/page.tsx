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
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { config } from "@/app/config";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Landing />
      <Navbar />

      {/* Floating Apply Button - positioned to float over all content */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <SignedOut>
          {config.isApplicationOpen ? (
            <SignInButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              signUpForceRedirectUrl="/dashboard"
            >
              <button
                className={`border-2 px-6 py-2 rounded-full transition-all shadow-lg ${
                  scrolled
                    ? "text-gray-900 border-gray-900 bg-white/80 hover:bg-gray-900 hover:text-white"
                    : "text-white border-white hover:bg-white hover:text-black"
                }`}
              >
                APPLY
              </button>
            </SignInButton>
          ) : (
            <button
              className={`border-2 px-6 py-2 rounded-full transition-all opacity-50 cursor-not-allowed shadow-lg ${
                scrolled
                  ? "text-gray-900 border-gray-900 bg-white/80"
                  : "text-white border-white"
              }`}
              disabled
            >
              COMING SOON
            </button>
          )}
        </SignedOut>

        <SignedIn>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`border-2 px-6 py-2 rounded-full transition-all shadow-lg ${
                scrolled
                  ? "text-gray-900 border-gray-900 bg-white/80 hover:bg-gray-900 hover:text-white"
                  : "text-white border-white hover:bg-white hover:text-black"
              }`}
            >
              DASHBOARD
            </Link>
          </div>
        </SignedIn>
      </div>

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
