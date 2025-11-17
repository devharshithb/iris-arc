"use client";

import { motion } from "framer-motion";
import { Chrome, Loader2, Lock, LogIn, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:8000";

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [gLoading, setGLoading] = useState(false);

   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

   const handleGoogleSignIn = async () => {
      setGLoading(true);
      try {
         await signIn("google", { callbackUrl: "/" });
      } catch (err) {
         console.error("Google Sign-in error:", err);
         toast.error("Google Sign-in failed");
         setGLoading(false);
      }
   };

   const doCredentialsLogin = async () => {
      setLoading(true);
      const res = await signIn("credentials", {
         redirect: false,
         email,
         password,
      });
      setLoading(false);

      if (res?.ok) {
         toast.success("Logged in");
         router.replace("/");
      } else {
         console.error("Login failed:", res?.error);
         toast.error(res?.error || "Invalid credentials");
      }
   };

   const doSignupThenLogin = async () => {
      setLoading(true);
      try {
         const r = await fetch(`${BACKEND}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
         });
         if (!r.ok) {
            const msg = await safeError(r);
            throw new Error(msg || "Signup failed");
         }
         
         const data = await r.json();
         console.log("✅ Signup successful, attempting auto-login...");
         
         // After signup, log in via NextAuth credentials provider
         const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
         });
         
         if (res?.ok) {
            toast.success("Account created");
            router.replace("/");
         } else {
            console.error("Auto-login failed:", res?.error);
            throw new Error(res?.error || "Auto-login failed after signup. Please try logging in manually.");
         }
      } catch (e: any) {
         console.error("Signup error:", e);
         toast.error(e.message || "Signup error");
      } finally {
         setLoading(false);
      }
   };

   const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
         toast.error("Email and password required");
         return;
      }
      if (mode === "signup") {
         if (!name.trim()) {
            toast.error("Name required");
            return;
         }
         doSignupThenLogin();
      } else {
         doCredentialsLogin();
      }
   };

   return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-950 text-white">
         <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm rounded-2xl bg-neutral-900/60 p-8 shadow-lg border border-white/10"
         >
            <h1 className="text-center text-2xl font-semibold mb-6">
               {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>

            <div className="space-y-3 mb-5">
               <button
                  onClick={handleGoogleSignIn}
                  disabled={gLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-2 text-sm hover:bg-white/10 transition-colors"
               >
                  {gLoading ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                     <Chrome className="h-4 w-4 text-[#ea4335]" />
                  )}
                  Continue with Google
               </button>
            </div>

            <div className="relative my-5 text-center text-xs uppercase text-white/50">
               <span className="absolute left-0 top-1/2 h-px w-full bg-white/10"></span>
               <span className="relative bg-neutral-900/60 px-2">or</span>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
               {mode === "signup" && (
                  <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2">
                     <User className="h-4 w-4 opacity-60" />
                     <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="Full name"
                        className="w-full bg-transparent text-sm outline-none placeholder-white/50"
                        autoComplete="name"
                     />
                  </div>
               )}

               <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2">
                  <Mail className="h-4 w-4 opacity-60" />
                  <input
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     type="email"
                     placeholder="Email"
                     className="w-full bg-transparent text-sm outline-none placeholder-white/50"
                     autoComplete="email"
                  />
               </div>

               <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2">
                  <Lock className="h-4 w-4 opacity-60" />
                  <input
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     type="password"
                     placeholder="Password"
                     className="w-full bg-transparent text-sm outline-none placeholder-white/50"
                     autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-white text-black py-2 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-60"
               >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  {mode === "login" ? "Continue" : "Create account"}
               </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
               {mode === "login" ? (
                  <>
                     Don’t have an account?{" "}
                     <a href="/signup" className="text-white hover:underline font-medium">
                        Sign up
                     </a>
                  </>
               ) : (
                  <>
                     Already have an account?{" "}
                     <a href="/login" className="text-white hover:underline font-medium">
                        Log in
                     </a>
                  </>
               )}
            </p>
         </motion.div>
      </div>
   );
}

async function safeError(r: Response) {
   try {
      const t = await r.text();
      try {
         const j = JSON.parse(t);
         return j?.detail || j?.message || t;
      } catch {
         return t;
      }
   } catch {
      return "Unknown error";
   }
}
