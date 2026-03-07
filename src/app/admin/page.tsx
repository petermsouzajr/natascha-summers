"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Trash2, Plus, Loader2, Film, Tv, Star } from "lucide-react";
import { recentContentSchema, type RecentContentInput } from "@/lib/validations";

interface Suggestion {
  id: number;
  title: string;
  type: string;
  posterUrl: string | null;
  status: string;
  createdAt: string;
}

interface RecentItem {
  id: number;
  title: string;
  type: string;
  youtubeLink: string | null;
  posterUrl: string | null;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecentContentInput>({
    resolver: zodResolver(recentContentSchema),
    defaultValues: { type: "movie" },
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/admin/suggestions");
      const data = await res.json();
      if (data.success) setSuggestions(data.data);
    } catch {
      toast.error("Failed to load suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    const res = await fetch("/api/recent");
    const data = await res.json();
    if (data.success) setRecent(data.data);
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSuggestions();
      fetchRecent();
    }
  }, [user, fetchSuggestions, fetchRecent]);

  const handleApprove = async (id: number, action: "approved" | "denied") => {
    setActioningId(id);
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId: id, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchSuggestions();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActioningId(null);
    }
  };

  const onAddRecent = async (data: RecentContentInput) => {
    const res = await fetch("/api/recent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Content added!");
      reset();
      fetchRecent();
    } else {
      toast.error(json.message);
    }
  };

  const handleDeleteRecent = async (id: number) => {
    const res = await fetch(`/api/recent?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Removed");
      fetchRecent();
    } else {
      toast.error("Failed to remove");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const pending = suggestions.filter((s) => s.status === "pending");
  const reviewed = suggestions.filter((s) => s.status !== "pending");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>

      {/* Pending Suggestions */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Pending Suggestions
            {pending.length > 0 && (
              <Badge className="bg-rose-600 text-white">{pending.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            </div>
          ) : pending.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No pending suggestions.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-zinc-700">
                    {s.posterUrl ? (
                      <Image src={s.posterUrl} alt={s.title} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {s.type === "movie" ? <Film className="h-4 w-4 text-zinc-500" /> : <Tv className="h-4 w-4 text-zinc-500" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-100 truncate">{s.title}</p>
                    <Badge variant="outline" className="border-zinc-600 text-zinc-400 text-xs capitalize">{s.type}</Badge>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(s.id, "approved")}
                      disabled={actioningId === s.id}
                      className="bg-green-700 hover:bg-green-600 text-white"
                    >
                      {actioningId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      <span className="ml-1 hidden sm:inline">Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(s.id, "denied")}
                      disabled={actioningId === s.id}
                      className="border-rose-700 text-rose-400 hover:bg-rose-950"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Deny</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviewed Suggestions */}
      {reviewed.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recently Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviewed.slice(0, 20).map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded">
                  <span className="flex-1 text-zinc-300 text-sm truncate">{s.title}</span>
                  <Badge variant="outline" className="text-xs capitalize border-zinc-700 text-zinc-500">{s.type}</Badge>
                  <Badge
                    className={s.status === "approved" ? "bg-green-800 text-green-200" : "bg-rose-900 text-rose-200"}
                  >
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-zinc-800" />

      {/* Add Recent Content */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Add Recent Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onAddRecent)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-zinc-300">Title</Label>
                <Input
                  placeholder="Movie or show title"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  {...register("title")}
                />
                {errors.title && <p className="text-sm text-rose-400">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Type</Label>
                <Select onValueChange={(v) => setValue("type", v as "movie" | "show" | "live")} defaultValue="movie">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="movie"><Film className="inline h-4 w-4 mr-1" /> Movie</SelectItem>
                    <SelectItem value="show"><Tv className="inline h-4 w-4 mr-1" /> TV Show</SelectItem>
                    <SelectItem value="live"><Star className="inline h-4 w-4 mr-1" /> Live Stream</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">YouTube Link (optional)</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  {...register("youtubeLink")}
                />
                {errors.youtubeLink && <p className="text-sm text-rose-400">{errors.youtubeLink.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Poster URL (optional)</Label>
                <Input
                  placeholder="https://image.tmdb.org/..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  {...register("posterUrl")}
                />
                {errors.posterUrl && <p className="text-sm text-rose-400">{errors.posterUrl.message}</p>}
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Content
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Manage Recent Content */}
      {recent.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Manage Recent Content ({recent.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recent.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800/50">
                  <span className="flex-1 text-zinc-300 text-sm truncate">{item.title}</span>
                  <Badge variant="outline" className="text-xs capitalize border-zinc-700 text-zinc-500">{item.type}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteRecent(item.id)}
                    className="text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
