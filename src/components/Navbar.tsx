"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Youtube, Heart, LogOut, User, Shield } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-rose-500 transition-all hover:text-rose-400 hover:drop-shadow-[0_0_8px_rgba(251,63,96,0.7)]"
        >
          Natascha Summers
        </Link>

        {/* Nav links + actions */}
        <div className="flex items-center gap-2">
          {/* Page nav pills */}
          <Link href="/requests">
            <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-rose-500/70 hover:bg-zinc-800 hover:text-white hover:shadow-[0_0_10px_rgba(225,29,72,0.3)] cursor-pointer">
              🎬 Requests
            </span>
          </Link>

          <Link href="/merch">
            <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-rose-500/70 hover:bg-zinc-800 hover:text-white hover:shadow-[0_0_10px_rgba(225,29,72,0.3)] cursor-pointer">
              🛍️ Merch
            </span>
          </Link>

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-zinc-700" />

          {/* Social icons */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            title="YouTube"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-200 hover:border-red-500/70 hover:bg-red-950/40 hover:text-red-500 hover:shadow-[0_0_10px_rgba(239,68,68,0.35)]"
          >
            <Youtube className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-200 hover:border-pink-500/70 hover:bg-pink-950/40 hover:text-pink-400 hover:shadow-[0_0_10px_rgba(236,72,153,0.35)]"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://patreon.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Patreon"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-200 hover:border-orange-500/70 hover:bg-orange-950/40 hover:text-orange-400 hover:shadow-[0_0_10px_rgba(249,115,22,0.35)]"
          >
            <Heart className="h-5 w-5" />
          </a>

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-zinc-700" />

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "admin" && (
                <Link href="/admin">
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-800 bg-rose-950/50 px-4 py-2 text-sm font-semibold text-rose-400 transition-all hover:bg-rose-900/50 hover:text-rose-300 cursor-pointer">
                    <Shield className="h-4 w-4" /> Admin
                  </span>
                </Link>
              )}
              <span className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
                <User className="h-4 w-4 text-rose-400" />
                {user.email.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin">
                <span className="inline-flex items-center rounded-full border border-zinc-600 bg-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer">
                  Sign In
                </span>
              </Link>
              <Link href="/auth/signup">
                <span className="inline-flex items-center rounded-full bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-[0_0_12px_rgba(225,29,72,0.4)] transition-all duration-200 hover:bg-rose-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.65)] cursor-pointer">
                  Sign Up ✨
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
