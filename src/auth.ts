import type { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

const providers = [];

providers.push();

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	adapter: PrismaAdapter(prisma) as Adapter,
	providers: [
		...authConfig.providers,
		Credentials({
			id: "otp",
			name: "OTP",
			credentials: {
				email: { label: "Email", type: "email" },
				code: { label: "Code", type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.code) return null;

				const email = credentials.email as string;
				const code = credentials.code as string;

				// 1. Ищем валидный токен в БД
				const tokenRecord = await prisma.verificationToken.findFirst({
					where: { identifier: email, token: code },
				});

				if (!tokenRecord || tokenRecord.expires < new Date()) {
					throw new Error("Неверный или просроченный код");
				}

				// 2. Код верный! Ищем пользователя или создаем нового
				let user = await prisma.user.findUnique({ where: { email } });

				if (!user) {
					user = await prisma.user.create({
						data: { email },
					});
				}

				// 3. Удаляем использованный токен
				await prisma.verificationToken.delete({
					where: {
						identifier_token: { identifier: email, token: code },
					},
				});

				return user;
			},
		}),
	],
});
