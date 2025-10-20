"use client";

import { motion } from "framer-motion";
import { Chrome, Loader2, Lock, LogIn, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
   const router = useRouter();
   const [loading, setLoading] = useState(false);

   const handleGoogleSignIn = async () => {
      setLoading(true);
      try {
         // ✅ NextAuth v5+ uses `redirectTo` instead of `callbackUrl`
         await signIn("google", { callbackUrl: "/" }); // v4 uses callbackUrl
      } catch (err) {
         console.error("Google Sign-in error:", err);
         setLoading(false);
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
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-2 text-sm hover:bg-white/10 transition-colors"
               >
                  {loading ? (
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

            <form
               onSubmit={(e) => {
                  e.preventDefault();
                  router.push("/"); // mock form until custom signup logic
               }}
               className="space-y-3"
            >
               {mode === "signup" && (
                  <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2">
                     <User className="h-4 w-4 opacity-60" />
                     <input
                        type="text"
                        placeholder="Full name"
                        className="w-full bg-transparent text-sm outline-none placeholder-white/50"
                     />
                  </div>
               )}

               <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2">
                  <Mail className="h-4 w-4 opacity-60" />
                  <input
                     type="email"
                     placeholder="Email"
                     className="w-full bg-transparent text-sm outline-none placeholder-white/50"
                  />
               </div>

               <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2">
                  <Lock className="h-4 w-4 opacity-60" />
                  <input
                     type="password"
                     placeholder="Password"
                     className="w-full bg-transparent text-sm outline-none placeholder-white/50"
                  />
               </div>

               <button
                  type="submit"
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-white text-black py-2 text-sm font-semibold hover:bg-neutral-200 transition"
               >
                  <LogIn className="h-4 w-4" />
                  {mode === "login" ? "Continue" : "Create account"}
               </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
               {mode === "login" ? (
                  <>
                     Don’t have an account?{" "}
                     <a
                        href="/signup"
                        className="text-white hover:underline font-medium"
                     >
                        Sign up
                     </a>
                  </>
               ) : (
                  <>
                     Already have an account?{" "}
                     <a
                        href="/login"
                        className="text-white hover:underline font-medium"
                     >
                        Log in
                     </a>
                  </>
               )}
            </p>
         </motion.div>
      </div>
   );
}
