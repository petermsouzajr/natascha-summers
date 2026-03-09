"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, Search, Plus, Minus, Film, Tv, Star, Loader2 } from "lucide-react";
import Link from "next/link";

type ContentType = "movie" | "show" | "other";

interface LeaderboardItem {
  id: number;
  title: string;
  type: string;
  posterUrl: string | null;
  netVotes: number;
  upvotes: number;
  downvotes: number;
}


function VoteRow({
  item,
  onVote,
  isLoggedIn
}: {
  item: LeaderboardItem;
  onVote: (id: number, type: "up" | "down") => void;
  isLoggedIn: boolean;
}) {
  const loginMessage = !isLoggedIn && (
    <div className="absolute top-9 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap rounded-xl bg-onyx/95 border border-white/10 px-4 py-2 text-sm font-black text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:top-7 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] z-30 backdrop-blur-md">
      Sign in to vote ✨
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 border-b border-r border-white/10 bg-onyx/95" />
    </div>
  );
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl p-4 transition-all duration-300 hover:bg-white/5">
      {/* Downvote Unit */}
      <div className="flex flex-col items-center gap-2 min-w-[80px] group relative">
        {loginMessage}
        <span className="font-sans text-[10px] font-black uppercase tracking-widest text-zinc-500">Downvote</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onVote(item.id, "down")}
          className="h-11 w-11 rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-rose shrink-0"
          title={isLoggedIn ? "Downvote – £1" : ""}
        >
          <ThumbsDown className="h-5 w-5" />
        </Button>

      </div>

      {/* Centered Movie Info Group */}
      <div className="flex flex-1 items-center justify-center gap-4 sm:gap-10 min-w-0">
        {/* Poster */}
        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-onyx border border-white/10 shadow-lg">
          {item.posterUrl ? (
            <Image src={item.posterUrl} alt={item.title} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="flex h-full items-center justify-center">
              {item.type === "movie" ? (
                <Film className="h-6 w-6 text-zinc-700" />
              ) : item.type === "show" ? (
                <Tv className="h-6 w-6 text-zinc-700" />
              ) : (
                <Star className="h-6 w-6 text-zinc-700" />
              )}
            </div>
          )}
        </div>

        {/* Title & Stats */}
        <div className="flex flex-col items-center text-center max-w-[180px] sm:max-w-xs">
          <p className="font-sans truncate text-2xl font-black text-white leading-tight w-full">{item.title}</p>
          <div className="font-sans text-lg font-medium text-white/90 mt-1.5 flex items-center gap-4">
            <span className="flex items-center gap-1.5"><ThumbsDown className="h-3.5 w-3.5 text-rose-500/90" /> {item.downvotes}</span>
            <span className="h-1 w-1 rounded-full bg-white/10" />
            <span className="flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5 text-emerald-500/90" /> {item.upvotes}</span>
          </div>
        </div>

        {/* Net Score */}
        {/* <div className={`font-heading shrink-0 w-16 text-center text-3xl font-black ${item.netVotes > 0 ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]" : item.netVotes < 0 ? "text-primary drop-shadow-[0_0_12px_rgba(251,63,96,0.4)]" : "text-zinc-600"}`}>
          {item.netVotes > 0 ? "+" : ""}{item.netVotes}
        </div> */}
      </div>

      {/* Upvote Unit */}
      <div className="flex flex-col items-center gap-2 min-w-[80px] group relative">
        {loginMessage}
        <span className="font-sans text-[10px] font-black uppercase tracking-widest text-zinc-500">Upvote</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onVote(item.id, "up")}
          className="h-11 w-11 rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all duration-300 hover:scale-110 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
          title={isLoggedIn ? "Upvote – £1" : ""}
        >
          <ThumbsUp className="h-5 w-5" />
        </Button>


      </div>
    </div>
  );
}

function RequestsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const initialTab = (searchParams.get("tab") as ContentType) ?? "movie";
  const [activeTab, setActiveTab] = useState<ContentType>(initialTab);
  const [search, setSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  const [suggestMessage, setSuggestMessage] = useState("");
  const [votingId, setVotingId] = useState<number | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [voteDialogItem, setVoteDialogItem] = useState<{ id: number; title: string; type: "up" | "down" } | null>(null);
  const [voteCount, setVoteCount] = useState(1);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  const fetchLeaderboard = useCallback(async (type: ContentType) => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${type}`);
      const data = await res.json();
      if (data.success) setLeaderboard(data.data);
    } catch {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  useEffect(() => {
    // Legacy checkout params can be removed later, but for now we'll just keep the empty effect
  }, [searchParams, activeTab, fetchLeaderboard, router]);

  const handleTabChange = (val: string) => {
    setActiveTab(val as ContentType);
    setSearch("");
    router.replace(`/requests?tab=${val}`);
  };

  const handleVote = (contentId: number, voteType: "up" | "down") => {
    if (!user) {
      toast.error("Please sign in to vote.", {
        action: { label: "Sign In", onClick: () => router.push("/auth/signin") },
      });
      return;
    }

    const item = leaderboard.find(i => i.id === contentId);
    if (item) {
      setVoteDialogItem({ id: contentId, title: item.title, type: voteType });
      setVoteCount(1);
    }
  };

  const confirmVote = () => {
    if (!voteDialogItem) return;
    setShowCheckoutDialog(true);
  };

  const handleFinalSubmit = async () => {
    if (!voteDialogItem) return;

    const { id: contentId, type: voteType } = voteDialogItem;
    setShowCheckoutDialog(false);
    setVoteDialogItem(null);
    setVotingId(contentId);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, voteType, count: voteCount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Thank you for your votes! ✨");
        fetchLeaderboard(activeTab);
      } else {
        toast.error(data.message ?? "Failed to cast vote");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setVotingId(null);
    }
  };

  const handleSuggest = async () => {
    if (!user) {
      toast.error("Please sign in to suggest content.", {
        action: { label: "Sign In", onClick: () => router.push("/auth/signin") },
      });
      return;
    }

    if (!search.trim()) return;
    setSuggesting(true);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: search.trim(), type: activeTab, firstname: honeypot }),
      });
      const data = await res.json();
      setSuggestMessage(data.message);
      setShowSuggestDialog(true);
      if (data.success) {
        setSearch("");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSuggesting(false);
    }
  };

  const filtered = leaderboard.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const tabLabel = activeTab === "movie" ? "Movies" : activeTab === "show" ? "TV Shows" : "Other";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* ── Page Header ── */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-sans">Community voting is LIVE 🔥</span>
        </div>
        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-white md:text-7xl">
          What should{" "}
          <span className="bg-gradient-to-r from-primary via-rose-500 to-pink-500 bg-clip-text text-transparent">
            Nablascha
          </span>{" "}
          watch next?
        </h1>
        <p className="font-sans mt-4 text-xl text-zinc-400">
          Cast your vote 🗳️ — the top picks get reacted to first. <br /> It's FREE to add to the watchlist, but it costs{" "}
          <span className="font-bold text-primary">£1/$1</span> to vote (multiple votes allowed)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center mb-12">
          {/* Master Outline Container */}
          <div className="p-2 rounded-[4rem] flex items-center shadow-2xl">
            <TabsList className="h-auto gap-4 bg-onyx/90 backdrop-blur-2xl p-2 rounded-[3.5rem]">
              <TabsTrigger
                value="movie"
                className="font-sans flex items-center gap-3 rounded-[3rem] px-10 py-5 text-xl font-black text-zinc-500 transition-all duration-300 hover:text-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-rose-lg data-[state=active]:border-4 data-[state=active]:border-white data-[state=active]:scale-105"
              >
                <Film className="h-7 w-7" /> Movies
              </TabsTrigger>
              <TabsTrigger
                value="show"
                className="font-sans flex items-center gap-3 rounded-[3rem] px-10 py-5 text-xl font-black text-zinc-500 transition-all duration-300 hover:text-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-rose-lg data-[state=active]:border-4 data-[state=active]:border-white data-[state=active]:scale-105"
              >
                <Tv className="h-7 w-7" /> TV Shows
              </TabsTrigger>
              <TabsTrigger
                value="other"
                className="font-sans flex items-center gap-3 rounded-[3rem] px-10 py-5 text-xl font-black text-zinc-500 transition-all duration-300 hover:text-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-rose-lg data-[state=active]:border-4 data-[state=active]:border-white data-[state=active]:scale-105"
              >
                <Star className="h-7 w-7" /> Other
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {(["movie", "show", "other"] as ContentType[]).map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            {/* Search & Suggest */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                {/* Honeypot */}
                <input
                  type="text"
                  className="hidden"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  placeholder={user ? `Search ${tabLabel.toLowerCase()} or suggest new...` : "Sign In to suggest! 🔓"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={!user}
                  className={`font-sans h-14 pl-12 rounded-2xl bg-onyx border-white/10 text-lg text-zinc-100 focus:border-primary focus:ring-primary/20 ${!user ? "placeholder:text-zinc-300 cursor-not-allowed opacity-80" : "placeholder:text-zinc-500"
                    }`}
                  onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
                />
              </div>
              <Button
                onClick={handleSuggest}
                disabled={!user || !search.trim() || suggesting}
                className="font-sans h-14 px-8 rounded-2xl bg-primary hover:bg-rose-500 text-white text-lg font-black shrink-0 shadow-rose transition-all hover:scale-105 hover:shadow-rose-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggesting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
                <span className="ml-2">Suggest</span>
              </Button>
            </div>

            <div className="mb-3 flex items-center justify-between font-sans">
              <span className="text-lg font-medium text-zinc-400">
                🎬 <span className="text-white font-bold">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "title" : "titles"} in the running
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-lg font-semibold text-rose-400">
                £1/$1 per vote 💸
              </span>
            </div>

            <Separator className="mb-4 bg-zinc-800" />

            {loadingLeaderboard ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-6xl">
                  {activeTab === "movie" ? "🎬" : activeTab === "show" ? "📺" : "⭐"}
                </div>
                <p className="mb-1 text-xl font-bold text-white">
                  Nothing here yet!
                </p>
                <p className="mb-6 text-zinc-400">
                  {search
                    ? `No results for "${search}" — want to suggest it?`
                    : `Be the first to suggest a ${tabLabel.toLowerCase()} for Nablascha to react to!`}
                </p>
                {!user && (
                  <Link href="/auth/signin" className="mt-2">
                    <Button className="h-12 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-base font-bold shadow-[0_0_12px_rgba(225,29,72,0.35)] transition-all hover:shadow-[0_0_20px_rgba(225,29,72,0.55)]">
                      ✨ Sign in to suggest
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-1 pr-4">
                  {filtered.map((item, i) => (
                    <div key={item.id}>
                      {votingId === item.id ? (
                        <div className="flex items-center justify-center py-3">
                          <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
                        </div>
                      ) : (
                        <VoteRow item={item} onVote={handleVote} isLoggedIn={!!user} />
                      )}
                      {i < filtered.length - 1 && <Separator className="bg-zinc-800/50" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Suggest Dialog */}
      <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
        <DialogContent className="bg-onyx border-white/10 rounded-3xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Plus className="h-8 w-8" />
            </div>
            <DialogTitle className="font-heading text-3xl font-black text-white">Suggestion Submitted</DialogTitle>
            <DialogDescription className="font-sans text-base text-zinc-400 mt-2">
              {suggestMessage || "Your request has been sent to our admin team. If approved, it will appear on the leaderboard shortly!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowSuggestDialog(false)}
              className="font-sans h-12 px-10 rounded-xl bg-primary hover:bg-rose-600 text-white font-bold shadow-rose transition-all hover:scale-105"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vote Multiplier Dialog */}
      <Dialog open={!!voteDialogItem} onOpenChange={(open) => !open && setVoteDialogItem(null)}>
        <DialogContent className="bg-onyx border-white/10 sm:max-w-md rounded-3xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border ${voteDialogItem?.type === "up" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-primary/30 bg-primary/10 text-primary"}`}>
              {voteDialogItem?.type === "up" ? <ThumbsUp className="h-8 w-8" /> : <ThumbsDown className="h-8 w-8" />}
            </div>
            <DialogTitle className="font-heading text-3xl font-black text-white">
              Cast Your {voteDialogItem?.type === "up" ? "Up" : "Down"}vote
            </DialogTitle>
            <DialogDescription className="font-sans text-base text-zinc-400 mt-2">
              How many {voteDialogItem?.type}votes for <span className="text-white font-bold">"{voteDialogItem?.title}"</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setVoteCount(Math.max(1, voteCount - 1))}
                className="h-12 w-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <Minus className="h-6 w-6" />
              </Button>

              <div className="w-24 text-center">
                <span className="font-heading text-5xl font-black text-white">{voteCount}</span>
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Votes</p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setVoteCount(Math.min(100, voteCount + 1))}
                className="h-12 w-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 px-4">
              {[5, 10, 25, 50].map((n) => (
                <Button
                  key={n}
                  variant="ghost"
                  size="sm"
                  onClick={() => setVoteCount(n)}
                  className={`font-sans rounded-xl px-5 py-2 text-sm font-black transition-all ${voteCount === n
                    ? (voteDialogItem?.type === "up" ? "bg-emerald-500 text-white shadow-emerald-lg" : "bg-primary text-white shadow-rose-lg")
                    : "bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10"}`}
                >
                  +{n}
                </Button>
              ))}
            </div>

            {/* Total Summary Badge */}
            <div className={`mt-2 flex flex-col items-center justify-center rounded-2xl border px-8 py-3 transition-all duration-300 ${voteDialogItem?.type === "up" ? "border-emerald-500/20 bg-emerald-500/5" : "border-primary/20 bg-primary/5"}`}>
              <p className="font-sans text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Contribution</p>
              <div className="flex items-center gap-2">
                <span className={`font-heading text-3xl font-black ${voteDialogItem?.type === "up" ? "text-emerald-400" : "text-primary"}`}>
                  £/$ {voteCount}
                </span>
                <span className="text-xl">💸</span>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={confirmVote}
              className={`font-sans h-14 w-full rounded-2xl text-lg font-black transition-all hover:scale-[1.02] shadow-xl ${voteDialogItem?.type === "up" ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary hover:bg-rose-500 text-white shadow-rose-500/20"}`}
            >
              Confirm {voteCount} Vote{voteCount > 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mock Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-onyx border-white/10 rounded-3xl sm:max-w-md">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0070ba]/10 text-[#0070ba]">
              <Image src="/paypal-icon.png" alt="PayPal" width={32} height={32} className="opacity-80" />
            </div>
            <DialogTitle className="font-heading text-3xl font-black text-white italic">
              PayPal <span className="text-[#0070ba] not-italic">Checkout</span>
            </DialogTitle>
            <DialogDescription className="font-sans text-base text-zinc-400 mt-2">
              This would normally be the PayPal checkout screen.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400 text-sm">Amount due:</span>
                <span className="text-white font-bold">£/$ {voteCount}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Description:</span>
                <span className="text-white font-medium text-right truncate ml-4">{voteCount} {voteDialogItem?.type}votes for {voteDialogItem?.title}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 sm:flex-col sm:justify-center">
            <Button
              onClick={handleFinalSubmit}
              className="font-sans h-12 w-full rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white font-black transition-all hover:scale-[1.02] shadow-lg shadow-[#0070ba]/20"
            >
              Complete Purchase
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCheckoutDialog(false)}
              className="font-sans h-12 w-full rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 font-bold"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense>
      <RequestsContent />
    </Suspense>
  );
}
