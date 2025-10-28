import { authOptions as options } from "@/pages/api/auth/[...nextauth]";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = options;
