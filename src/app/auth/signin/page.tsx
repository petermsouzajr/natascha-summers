"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function SigninPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      await refresh();
      toast.success("Welcome back!");
      router.push("/");
    } else if (json.code === "EMAIL_NOT_VERIFIED") {
      toast.error("Please verify your email before signing in.");
    } else {
      toast.error(json.message);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 bg-onyx relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="font-heading text-3xl font-black text-white">Sign in</CardTitle>
          <CardDescription className="font-sans text-zinc-400">
            Welcome back! Sign in to your account.
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-sans text-zinc-300 font-bold">Password</Label>
                <Link href="/auth/reset" className="font-sans text-xs font-bold text-zinc-500 hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                className="font-sans h-12 bg-white/5 border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20 rounded-xl"
                {...register("password")}
              />
              {errors.password && (
                <p className="font-sans text-sm font-bold text-primary">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 font-sans bg-primary hover:bg-rose-500 text-white font-black text-lg rounded-xl shadow-rose transition-all hover:scale-[1.02] hover:shadow-rose-lg"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 mt-4 pt-6">
          <p className="font-sans text-sm font-medium text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary font-bold hover:text-rose-400 transition-colors">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
