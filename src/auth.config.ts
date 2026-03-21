import type { NextAuthConfig } from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";

const providers = [];

if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM) {
	providers.push(
		Nodemailer({
			server: {
				host: process.env.EMAIL_SERVER_HOST,
				port: parseInt(process.env.EMAIL_SERVER_PORT || "465", 10),
				secure: true,
				auth: {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				},
			},
			from: process.env.EMAIL_FROM,
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
			console.log("session callback:", { session, token });
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
