"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOtpAuth } from "@/hooks/useOtpAuth";

export function OtpLoginForm() {
	// mode тут для совместимости, можно убрать если не используется
	const [email, setEmail] = useState("");
	const { sendOtpCode, isSendingCode } = useOtpAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await sendOtpCode(email, "email");
		if (success) {
			router.push(`/auth?view=otp&email=${encodeURIComponent(email)}`);
		}
	};

	return (
		<AuthCard
			title="Вход по коду"
			description="Введите email для получения одноразового кода"
			footerLink={{
				text: "Хотите использовать пароль?",
				label: "Войти с паролем",
				href: "/auth?view=login",
			}}
			isLoading={isSendingCode}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label>Email</Label>
					<div className="relative">
						<Mail className="z-1 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="email"
							placeholder="name@example.com"
							className="pl-10 h-11 bg-white/5"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
				</div>

				<Button
					type="submit"
					className="w-full h-11 font-bold shadow-lg shadow-primary/20"
				>
					Получить код
				</Button>
			</form>
		</AuthCard>
	);
}
