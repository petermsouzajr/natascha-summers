"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Derive the initial state from the token so we never call setState
  // synchronously inside an effect (satisfies react-hooks/set-state-in-effect).
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "" : "No verification token provided."
  );

  useEffect(() => {
    if (!token) return;

    fetch(`/api/auth/verify?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStatus("success");
          setMessage(d.message);
        } else {
          setStatus("error");
          setMessage(d.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 bg-onyx relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl text-center">
        <CardHeader className="space-y-2">
          {status === "loading" && <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />}
          {status === "success" && <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />}
          {status === "error" && <XCircle className="mx-auto h-16 w-16 text-primary drop-shadow-[0_0_10px_rgba(251,63,96,0.3)]" />}
          <CardTitle className="font-heading text-3xl font-black text-white pt-2">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="font-sans text-lg font-medium text-zinc-400">{message}</p>
          {status === "success" && (
            <Link href="/auth/signin">
              <Button className="font-sans h-12 bg-primary hover:bg-rose-500 text-white font-black px-10 rounded-xl shadow-rose transition-all hover:scale-105">
                Sign In Now
              </Button>
            </Link>
          )}
          {status === "error" && (
            <Link href="/auth/signup">
              <Button variant="outline" className="font-sans border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white px-8 rounded-xl transition-all">
                Try Signing Up Again
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
