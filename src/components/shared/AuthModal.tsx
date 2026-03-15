"use client";

import { Loader2, Mail } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Input,
} from "@/components/ui";
import { useOtpAuth } from "@/hooks";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getURL } from "@/utils";

export function AuthModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const [step, setStep] = useState<"email" | "otp">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
	const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

	const [isLoading, setIsLoading] = useState(false);
	const supabase = createClient();
	const { sendOtpCode, verifyOtpCode, isSendingCode, isVerifyingCode } =
		useOtpAuth();

	const handleSend = async () => {
		if (!email.includes("@")) {
			toast.error("Введите корректный email");
			return;
		}
		const ok = await sendOtpCode(email, "email");
		if (ok) setStep("otp");
	};

	const handleVerify = async () => {
		const code = otp.join("");
		if (code.length < 6) return;
		const ok = await verifyOtpCode(email, code, "email");
		if (ok) {
			onOpenChange(false);
		}
	};

	const handleOtpInput = (i: number, val: string) => {
		const d = val.replace(/\D/g, "").slice(-1);
		const next = [...otp];
		next[i] = d;
		setOtp(next);
		if (d && i < 5) otpRefs.current[i + 1]?.focus();
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${getURL()}auth/callback` },
		});
	};

	const content = (
		<div className="space-y-4">
			{step === "email" ? (
				<>
					<span className="relative text-xs text-muted-foreground flex justify-center sm:justify-start">
						Или укажите ваш email
					</span>
					<div className="relative">
						<Mail
							size={15}
							className="z-1 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
						/>
						<Input
							placeholder="your@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSend()}
							className="pl-9 h-12 rounded-xl"
						/>
					</div>
					<Button
						onClick={handleSend}
						disabled={isSendingCode}
						className="w-full h-12 rounded-2xl font-black uppercase italic"
					>
						{isSendingCode ? (
							<Loader2 className="animate-spin" />
						) : (
							"Получить код"
						)}
					</Button>
					<p className="text-[11px] text-center text-muted-foreground/50">
						Отправим одноразовый код
					</p>
				</>
			) : (
				<>
					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							Код отправлен на{" "}
							<span className="font-bold text-foreground">{email}</span>
						</p>
						<p className="text-xs text-muted-foreground/50">
							Не получили письмо? Проверьте папку "Спам"
						</p>
					</div>
					<div className="flex gap-2 justify-center py-2">
						{otp.map((digit, i) => (
							<input
								key={`otp-${
									// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length OTP array
									i
								}`}
								ref={(el) => {
									otpRefs.current[i] = el;
								}}
								type="text"
								inputMode="numeric"
								maxLength={1}
								value={digit}
								onChange={(e) => handleOtpInput(i, e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Backspace" && !digit && i > 0)
										otpRefs.current[i - 1]?.focus();
								}}
								className="w-10 h-12 rounded-xl text-center text-xl font-black bg-foreground/5 border border-white/10 outline-none focus:border-primary/60 focus:bg-primary/5 transition-colors"
							/>
						))}
					</div>
					<Button
						onClick={handleVerify}
						disabled={isLoading || isVerifyingCode || otp.join("").length < 6}
						className="w-full h-12 rounded-2xl font-black uppercase italic"
					>
						{isVerifyingCode ? (
							<Loader2 className="animate-spin" />
						) : (
							"Подтвердить"
						)}
					</Button>
					<Button
						variant="link"
						type="button"
						onClick={() => setStep("email")}
						className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
					>
						← Изменить email
					</Button>
				</>
			)}
		</div>
	);

	const title = "Войдите для бронирования";
	const desc =
		step === "email" ? "Войдите через Google" : "Проверьте вашу почту";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn("rounded-2xl space-y-2 sm:space-y-4 items-start")}
			>
				<DialogHeader>
					<DialogTitle className="text-xl font-black uppercase italic">
						{title}
					</DialogTitle>
					<DialogDescription>{desc}</DialogDescription>
				</DialogHeader>
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
				{content}
			</DialogContent>
		</Dialog>
	);
}
