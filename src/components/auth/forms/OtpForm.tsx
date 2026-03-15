"use client";

import { OTPInput } from "input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { useOtpAuth } from "@/hooks/use-otp-auth";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/utils";

const RESEND_COOLDOWN_SEC = 120;

export function OtpForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	// Email передаётся в URL при редиректе из OtpLoginForm
	const email = searchParams.get("email") || "";

	const { verifyOtpCode, sendOtpCode, isSendingCode } = useOtpAuth();
	const [isVerifying, setIsVerifying] = useState(false);

	// Таймер обратного отсчёта
	const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);

	useEffect(() => {
		// Запускаем таймер сразу при монтировании —
		// пользователь только что получил первый код
		if (cooldown <= 0) return;
		const timer = setInterval(() => {
			setCooldown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, [cooldown]);

	const handleComplete = async (code: string) => {
		setIsVerifying(true);
		try {
			const success = await verifyOtpCode(email, code, "email");
			if (success) {
				router.push("/auth?view=success&redirect=/dashboard");
			}
		} catch (err) {
			toast.error(getErrorMessage(err) || "Ошибка проверки кода");
		} finally {
			setIsVerifying(false);
		}
	};

	const handleResend = async () => {
		if (!email) {
			toast.error("Email не найден, вернитесь и введите адрес заново");
			return;
		}
		// Вызываем sendOtpCode напрямую с email из URL —
		// не полагаемся на lastContact внутри хука (тот экземпляр был в OtpLoginForm)
		const success = await sendOtpCode(email, "email");
		if (success) {
			setCooldown(RESEND_COOLDOWN_SEC);
		}
	};

	const isLoading = isVerifying || isSendingCode;

	// Форматируем mm:ss
	const formatCooldown = (sec: number) => {
		const m = Math.floor(sec / 60);
		const s = sec % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<AuthCard
			title="Введите код"
			description={`Мы отправили код подтверждения на ${email}`}
			footerLink={{
				text: "Ошиблись почтой?",
				label: "Назад",
				href: "/auth?view=otp-login",
			}}
			isLoading={isLoading}
		>
			<div className="flex flex-col items-center space-y-8">
				<OTPInput
					maxLength={6}
					onComplete={handleComplete}
					disabled={isLoading}
					containerClassName="flex gap-2 justify-center"
					render={({ slots }) => (
						<div className="flex gap-2">
							{slots.map((slot, idx) => (
								<div
									key={`${idx}+${slot.char}`}
									className={cn(
										"w-10 h-14 flex items-center justify-center text-xl font-bold rounded-lg border bg-background transition-all duration-200",
										slot.isActive
											? "border-primary ring-2 ring-primary/20 scale-105 z-10"
											: "border-white/10 bg-foreground/5 text-muted-foreground"
									)}
								>
									{slot.char}
									{slot.hasFakeCaret && (
										<div className="w-0.5 h-6 bg-primary animate-pulse" />
									)}
								</div>
							))}
						</div>
					)}
				/>

				<div className="w-full space-y-2">
					{cooldown > 0 ? (
						<p className="text-center text-xs text-muted-foreground py-2">
							Повторный запрос через{" "}
							<span className="font-mono text-foreground/70 tabular-nums">
								{formatCooldown(cooldown)}
							</span>
						</p>
					) : (
						<Button
							variant="ghost"
							onClick={handleResend}
							disabled={isLoading}
							className="w-full text-xs text-muted-foreground hover:text-foreground h-auto py-2"
						>
							Отправить код повторно
						</Button>
					)}
				</div>
			</div>
		</AuthCard>
	);
}
