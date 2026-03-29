"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Flame, ShoppingBag, Send, Quote, Sparkles, TrendingDown, Coffee } from "lucide-react";

const CHATS = [
  {
    title: "Life Advice from a Guy Who’s Literally Hollow Inside",
    content: "If your ex texts you 'u up?', remember: even I, a metal pipe, have more spine than that. Stay rigid, my friends. Don't let your structure collapse for a midnight check-in from someone who treats you like a temporary scaffold.",
    tag: "Advice",
    date: "2 hours ago"
  },
  {
    title: "Blodney’s Blunt Reacts: This Week’s Wildest Expert Quotes",
    content: "Expert: 'You need to find your center.' \nBlodney: 'I'm a hollow rod. My center is literally air. And yet, I'm still more grounded than this take.'",
    tag: "Reacts",
    date: "1 day ago"
  },
  {
    title: "Gossip by the Glow",
    content: "I overheard two microphones arguing in the studio again. One claimed it had better 'high-end response,' while the other just gave it the silent treatment. Honestly, the tension was so thick you could weld it.",
    tag: "Gossip",
    date: "3 days ago"
  },
  {
    title: "Costume of the Week + Deep Thoughts",
    content: "They put me in a tiny wizard hat today. I feel magical, but also significantly more aerodynamic. If wisdom comes from pointy hats, then call me Gandalf the Grey... Pipe. Deep thought: Is a wizard's staff just a very ambitious pipe?",
    tag: "Reflections",
    date: "5 days ago"
  }
];

const QUOTES = [
  "No joints, all opinions.",
  "I'm just a hollow rod trying to hold it together.",
  "Steel yourself. Literally.",
  "Hollow inside, but solid on the outside.",
  "Don't get bent out of shape.",
  "Pipe down and listen."
];

