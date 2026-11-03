import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const useSecureCookies = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  cookies: {
    pkceCodeVerifier: {
      name: useSecureCookies ? "__Secure-authjs.pkce.code_verifier" : "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        await prisma.user.upsert({
          where: {
            email: user.email,
          },
          update: {
            name: user.name,
            image: user.image,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        });
        return true;
      } catch (error) {
        console.error("Gagal menyimpan user ke database:", error);
        return false;
      }
    },
  },
});