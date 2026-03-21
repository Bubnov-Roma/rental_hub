"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { ValidatedInput } from "@/components/forms";
import { Button } from "@/components/ui";
import { emailSchema } from "@/schemas";

export function UniversalAuthForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isEmailSent, setIsEmailSent] = useState(false);

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		const result = emailSchema.safeParse(email);
		if (!result.success && result.error.issues[0]) {
			setError(result.error.issues[0].message);
			return;
		}
		setError("");
		setIsLoading(true);
		const res = await signIn("nodemailer", { email, redirect: false });
		setIsLoading(false);

		if (res?.error) {
			toast.error("Ошибка при отправке ссылки");
		} else {
			setIsEmailSent(true);
			toast.success("Ссылка отправлена!");
		}
	};

	const handleGoogleLogin = () => {
		signIn("google", { callbackUrl: "/dashboard" });
	};

	if (isEmailSent) {
		return (
			<AuthCard
				title="Проверьте почту"
				description={`Мы отправили ссылку для входа на ${email}`}
			>
				<p className="text-center text-sm text-muted-foreground py-8">
					Нажмите на ссылку в письме, чтобы безопасно войти в аккаунт.
				</p>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			title="Войти"
			description="Безопасный вход по ссылке на почту"
			footerLink={{
				text: "Есть пароль?",
				label: "Войти по паролю",
				href: "/auth?view=login",
			}}
			isLoading={isLoading}
		>
			<Button
				variant="social"
				className="w-full h-12 gap-2 mb-4"
				onClick={handleGoogleLogin}
			>
				<Image
					src="https://www.svgrepo.com/show/475656/google-color.svg"
					width={18}
					height={18}
					alt="Google"
				/>
				Вход с Google
			</Button>

			<div className="relative flex justify-center text-xs uppercase mb-4">
				<span className="bg-muted-foreground/6 rounded-xl px-2 text-muted-foreground">
					Или
				</span>
			</div>

			<form onSubmit={handleSubmit} className="space-y-2" noValidate>
				<ValidatedInput
					label="Email"
					type="email"
					placeholder="введите ваш email"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						setError("");
					}}
					error={error}
					icon={<Mail className="h-4 w-4" />}
					required
				/>
				<Button
					type="submit"
					disabled={!email || isLoading}
					className="w-full h-12 font-bold shadow-xl shadow-primary/20"
				>
					{isLoading ? "Отправка..." : "Получить ссылку"}
				</Button>
			</form>
		</AuthCard>
	);
}
