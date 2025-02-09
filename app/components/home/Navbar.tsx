"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { config } from "@/app/config";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const screenHeight = window.innerHeight;
      const currentScroll = window.scrollY;

      if (currentScroll < screenHeight * 0.05) {
        setIsVisible(true);
        setScrolled(false);
      } else if (currentScroll + 1 > screenHeight) {
        setIsVisible(true);
        setScrolled(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/10 backdrop-blur-md" : "bg-transparent"
      } ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 transition-all duration-300">
        <div
          className={`text-2xl font-sentient flex items-center gap-2 ${
            scrolled ? "py-3" : "py-8"
          }`}
        >
          <Link href="/">
            <Image
              src="/data-icon.png"
              alt="Data @ UCI Logo"
              width={60}
              height={60}
            />
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-8 font-outfit">
          <a
            href="#about"
            className={`hover:text-gray-600 transition-colors ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            ABOUT
          </a>
          <a
            href="#sponsors"
            className={`hover:text-gray-600 transition-colors ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            SPONSORS
          </a>
          <a
            href="#faq"
            className={`hover:text-gray-600 transition-colors ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            FAQ
          </a>
          <a
            href="#contact"
            className={`hover:text-gray-600 transition-colors ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            CONTACT
          </a>

          {/* Auth Components */}
          <SignedOut>
            {config.isApplicationOpen ? (
              <SignInButton
                mode="modal"
                forceRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
              >
                <button
                  className={`border-2 px-6 py-2 rounded-full transition-all ${
                    scrolled
                      ? "text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white"
                      : "text-white border-white hover:bg-white hover:text-black"
                  }`}
                >
                  APPLY
                </button>
              </SignInButton>
            ) : (
              <button
                className={`border-2 px-6 py-2 rounded-full transition-all opacity-50 cursor-not-allowed ${
                  scrolled
                    ? "text-gray-900 border-gray-900"
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
              <a
                href="/dashboard"
                className={`border-2 px-6 py-2 rounded-full transition-all ${
                  scrolled
                    ? "text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white"
                    : "text-white border-white hover:bg-white hover:text-black"
                }`}
              >
                DASHBOARD
              </a>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
