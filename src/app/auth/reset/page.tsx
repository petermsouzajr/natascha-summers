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
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Password Reset!</CardTitle>
            <CardDescription className="text-zinc-400">Your password has been updated successfully.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/auth/signin">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white">Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (requestSent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Check your email</CardTitle>
            <CardDescription className="text-zinc-400">
              If an account exists with that email, we sent a reset link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/auth/signin">
              <Button variant="outline" className="border-zinc-700 text-zinc-300">Back to Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If token is in URL, show new password form
  if (token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Set New Password</CardTitle>
            <CardDescription className="text-zinc-400">Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={newPasswordForm.handleSubmit(onNewPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  {...newPasswordForm.register("password")}
                />
                {newPasswordForm.formState.errors.password && (
                  <p className="text-sm text-rose-400">{newPasswordForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={newPasswordForm.formState.isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
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
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your email and we&apos;ll send a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                {...requestForm.register("email")}
              />
              {requestForm.formState.errors.email && (
                <p className="text-sm text-rose-400">{requestForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={requestForm.formState.isSubmitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
            >
              {requestForm.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/auth/signin" className="text-sm text-zinc-400 hover:text-rose-400">
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
