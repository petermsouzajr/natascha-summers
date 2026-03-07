"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, Instagram, Heart, Play, ThumbsUp } from "lucide-react";

interface RecentItem {
  id: number;
  title: string;
  type: string;
  youtubeLink: string | null;
  posterUrl: string | null;
  createdAt: string;
}

function ContentCard({ item }: { item: RecentItem }) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 transition-all hover:border-zinc-600 hover:scale-105">
      <div className="relative aspect-[2/3] bg-zinc-800">
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play className="h-12 w-12 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {item.youtubeLink && (
          <a
            href={item.youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="rounded-full bg-red-600 p-3 hover:bg-red-700 transition-colors">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </a>
        )}
      </div>
      <div className="p-3">
        <Badge
          variant="outline"
          className="mb-1 text-xs capitalize border-zinc-700 text-zinc-400"
        >
          {item.type}
        </Badge>
        <p className="text-sm font-medium text-zinc-100 line-clamp-2">{item.title}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    fetch("/api/recent")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRecent(d.data);
      })
      .catch(() => { });
  }, []);

  const movies = recent.filter((r) => r.type === "movie");
  const shows = recent.filter((r) => r.type === "show");
  const lives = recent.filter((r) => r.type === "live");

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(159,18,57,0.15) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-2xl">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Nablascha{" "}
            <span className="text-rose-500">blummers</span>
          </h1>
          <p className="mb-8 text-lg text-zinc-400">
            Reaction streamer &amp; content creator. Vote for what you want me to watch next!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Youtube className="h-4 w-4" /> YouTube
              </Button>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-pink-700 text-pink-400 hover:bg-pink-950 gap-2">
                <Instagram className="h-4 w-4" /> Instagram
              </Button>
            </a>
            <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-orange-700 text-orange-400 hover:bg-orange-950 gap-2">
                <Heart className="h-4 w-4" /> Patreon
              </Button>
            </a>
            <Link href="/requests">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                <ThumbsUp className="h-4 w-4" /> Vote for Content
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Content */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          {movies.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-4 text-xl font-bold text-zinc-100">Recent Movie Reactions</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {movies.map((item) => <ContentCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
          {shows.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-4 text-xl font-bold text-zinc-100">Recent Show Reactions</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {shows.map((item) => <ContentCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
          {lives.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-4 text-xl font-bold text-zinc-100">Recent Live Streams</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {lives.map((item) => <ContentCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
        </section>
      )}

      {recent.length === 0 && (
        <section className="flex flex-col items-center justify-center py-24 text-zinc-500">
          <Play className="mb-4 h-16 w-16 opacity-30" />
          <p className="text-lg">Recent reactions will appear here soon!</p>
          <Link href="/requests" className="mt-4">
            <Button variant="outline" className="border-rose-800 text-rose-400 hover:bg-rose-950">
              Vote for what to react to next
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
