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
import { ThumbsUp, ThumbsDown, Search, Plus, Film, Tv, Star, Loader2 } from "lucide-react";
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

function VoteRow({ item, onVote }: { item: LeaderboardItem; onVote: (id: number, type: "up" | "down") => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-zinc-800/50 transition-colors">
      {/* Downvote */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVote(item.id, "down")}
        className="h-9 w-9 rounded-full border border-zinc-700 text-zinc-400 hover:border-rose-700 hover:text-rose-400 hover:bg-rose-950/30 shrink-0"
        title="Downvote – £1"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>

      {/* Poster */}
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-zinc-800">
        {item.posterUrl ? (
          <Image src={item.posterUrl} alt={item.title} fill className="object-cover" sizes="40px" />
        ) : (
          <div className="flex h-full items-center justify-center">
            {item.type === "movie" ? (
              <Film className="h-4 w-4 text-zinc-600" />
            ) : item.type === "show" ? (
              <Tv className="h-4 w-4 text-zinc-600" />
            ) : (
              <Star className="h-4 w-4 text-zinc-600" />
            )}
          </div>
        )}
      </div>

      {/* Title & votes */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-zinc-100">{item.title}</p>
        <p className="text-xs text-zinc-500">
          {item.upvotes} up · {item.downvotes} down
        </p>
      </div>

      {/* Net votes */}
      <div className={`shrink-0 w-12 text-center font-bold text-lg ${item.netVotes > 0 ? "text-green-400" : item.netVotes < 0 ? "text-rose-400" : "text-zinc-400"}`}>
        {item.netVotes > 0 ? "+" : ""}{item.netVotes}
      </div>

      {/* Upvote */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVote(item.id, "up")}
        className="h-9 w-9 rounded-full border border-zinc-700 text-zinc-400 hover:border-green-700 hover:text-green-400 hover:bg-green-950/30 shrink-0"
        title="Upvote – £1"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
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
  const [suggestTitle, setSuggestTitle] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  const [suggestMessage, setSuggestMessage] = useState("");
  const [votingId, setVotingId] = useState<number | null>(null);

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
    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");
    if (success) {
      toast.success("Vote recorded! Thank you for your support.");
      fetchLeaderboard(activeTab);
      router.replace(`/requests?tab=${activeTab}`);
    } else if (cancelled) {
      toast.info("Payment cancelled – your vote was not recorded.");
      router.replace(`/requests?tab=${activeTab}`);
    }
  }, [searchParams, activeTab, fetchLeaderboard, router]);

  const handleTabChange = (val: string) => {
    setActiveTab(val as ContentType);
    setSearch("");
    router.replace(`/requests?tab=${val}`);
  };

  const handleVote = async (contentId: number, voteType: "up" | "down") => {
    if (!user) {
      toast.error("Please sign in to vote.", {
        action: { label: "Sign In", onClick: () => router.push("/auth/signin") },
      });
      return;
    }

    setVotingId(contentId);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, voteType }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message ?? "Failed to initiate payment");
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

    if (!suggestTitle.trim()) return;
    setSuggesting(true);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: suggestTitle.trim(), type: activeTab }),
      });
      const data = await res.json();
      setSuggestMessage(data.message);
      setShowSuggestDialog(true);
      if (data.success) {
        setSuggestTitle("");
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Content Requests</h1>
        <p className="text-zinc-400">
          Vote for what Natascha should react to next. Each vote costs £1.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-8 flex h-auto gap-3 bg-transparent p-0">
          <TabsTrigger
            value="movie"
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-base font-semibold text-zinc-400 shadow-sm transition-all duration-200 hover:border-rose-500/60 hover:bg-zinc-800 hover:text-white data-[state=active]:border-rose-500 data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_16px_rgba(225,29,72,0.4)]"
          >
            <Film className="h-5 w-5" /> Movies
          </TabsTrigger>
          <TabsTrigger
            value="show"
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-base font-semibold text-zinc-400 shadow-sm transition-all duration-200 hover:border-rose-500/60 hover:bg-zinc-800 hover:text-white data-[state=active]:border-rose-500 data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_16px_rgba(225,29,72,0.4)]"
          >
            <Tv className="h-5 w-5" /> TV Shows
          </TabsTrigger>
          <TabsTrigger
            value="other"
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-base font-semibold text-zinc-400 shadow-sm transition-all duration-200 hover:border-rose-500/60 hover:bg-zinc-800 hover:text-white data-[state=active]:border-rose-500 data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_16px_rgba(225,29,72,0.4)]"
          >
            <Star className="h-5 w-5" /> Other
          </TabsTrigger>
        </TabsList>

        {(["movie", "show", "other"] as ContentType[]).map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            {/* Search & Suggest */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  placeholder={`Search ${tabLabel.toLowerCase()} or suggest new...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 pl-11 rounded-xl bg-zinc-900 border-zinc-700 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-rose-500 focus:ring-rose-500/20"
                  onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
                />
              </div>
              <Button
                onClick={handleSuggest}
                disabled={!search.trim() || suggesting}
                className="h-12 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-base font-semibold shrink-0 shadow-[0_0_12px_rgba(225,29,72,0.3)] transition-all hover:shadow-[0_0_20px_rgba(225,29,72,0.5)]"
              >
                {suggesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                <span className="ml-2">Suggest</span>
              </Button>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-zinc-500">
                {filtered.length} {filtered.length === 1 ? "title" : "titles"}
              </span>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                £1 per vote
              </Badge>
            </div>

            <Separator className="mb-4 bg-zinc-800" />

            {loadingLeaderboard ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Film className="mb-3 h-12 w-12 opacity-30" />
                <p className="mb-2">No approved {tabLabel.toLowerCase()} yet.</p>
                {search && (
                  <p className="text-sm text-zinc-600">
                    Type a title and click &ldquo;Suggest&rdquo; to add it for admin review.
                  </p>
                )}
                {!user && (
                  <Link href="/auth/signin" className="mt-6">
                    <Button className="h-12 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-base font-semibold shadow-[0_0_12px_rgba(225,29,72,0.35)] transition-all hover:shadow-[0_0_20px_rgba(225,29,72,0.55)]">
                      Sign in to suggest
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
                        <VoteRow item={item} onVote={handleVote} />
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
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Suggestion Submitted</DialogTitle>
            <DialogDescription className="text-zinc-400">{suggestMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowSuggestDialog(false)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Got it
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
