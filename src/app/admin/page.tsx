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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Trash2, Plus, Loader2, Film, Tv, Star, Pencil, AlertTriangle } from "lucide-react";
import { upNextSchema, type UpNextInput } from "@/lib/validations";

interface Suggestion {
  id: number;
  title: string;
  type: string;
  posterUrl: string | null;
  status: string;
  createdAt: string;
}

interface UpNextItem {
  id: number;
  title: string;
  type: string;
  releaseDate: string | null;
  hasCosplay: boolean;
  details: string | null;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [upNext, setUpNext] = useState<UpNextItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<UpNextItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    resolver: zodResolver(upNextSchema),
    defaultValues: {
      type: "movie",
      hasCosplay: false,
      title: "",
      releaseDate: "",
      details: "",
    },
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

  const fetchUpNext = useCallback(async () => {
    const res = await fetch("/api/up-next");
    const data = await res.json();
    if (data.success) setUpNext(data.data);
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSuggestions();
      fetchUpNext();
    }
  }, [user, fetchSuggestions, fetchUpNext]);

  const formatDate = (dateValue: string | Date | null) => {
    if (!dateValue) return null;
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return dateValue.toString();
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(d);
    } catch {
      return dateValue.toString();
    }
  };

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

  const onAddUpNext = async (data: UpNextInput) => {
    const res = await fetch("/api/up-next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Up Next item added! 🚀");
      reset();
      fetchUpNext();
    } else {
      toast.error(json.message);
    }
  };

  const handleUpdateUpNext = async (data: UpNextInput) => {
    if (!editingItem) return;
    try {
      const res = await fetch("/api/up-next", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingItem.id, ...data }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Updated! 💎");
        setEditingItem(null);
        fetchUpNext();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/up-next?id=${deletingId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Removed");
        setDeletingId(null);
        fetchUpNext();
      } else {
        toast.error("Failed to remove");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-onyx">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const pending = suggestions.filter((s) => s.status === "pending");
  const reviewed = suggestions.filter((s) => s.status !== "pending");

  return (
    <div className="min-h-screen bg-onyx pb-20">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-4xl font-black text-white">Admin Dashboard</h1>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Global Admin Instructions */}
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 backdrop-blur-md shadow-rose-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Star className="h-24 w-24 text-primary rotate-12" />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-rose">
              <Star className="h-6 w-6 fill-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight">Admin Quick Guide</h2>
              <div className="font-sans text-zinc-300 leading-relaxed max-w-3xl space-y-4">
                <p>
                  Welcome back, Admin! This dashboard allows you to moderate community submissions and curate the home page content.
                </p>
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Module 1 */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-white font-black">1</Badge>
                        <span className="font-heading text-lg font-black text-white uppercase tracking-tight">Pending Suggestions</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-zinc-300"><span className="text-primary font-bold">PURPOSE:</span> Review titles submitted by fans via the &quot;Requests&quot; page.</p>
                        <p className="text-zinc-300"><span className="text-primary font-bold">ACTION:</span> Click **Approve** to move a title to the live Leaderboard, or **Deny** to hide/reject it.</p>
                        <p className="text-white font-bold flex items-center gap-2 mt-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          DESTINATION: Requests / Community Voting Page
                        </p>
                      </div>
                    </div>

                    {/* Module 2 */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 text-white font-black">2</Badge>
                        <span className="font-heading text-lg font-black text-white uppercase tracking-tight">Add Up Next</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-zinc-300"><span className="text-emerald-400 font-bold">PURPOSE:</span> Announce upcoming reactions or streams to your fans.</p>
                        <p className="text-zinc-300"><span className="text-emerald-400 font-bold">ACTION:</span> Set the title, **Release Date**, and **Cosplay status**.</p>
                        <p className="text-white font-bold flex items-center gap-2 mt-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          DESTINATION: Landing Page (Home) Carousels
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Module 3 */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-zinc-700 text-white font-black">3</Badge>
                      <span className="font-heading text-lg font-black text-white uppercase tracking-tight">Manage Up Next</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-zinc-300"><span className="text-zinc-400 font-bold">PURPOSE:</span> Cleanup and organize your upcoming schedule.</p>
                      <p className="text-zinc-300"><span className="text-zinc-400 font-bold">ACTION:</span> Click the **Trash Icon** to permanently remove an item once the session is done.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Suggestions */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="font-heading text-2xl font-black text-white flex items-center gap-3">
              Pending Suggestions
              {pending.length > 0 && (
                <Badge className="bg-primary text-white font-black px-3 py-1 shadow-rose">{pending.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : pending.length === 0 ? (
              <p className="font-sans text-zinc-500 text-center py-12 font-medium">No pending suggestions.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {pending.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 py-4 px-2 transition-all hover:bg-white/5 rounded-xl group/row">
                    <div className="relative  h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-onyx border border-white/10 shadow-lg">
                      {s.posterUrl ? (
                        <Image src={s.posterUrl} alt={s.title} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          {s.type === "movie" ? <Film className="h-6 w-6 text-zinc-700" /> : <Tv className="h-6 w-6 text-zinc-700" />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-black text-white text-lg truncate group-hover/row:text-primary transition-colors">{s.title}</p>
                      <Badge variant="outline" className="mt-1 font-sans border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-wider">{s.type}</Badge>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(s.id, "approved")}
                        disabled={actioningId === s.id}
                        className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-lg transition-all hover:scale-105"
                      >
                        {actioningId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        <span className="font-sans ml-2 hidden sm:inline ">Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleApprove(s.id, "denied")}
                        disabled={actioningId === s.id}
                        className="h-10 px-4 border border-white/10 bg-white/5 text-rose-400 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="font-sans ml-2 hidden sm:inline">Deny</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="bg-white/10" />

        <div className="grid gap-10 md:grid-cols-2">
          {/* Add Up Next */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl h-fit">
            <CardHeader>
              <CardTitle className="font-heading text-2xl font-black text-white">Add Up Next</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onAddUpNext)} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-sans text-zinc-300 font-bold">Title</Label>
                  <Input
                    placeholder="Movie or show title"
                    className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20 rounded-xl"
                    {...register("title")}
                  />
                  {errors.title?.message && <p className="font-sans text-sm font-bold text-primary">{String(errors.title.message)}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-sans text-zinc-300 font-bold">Type</Label>
                    <Select onValueChange={(v) => setValue("type", v as "movie" | "show" | "live")} defaultValue="movie">
                      <SelectTrigger className="font-sans !h-12 w-full text-base bg-zinc-900 border-white/10 text-zinc-100 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-onyx border-white/10 text-base">
                        <SelectItem value="movie">🎬 Movie</SelectItem>
                        <SelectItem value="show">📺 TV Show</SelectItem>
                        <SelectItem value="live">⭐ Live Stream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-sans text-zinc-300 font-bold">Release Date</Label>
                    <Input
                      type="date"
                      className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 rounded-xl [color-scheme:dark]"
                      {...register("releaseDate")}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <Label className="font-sans text-zinc-300 font-bold">Cosplay?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={watch("hasCosplay") ? "default" : "ghost"}
                      onClick={() => setValue("hasCosplay", true)}
                      className={`font-sans rounded-lg px-4 ${watch("hasCosplay") ? "bg-emerald-500 text-white" : "text-zinc-500"}`}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={!watch("hasCosplay") ? "default" : "ghost"}
                      onClick={() => setValue("hasCosplay", false)}
                      className={`font-sans rounded-lg px-4 ${!watch("hasCosplay") ? "bg-primary text-white" : "text-zinc-500"}`}
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-sans text-zinc-300 font-bold">Other Details</Label>
                  <Input
                    placeholder="e.g. Special Guest, 3-hour stream..."
                    className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 rounded-xl"
                    {...register("details")}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 font-sans bg-primary hover:bg-rose-500 text-white font-black text-lg rounded-xl shadow-rose transition-all hover:scale-[1.02]"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                  Add to Up Next
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Manage Up Next Content */}
          {upNext.length > 0 && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl h-fit">
              <CardHeader>
                <CardTitle className="font-heading text-2xl font-black text-white flex items-center justify-between">
                  Up Next List
                  <span className="text-sm font-bold text-zinc-500">Total: {upNext.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {upNext.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 p-5 rounded-3xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-primary/30 group hover:shadow-rose-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-heading text-white font-black text-xl tracking-tight truncate group-hover:text-primary transition-colors text-wrap">{item.title}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-md font-sans uppercase font-bold border-white/10 text-zinc-500">{item.type}</Badge>
                            {item.releaseDate && (
                              <Badge className="bg-primary/10 text-primary text-md font-sans font-black uppercase border border-primary/20">📅 {formatDate(item.releaseDate)}</Badge>
                            )}
                            {item.hasCosplay && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 text-md font-sans font-black uppercase border border-emerald-500/20">👗 Cosplay</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingItem(item)}
                            className="h-10 w-10 shrink-0 p-0 text-zinc-600 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingId(item.id)}
                            className="h-10 w-10 shrink-0 p-0 text-zinc-600 hover:text-primary hover:bg-primary/10 rounded-xl"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      {item.details && (
                        <p className="font-sans text-xs text-zinc-400 leading-relaxed italic border-l-2 border-primary/30 pl-3">
                          &quot;{item.details}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <div className="h-20" />

          {/* Delete Confirmation Modal */}
          <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
            <DialogContent className="bg-zinc-900 border-white/10 max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-black text-white flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  Are you sure?
                </DialogTitle>
                <DialogDescription className="font-sans text-zinc-400 text-base py-4">
                  This will permanently delete this &quot;Up Next&quot; item. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setDeletingId(null)}
                  className="flex-1 bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-primary hover:bg-rose-500 text-white font-bold rounded-xl"
                >
                  Confirm Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Modal */}
          {editingItem && (
            <EditUpNextModal
              item={editingItem}
              onClose={() => setEditingItem(null)}
              onSave={handleUpdateUpNext}
            />
          )}
        </div>

        {/* Reviewed Suggestions */}
        {reviewed.length > 0 && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="font-heading text-lg font-black text-white">Recently Reviewed</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-2">
                {reviewed.slice(0, 20).map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 transition-all hover:bg-white/10">
                    <span className="flex-1 font-sans text-zinc-300 font-bold truncate">{s.title}</span>
                    <Badge variant="outline" className="text-xs uppercase tracking-tighter border-white/10 text-zinc-500">{s.type}</Badge>
                    <Badge
                      className={`font-black uppercase tracking-tighter px-3 ${s.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}
                    >
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

type EditUpNextModalProps = { item: UpNextItem; onClose: () => void; onSave: (data: UpNextInput) => Promise<void> };
function EditUpNextModal({ item, onClose, onSave }: EditUpNextModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    resolver: zodResolver(upNextSchema),
    defaultValues: {
      title: item.title,
      type: item.type as "movie" | "show" | "live",
      releaseDate: item.releaseDate ? new Date(item.releaseDate).toISOString().split('T')[0] : "",
      hasCosplay: item.hasCosplay,
      details: item.details || "",
    },
  });

  const type = watch("type");
  const hasCosplay = watch("hasCosplay");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl font-black text-white">Edit Up Next Item</DialogTitle>
          <DialogDescription className="text-zinc-500 font-sans">Modify the details for &quot;{item.title}&quot;</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label className="font-sans text-zinc-300 font-bold">Content Title</Label>
              <Input
                placeholder="Title..."
                className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20 rounded-xl"
                {...register("title")}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-sans text-zinc-300 font-bold">Type</Label>
              <Select value={type} onValueChange={(v) => setValue("type", v as "movie" | "show" | "live")}>
                <SelectTrigger className="w-full !h-12 text-base bg-white/5 border-white/10 text-zinc-100 rounded-xl font-sans">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-base text-zinc-100 font-sans">
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="show">TV Show</SelectItem>
                  <SelectItem value="live">Stream/Live</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-sans text-zinc-300 font-bold">Release Date / Label</Label>
              <Input
                type="date"
                className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 rounded-xl [color-scheme:dark]"
                {...register("releaseDate")}
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <Label className="font-sans text-zinc-300 font-bold mb-2">Cosplay Planned?</Label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setValue("hasCosplay", !hasCosplay)}
                className={`h-12 justify-start rounded-xl border border-white/10 font-sans transition-all ${hasCosplay ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-zinc-400"
                  }`}
              >
                {hasCosplay ? "👗 Yes, Cosplay" : "❌ No Cosplay"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-sans text-zinc-300 font-bold">Other Details</Label>
            <Textarea
              placeholder="e.g. Special Guest, 3-hour stream..."
              className="font-sans bg-white/5 border-white/10 text-zinc-100 rounded-xl max-h-32"
              {...register("details")}
            />
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-12 px-8 font-sans bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 font-sans bg-primary hover:bg-rose-500 text-white font-black text-lg rounded-xl shadow-rose"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Star className="h-5 w-5 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
