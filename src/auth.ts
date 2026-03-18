import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: { strategy: "jwt" },
	providers: [
		Nodemailer({
			server: process.env.EMAIL_SERVER,
			from: process.env.EMAIL_FROM ?? "",
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
				token.id = user.id ?? "";
				token.name = user.name ?? "";
				token.email = user.email ?? "";
				token.image = user.image;
				token.nickname = user.nickname ?? "";
				token.companyName = user.companyName ?? "";
				token.phone = user.phone ?? "";
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role;
				session.user.nickname = token.nickname as string;
				session.user.companyName = token.companyName as string;
				session.user.phone = token.phone as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth",
	},
});
