"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ValidatedInput } from "@/components/forms";
import { Button } from "@/components/ui";
import { useOtpAuth } from "@/hooks/use-otp-auth";
import { createClient } from "@/lib/supabase/client";
import { emailSchema } from "@/schemas";
import { getURL } from "@/utils";

export function UniversalAuthForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { sendOtpCode, isSendingCode } = useOtpAuth();
	const supabase = createClient();
	const router = useRouter();

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		const result = emailSchema.safeParse(email);
		if (!result.success && result.error.issues[0]) {
			setError(result.error.issues[0].message);
			return;
		}
		setError("");
		const success = await sendOtpCode(email, "email");
		if (success) {
			router.push(`/auth?view=otp&email=${encodeURIComponent(email)}`);
		}
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${getURL()}auth/callback` },
		});
	};

	return (
		<AuthCard
			title="Войти"
			description="Если у вас ещё нет аккаунта он будет создан автоматически"
			footerLink={{
				text: "Есть постоянный пароль?",
				label: "Войти по паролю",
				href: "/auth?view=login",
			}}
			isLoading={isSendingCode || isLoading}
		>
			<Button
				variant="social"
				className="w-full h-12 gap-2 mb-4"
				onClick={handleGoogleLogin}
			>
				Вход с
				<Image
					src="https://www.svgrepo.com/show/475656/google-color.svg"
					width={18}
					height={18}
					alt="Google"
				/>
				Google
			</Button>

			<div className="relative flex justify-center text-xs uppercase">
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
						if (error) setError("");
					}}
					error={error}
					icon={<Mail className="h-4 w-4" />}
					required
				/>
				<Button
					type="submit"
					disabled={!email || isSendingCode}
					className="w-full h-12 font-bold text-base shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
				>
					{isSendingCode ? "Отправка..." : "Продолжить"}
				</Button>
			</form>
		</AuthCard>
	);
}
