"use client";

import { CheckCircle2, Clock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { ValidatedInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { emailSchema } from "@/schemas";
import { getErrorMessage } from "@/utils";

export function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSent, setIsSent] = useState(false);
	const [cooldown, setCooldown] = useState(0);

	const supabase = createClient();

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (cooldown > 0) {
			interval = setInterval(() => {
				setCooldown((prev) => prev - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [cooldown]);

	const handleResetPassword = async (e?: React.SubmitEvent) => {
		if (e) e.preventDefault();

		const result = emailSchema.safeParse(email);
		if (!result.success && result.error.issues[0]) {
			setError(result.error.issues[0].message);
			return;
		}

		setError("");
		setIsLoading(true);

		try {
			const { error: supabaseError } =
				await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
						"/auth?view=update-password"
					)}`,
				});

			if (supabaseError) throw supabaseError;

			setIsSent(true);
			setCooldown(60);
			toast.success("Ссылка для сброса отправлена на почту");
		} catch (err) {
			const msg = getErrorMessage(err);
			if (msg.includes("rate limit")) {
				toast.error("Слишком много попыток. Подождите немного.");
			} else {
				toast.error(msg || "Ошибка при отправке ссылки");
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (isSent) {
		return (
			<AuthCard
				title="Проверьте почту"
				description={`Мы отправили ссылку на ${email}`}
			>
				<div className="flex flex-col items-center space-y-6 py-4">
					<div className="relative">
						<div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
						<CheckCircle2 size={64} className="relative text-primary" />
					</div>

					<p className="text-center text-sm text-muted-foreground">
						Не получили письмо? Проверьте папку Спам.
					</p>

					<div className="w-full space-y-3">
						<Button
							variant="outline"
							disabled={cooldown > 0 || isLoading}
							onClick={() => handleResetPassword()}
							className="w-full h-12"
						>
							{cooldown > 0 ? (
								<>
									<Clock className="w-4 h-4 mr-2 animate-pulse" />
									Повторно через {cooldown} сек
								</>
							) : (
								"Отправить ссылку повторно"
							)}
						</Button>

						<Button
							variant="ghost"
							onClick={() => setIsSent(false)}
							className="w-full text-xs text-muted-foreground"
						>
							Ввести другой email
						</Button>
					</div>
				</div>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			title="Сброс пароля"
			description="Введите email для получения ссылки"
			footerLink={{
				text: "Вспомнили пароль?",
				label: "Войти",
				href: "/auth?view=login",
			}}
			isLoading={isLoading}
		>
			<form onSubmit={handleResetPassword} className="space-y-6" noValidate>
				<ValidatedInput
					label="Email"
					type="email"
					placeholder="mail@example.com"
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
					disabled={isLoading || !email}
					className="w-full h-12 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
				>
					{isLoading ? "Отправка..." : "Отправить ссылку"}
				</Button>
			</form>
		</AuthCard>
	);
}