export default function FiresidePage() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to ask Blodney a question.");
      return;
    }
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: question.trim(),
          type: "other",
          tag: "blodney"
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Your question has been sent to the fire! 🔥");
        setQuestion("");
      } else {
        toast.error(data.message || "Failed to submit question");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 pb-20">
      {/* ── Hero Section ── */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative h-full w-full md:w-[40%] overflow-hidden">
          <Image
            src="/blodneyFire.jpg"
            alt="Blodney by the Fire"
            fill
            className="object-cover opacity-70 transition-transform duration-700 hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#1a1a1a]/40" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
          <Badge className="mb-4 bg-orange-600/20 text-orange-400 border-orange-500/30 font-bold px-4 py-1.5 text-sm uppercase tracking-widest backdrop-blur-md">
            <Flame className="w-4 h-4 mr-2 animate-pulse" /> Live from the Studio
          </Badge>
          <h1 className="font-heading text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
            Blodney&apos;s <br />
            <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Fireside Chat
            </span>
          </h1>
          <p className="font-sans mt-6 max-w-2xl text-xl text-zinc-300 font-medium leading-relaxed drop-shadow-lg">
            Dry wit, metal puns, and savage roasts. Pull up a chair, grab a metaphorical drink, and let the hollow rod drop some knowledge.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── Main Content Feed (The Chats) ── */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <MessageSquare className="text-primary w-6 h-6" />
            <h2 className="font-heading text-3xl font-bold tracking-tight">The Weekly Drops</h2>
          </div>

          <div className="space-y-8">
            {CHATS.map((chat, i) => (
              <article key={chat.title} className="group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.04] hover:border-primary/20 hover:shadow-[0_20px_50px_-15px_rgba(251,63,96,0.15)]">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="bg-zinc-900/50 text-zinc-400 border-white/10 font-medium">
                    {chat.tag}
                  </Badge>
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{chat.date}</span>
                </div>
                <h3 className="font-heading text-3xl font-black text-white group-hover:text-primary transition-colors leading-tight">
                  {chat.title}
                </h3>
                <div className="font-sans mt-4 text-lg text-zinc-400 leading-relaxed whitespace-pre-line">
                  {chat.content}
                </div>

                <div className="mt-8 flex items-center gap-4 border-t border-white/5 pt-6">
                  <button className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors">
                    <TrendingDown className="w-4 h-4 rotate-180" /> 1.2k Reactions
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors ml-auto">
                    Share Chat
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* ── Blodney's Roast Section ── */}
          <section className="mt-20 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-rose-950/20 to-transparent border border-primary/20 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <TrendingDown className="w-40 h-40 -rotate-12" />
            </div>

            <div className="relative z-10 text-center flex flex-col items-center">
              <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-4 py-1">
                Savage Content Alert
              </Badge>
              <h2 className="font-heading text-5xl font-black text-white mb-6">Blodney&apos;s Roast</h2>
              <p className="font-sans text-xl text-zinc-300 max-w-xl mb-10 leading-relaxed">
                Where I dismantle bad movies, low-quality scenes, and questionable life choices. No script is too weak for my titanium-grade critique.
              </p>

              <div className="w-full bg-onyx/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left mb-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-lg">🎬</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">Current Target: &quot;The CGI Waterfall Incident&quot;</h4>
                    <p className="text-sm text-zinc-500">Video: Reaction Hub #42</p>
                  </div>
                </div>
                <Quote className="text-primary w-8 h-8 mb-4 opacity-50" />
                <p className="font-sans text-lg italic text-zinc-300 leading-relaxed">
                  &quot;I&apos;ve seen better water physics in a bowl of dry cereal. That lighting isn&apos;t just flat; it&apos;s subterranean. If I had eyes, they&apos;d be bleeding. Since I don&apos;t, my structural integrity is just slowly degrading in protest.&quot;
                </p>
              </div>

              <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-rose-500 text-white font-black text-lg transition-all hover:scale-105 shadow-rose">
                Browse All Roasts
              </Button>
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Key Sayings Wall */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 overflow-hidden relative">
            <h3 className="font-heading text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Quote className="text-primary w-5 h-5" /> Sayings Wall
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {QUOTES.map((quote, i) => (
                <div key={i} className="p-4 rounded-xl bg-onyx/50 border border-white/5 text-sm font-medium text-zinc-300 hover:border-primary/30 transition-all hover:-rotate-1 cursor-default">
                  &ldquo;{quote}&rdquo;
                </div>
              ))}
            </div>
          </section>

          {/* Merch Spotlight */}
          <section className="rounded-3xl bg-gradient-to-t from-primary/20 to-rose-600/5 border border-primary/20 p-8 text-center group">
            <ShoppingBag className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-heading text-2xl font-black text-white mb-2">Blodney Gear</h3>
            <p className="font-sans text-sm text-zinc-400 mb-6 font-medium">
              &quot;Blodney-approved hoodies, mugs, and limited-edition &apos;I&apos;m With the Rod&apos; tees.&quot;
            </p>
            <Link href="/merch">
              <Button variant="outline" className="w-full h-12 rounded-xl border-primary/50 text-white hover:bg-primary transition-all font-bold">
                Visit Merch Shop
              </Button>
            </Link>
          </section>

          {/* Community Fire */}
          <section className="rounded-3xl border border-white/10 bg-[#121212] p-8">
            <h3 className="font-heading text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Coffee className="text-orange-500 w-5 h-5" /> Community Fire
            </h3>
            <div className="space-y-6">
              {[
                { name: "PipeFan99", text: "That pun about structural integrity killed me.", time: "10m ago" },
                { name: "MetalHead", text: "When is the next roast dropping? I need a good laugh.", time: "45m ago" }
              ].map((comment, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-zinc-300">{comment.name}</span>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase">{comment.time}</span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-snug">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* ── Ask Blodney Anything Footer ── */}
      <section className="mt-12 bg-onyx/30 backdrop-blur-3xl border-y border-white/5 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-6 animate-pulse" />
          <h2 className="font-heading text-5xl font-black text-white mb-4">Ask Blodney Anything</h2>
          <p className="font-sans text-xl text-zinc-400 mb-10 font-medium">
            Have a question? Need advice from a hollow rod? <br /> Submit it here and I might answer it in a full post.
          </p>

          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <Textarea
              placeholder={user ? "Type your question here..." : "Sign in to ask a question!"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!user || isSubmitting}
              className="min-h-[150px] bg-onyx/50 border-white/10 rounded-2xl p-6 text-lg focus:ring-primary/20 focus:border-primary transition-all placeholder:text-zinc-600"
            />
            <Button
              type="submit"
              disabled={!user || isSubmitting || !question.trim()}
              className="h-16 px-12 rounded-2xl bg-primary hover:bg-rose-500 text-white text-xl font-black transition-all hover:scale-105 shadow-rose w-full md:w-auto"
            >
              {isSubmitting ? "Sending..." : "Submit to the Fire"}
              <Send className="ml-3 w-5 h-5" />
            </Button>
            {!user && (
              <p className="text-sm text-zinc-500 mt-4">
                You must be <Link href="/auth/signin" className="text-primary hover:underline font-bold">Signed In</Link> to interact with Blodney.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
