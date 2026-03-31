"use server";

import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function sendOtpCode(email: string) {
	try {
		// 1. Генерируем 6 случайных цифр
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const expires = new Date(Date.now() + 10 * 60 * 1000); // Код живет 10 минут

		// 2. Удаляем старые коды для этого email, если есть, и сохраняем новый
		await prisma.verificationToken.deleteMany({ where: { identifier: email } });
		await prisma.verificationToken.create({
			data: { identifier: email, token: code, expires },
		});

		// 3. Отправляем письмо
		const transporter = nodemailer.createTransport({
			host: process.env.EMAIL_SERVER_HOST,
			port: parseInt(process.env.EMAIL_SERVER_PORT || "465", 10),
			secure: true,
			auth: {
				user: process.env.EMAIL_SERVER_USER,
				pass: process.env.EMAIL_SERVER_PASSWORD,
			},
			tls: { rejectUnauthorized: false },
		});

		await transporter.sendMail({
			from: `"Linza" <${process.env.EMAIL_FROM}>`,
			to: email,
			subject: "Ваш код для входа в Linza",
			html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Код подтверждения</h2>
          <p>Ваш код для авторизации:</p>
          <h1 style="letter-spacing: 5px; color: #3b82f6;">${code}</h1>
          <p>Код действителен 10 минут.</p>
        </div>
      `,
		});

		return { success: true };
	} catch (error) {
		console.error("Ошибка при отправке OTP:", error);
		return { error: "Не удалось отправить код" };
	}
}
