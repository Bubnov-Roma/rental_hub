import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";

export const authConfig = {
	trustHost: true,
	session: { strategy: "jwt" },
	pages: {
		signIn: "/auth",
	},

	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		Yandex({
			clientId: process.env.YANDEX_CLIENT_ID as string,
			clientSecret: process.env.YANDEX_CLIENT_SECRET as string,
			authorization: {
				url: "https://oauth.yandex.ru/authorize",
				params: {
					scope: "login:email login:info login:avatar",
				},
			},
			token: "https://oauth.yandex.ru/token",
			userinfo: "https://login.yandex.ru/info?format=json",
		}),
	],
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
