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
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-center">
        <CardHeader>
          {status === "loading" && <Loader2 className="mx-auto h-12 w-12 animate-spin text-rose-500" />}
          {status === "success" && <CheckCircle className="mx-auto h-12 w-12 text-green-500" />}
          {status === "error" && <XCircle className="mx-auto h-12 w-12 text-rose-500" />}
          <CardTitle className="text-xl text-white">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-400">{message}</p>
          {status === "success" && (
            <Link href="/auth/signin">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                Sign In Now
              </Button>
            </Link>
          )}
          {status === "error" && (
            <Link href="/auth/signup">
              <Button variant="outline" className="border-zinc-700 text-zinc-300">
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
