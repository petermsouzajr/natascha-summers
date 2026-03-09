"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetRequestSchema } from "@/lib/validations";

const newPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function ResetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [requestSent, setRequestSent] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const requestForm = useForm<{ email: string }>({
    resolver: zodResolver(resetRequestSchema),
  });

  const newPasswordForm = useForm<{ password: string }>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onRequestReset = async (data: { email: string }) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setRequestSent(true);
    } else {
      toast.error(json.message);
    }
  };

  const onNewPassword = async (data: { password: string }) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    const json = await res.json();
    if (json.success) {
      setResetDone(true);
    } else {
      toast.error(json.message);
    }
  };

  if (resetDone) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 bg-onyx relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <Card className="relative z-10 w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl text-center">
          <CardHeader>
            <CardTitle className="font-heading text-3xl font-black text-white">Password Reset!</CardTitle>
            <CardDescription className="font-sans text-zinc-400 font-medium pt-2">Your password has been updated successfully.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center border-t border-white/5 mt-6 pt-6">
            <Link href="/auth/signin">
              <Button className="font-sans h-12 bg-primary hover:bg-rose-500 text-white font-black px-10 rounded-xl shadow-rose transition-all hover:scale-105">
                Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (requestSent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 bg-onyx relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <Card className="relative z-10 w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl text-center">
          <CardHeader>
            <CardTitle className="font-heading text-3xl font-black text-white">Check your email</CardTitle>
            <CardDescription className="font-sans text-zinc-400 font-medium pt-2">
              If an account exists with that email, we sent a reset link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center border-t border-white/5 mt-6 pt-6">
            <Link href="/auth/signin">
              <Button variant="outline" className="font-sans border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white px-8 rounded-xl transition-all">
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If token is in URL, show new password form
  if (token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 bg-onyx relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <Card className="relative z-10 w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="font-heading text-3xl font-black text-white">Set New Password</CardTitle>
            <CardDescription className="font-sans text-zinc-400">Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={newPasswordForm.handleSubmit(onNewPassword)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans text-zinc-300 font-bold">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20 rounded-xl"
                  {...newPasswordForm.register("password")}
                />
                {newPasswordForm.formState.errors.password && (
                  <p className="font-sans text-sm font-bold text-primary">{newPasswordForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={newPasswordForm.formState.isSubmitting}
                className="w-full h-12 font-sans bg-primary hover:bg-rose-500 text-white font-black text-lg rounded-xl shadow-rose transition-all hover:scale-[1.02] hover:shadow-rose-lg"
              >
                {newPasswordForm.formState.isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 bg-onyx relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="font-heading text-3xl font-black text-white">Reset Password</CardTitle>
          <CardDescription className="font-sans text-zinc-400">
            Enter your email and we&apos;ll send a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans text-zinc-300 font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20 rounded-xl"
                {...requestForm.register("email")}
              />
              {requestForm.formState.errors.email && (
                <p className="font-sans text-sm font-bold text-primary">{requestForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={requestForm.formState.isSubmitting}
              className="w-full h-12 font-sans bg-primary hover:bg-rose-500 text-white font-black text-lg rounded-xl shadow-rose transition-all hover:scale-[1.02] hover:shadow-rose-lg"
            >
              {requestForm.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 mt-4 pt-6">
          <Link href="/auth/signin" className="font-sans text-sm font-bold text-zinc-400 hover:text-primary transition-colors">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetContent />
    </Suspense>
  );
}
