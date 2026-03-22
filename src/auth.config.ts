import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const providers = [];

// Google provider
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	providers.push(
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		})
	);
}

export const authConfig = {
	session: { strategy: "jwt" },
	providers,
	pages: {
		signIn: "/auth",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role ?? "GUEST";
				token.id = user.id ?? "";
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
