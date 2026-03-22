import type { Adapter } from "@auth/core/adapters";
import Nodemailer from "@auth/core/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

const providers: Provider[] = [...(authConfig.providers || [])];

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
				tls: {
					rejectUnauthorized: false,
				},
			},
			from: process.env.EMAIL_FROM,
		})
	);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma) as Adapter,
	...authConfig,
	providers,
});
