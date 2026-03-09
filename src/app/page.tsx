"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Youtube, Instagram, Heart, ThumbsUp } from "lucide-react";

interface UpNextItem {
  id: number;
  title: string;
  type: string;
  releaseDate: string | null;
  hasCosplay: boolean;
  details: string | null;
  createdAt: string;
}
function formatDate(dateValue: string | null) {
  if (!dateValue) return null;
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return dateValue;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return dateValue;
  }
}

function ContentCard({ item }: { item: UpNextItem }) {
  const typeEmoji: Record<string, string> = {
    movie: "🎬",
    show: "📺",
    live: "⭐",
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 transition-all hover:border-primary/40 hover:shadow-rose-sm">
      {/* Poster placeholder */}
      <div className="relative aspect-[2/3] bg-gradient-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center gap-3 overflow-hidden">
        <span className="text-5xl opacity-30">{typeEmoji[item.type] ?? "🎞️"}</span>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.releaseDate && (() => {
            const releaseUTC = new Date(item.releaseDate);
            const nowUTC = new Date();
            // Compare dates in UTC to stay consistent with how we format dates
            const isLive = releaseUTC < nowUTC;
            return isLive ? (
              <span className="font-sans font-black text-xl px-2uppercase tracking-tight bg-red-600 text-white px-2 rounded-full shadow-lg">
                Uploaded
              </span>
            ) : (
              <span className="font-sans font-black text-[11px] uppercase tracking-tight bg-primary text-white px-2 py-0.5 rounded-full shadow-lg">
                📅 {formatDate(item.releaseDate)}
              </span>
            );
          })()}
          {item.hasCosplay && (
            <span className="font-sans font-black text-[10px] uppercase tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-lg">COSPLAY</span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2 w-full">
        <span className="font-sans text-[10px] font-black uppercase tracking-widest text-zinc-500">{typeEmoji[item.type]} {item.type}</span>
        <p className="font-heading text-xl text-wrap break-words font-black text-white leading-tight line-clamp-3">{item.title}</p>
        {item.details && (
          <p className="font-sans text-sm text-zinc-400 line-clamp-2 italic border-l-2 border-white/10 pl-2">
            {item.details}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [upNext, setUpNext] = useState<UpNextItem[]>([]);

  useEffect(() => {
    fetch("/api/up-next")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUpNext(d.data);
      })
      .catch(() => { });
  }, []);


  return (
    <div className="min-h-screen bg-onyx">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-32 text-center min-h-[700px]">
        {/* Character Images */}
        <div className="absolute inset-y-0 left-0 z-0 w-1/4 opacity-90 mix-blend-screen hidden lg:block">
          <Image
            src="/blataschajpg.jpg"
            alt="Blatascha"
            fill
            className="object-cover object-left-top grayscale hover:grayscale-0 transition-all duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-onyx via-transparent to-transparent" />
        </div>

        <div className="absolute inset-y-0 right-0 z-0 w-1/4 opacity-90 mix-blend-screen hidden lg:block">
          <Image
            src="/blodney.jpg"
            alt="Blodney"
            fill
            className="object-cover object-right-top grayscale hover:grayscale-0 transition-all duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-onyx via-transparent to-transparent" />
        </div>

        {/* Giant radiant glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
          <div className="h-[40rem] w-[40rem] rounded-full bg-primary/20 blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-2 font-sans text-xs font-black text-primary tracking-widest uppercase animate-pulse">
            New reactions dropping soon 🔥
          </div>

          <h1 className="font-heading mb-6 text-6xl font-black tracking-tighter text-white sm:text-9xl leading-[0.9]">
            Nablascha<br />
            <span className="bg-gradient-to-r from-primary via-rose-500 to-pink-500 bg-clip-text text-transparent">
              blummers
            </span>
          </h1>

          <p className="font-sans mb-10 max-w-2xl mx-auto text-xl font-medium text-zinc-400 sm:text-2xl">
            Vote for what you want me to watch next!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/requests" className="w-full sm:w-auto">
              <Button className="h-16 font-sans w-full sm:w-auto px-10 rounded-2xl bg-primary hover:bg-rose-500 text-white text-xl font-black shadow-rose transition-all hover:scale-105 hover:shadow-rose-lg gap-3">
                <ThumbsUp className="h-6 w-6" /> Vote for Content
              </Button>
            </Link>

            <div className="flex gap-4">
              <a href="#" className="group flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:scale-110 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <Youtube className="h-7 w-7 transition-all group-hover:-translate-y-1" />
                <span className="absolute bottom-2 text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Youtube</span>
              </a>
              <a href="#" className="group flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:scale-110 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <Instagram className="h-7 w-7 transition-all group-hover:-translate-y-1" />
                <span className="absolute bottom-2 text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Instagram</span>
              </a>
              <a href="#" className="group flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:scale-110 hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <Heart className="h-7 w-7 transition-all group-hover:-translate-y-1" />
                <span className="absolute bottom-2 text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Patreon</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Up Next Content */}
      {upNext.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-32 ">
          <div className="mb-14 flex flex-col items-center">
            <h2 className="font-heading text-6xl font-black text-primary leading-none text-center">Up Next</h2>
            <div className="mt-6 h-1 w-24 bg-primary/20 rounded-full" />
          </div>
          <div className="w-full flex justify-center">
            <div className="flex flex-wrap justify-center gap-10 max-w-4xl">
              {upNext.map((item) => (
                <div key={item.id} style={{ width: "176px", flexShrink: 0 }}>
                  <ContentCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {upNext.length === 0 && (
        <section className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-8 text-8xl opacity-20 grayscale">📅</div>
          <p className="font-sans text-2xl font-bold text-zinc-500">
            Up Next schedule appearing soon!
          </p>
          <Link href="/requests" className="mt-8">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 text-lg font-bold">
              Vote for what I should watch Up Next
            </Button>
          </Link>
        </section>
      )}

      {/* youtube embed */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="mb-14 flex flex-col items-center">
          <h2 className="font-heading text-6xl font-black text-primary leading-none text-center">Youtube</h2>
          <div className="mt-6 h-1 w-24 bg-primary/20 rounded-full" />
        </div>
        <div className="w-full flex justify-center">
          <div className="flex flex-wrap justify-center gap-10 max-w-4xl">
            <div style={{ width: "176px", flexShrink: 0 }}>
              Your Youtube videos will display here
              {/* embed iframe here */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
