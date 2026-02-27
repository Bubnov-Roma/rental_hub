"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button, Input, Label } from "@/components/ui";
import { useOtpAuth } from "@/hooks/useOtpAuth";
import { createClient } from "@/lib/supabase/client";
import { getURL } from "@/utils";

export function UniversalAuthForm() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { sendOtpCode, isSendingCode } = useOtpAuth();
	const supabase = createClient();
	const router = useRouter();

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
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
			description="Введите email, чтобы войти"
			footerLink={{
				text: "Есть постоянный пароль?",
				label: "Войти по паролю",
				href: "/auth?view=login",
			}}
			isLoading={isSendingCode || isLoading}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label>Email</Label>
					<div className="relative">
						<Mail className="z-1 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="email"
							placeholder="name@example.com"
							className="pl-10"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
				</div>

				<Button
					type="submit"
					disabled={!email || isSendingCode}
					className="w-full h-12 font-bold text-base shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
				>
					{isSendingCode ? "Отправка..." : "Продолжить"}
				</Button>
			</form>

			<div className="relative py-4">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t border-primary/5" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-primary/6 rounded-xl px-2 text-muted-foreground backdrop-blur-2xl">
						Или
					</span>
				</div>
			</div>

			<Button
				variant="social"
				className="w-full h-12 gap-2"
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

			<p className="flex items-center justify-center text-center pt-8 w-full text-xs text-muted-foreground hover:text-foreground select-none">
				Если у вас ещё нет аккаунта он будет создан автоматически
			</p>
		</AuthCard>
	);
}
