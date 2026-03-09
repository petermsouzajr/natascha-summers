"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signupSchema, type SignupInput } from "@/lib/validations";

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setSubmitted(true);
    } else {
      toast.error(json.message);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 bg-onyx relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <Card className="relative z-10 w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl text-center">
          <CardHeader>
            <CardTitle className="font-heading text-3xl font-black text-primary mb-2">Check your email!</CardTitle>
            <CardDescription className="font-sans text-zinc-400 font-medium">
              We sent a verification link to your email address. Click it to activate your account.
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

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 bg-onyx relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="font-heading text-3xl font-black text-white">Create an account</CardTitle>
          <CardDescription className="font-sans text-zinc-400">
            Sign up to vote for content and suggest reactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Honeypot */}
            <Input
              type="text"
              className="hidden"
              {...register("firstname")}
              tabIndex={-1}
              autoComplete="off"
            />
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans text-zinc-300 font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20 rounded-xl"
                {...register("email")}
              />
              {errors.email && (
                <p className="font-sans text-sm font-bold text-primary">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-sans text-zinc-300 font-bold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20 rounded-xl"
                {...register("password")}
              />
              {errors.password && (
                <p className="font-sans text-sm font-bold text-primary">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={true}
              className="w-full h-12 font-sans bg-zinc-800 text-zinc-500 font-black text-lg rounded-xl cursor-not-allowed opacity-50"
            >
              Sign up disabled
            </Button>
            <p className="font-sans text-xs text-center font-bold text-primary mt-2">
              ⚠️ This is a demo site, you can not sign up yet
            </p>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 mt-4 pt-6">
          <p className="font-sans text-sm font-medium text-zinc-400">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary font-bold hover:text-rose-400 transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
