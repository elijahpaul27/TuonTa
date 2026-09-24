import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-expect-error — @auth/prisma-adapter and next-auth bundle @auth/core
  // at different versions causing a structural type mismatch at compile-time only.
  // This has no effect at runtime.
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            examLevel: true,
          },
        });

        if (!user || !user.password) return null;

        // Support both plain-text legacy passwords (seeded users) and hashed ones
        let isValid = false;
        if (user.password.startsWith("$2")) {
          // bcrypt hash
          isValid = await bcrypt.compare(credentials.password as string, user.password);
        } else {
          // Plain-text fallback for seeded dev accounts
          isValid = credentials.password === user.password;
        }

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          examLevel: user.examLevel ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role ?? 'USER';
        token.examLevel = user.examLevel ?? null;
      }
      // When OnboardingForm calls update({ examLevel }), merge it into the token
      // so the middleware sees the updated value on the very next request.
      if (trigger === 'update' && session?.examLevel) {
        token.examLevel = session.examLevel;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.examLevel = token.examLevel;
      }
      return session;
    },
  },
});
