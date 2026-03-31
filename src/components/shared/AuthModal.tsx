"use client";

import { AnimatePresence, motion } from "framer-motion";
import { OTPInput } from "input-otp";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { sendOtpCode } from "@/actions/auth-actions";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	Input,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { loginSchema } from "@/schemas";
import type { AuthModalIntent } from "@/store/auth-modal.store";
import { getErrorMessage } from "@/utils";

type Step = "options" | "otp" | "password" | "success";
const RESEND_COOLDOWN = 120;

interface AuthModalProps {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	intent: AuthModalIntent;
}

export function AuthModal({ open, onOpenChange, intent }: AuthModalProps) {
	const router = useRouter();
	const [step, setStep] = useState<Step>("options");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

	// Сброс при закрытии
	useEffect(() => {
		if (!open) {
			setTimeout(() => {
				setStep("options");
				setEmail("");
				setPassword("");
				setErrors({});
				setCooldown(RESEND_COOLDOWN);
			}, 300);
		}
	}, [open]);

	// Таймер повторной отправки
	useEffect(() => {
		if (cooldown <= 0) return;
		const t = setInterval(() => {
			setCooldown((p) => {
				if (p <= 1) {
					clearInterval(t);
					return 0;
				}
				return p - 1;
			});
		}, 1000);
		return () => clearInterval(t);
	}, [cooldown]);

	// ── Роутинг после успешного входа ───────────────────────────────────────
	const handleSuccess = () => {
		setStep("success");
		setTimeout(() => {
			onOpenChange(false);
			switch (intent.type) {
				case "auth":
					break;
				case "redirect":
					router.push(intent.url);
					break;
				case "booking":
					router.push(
						intent.equipmentId
							? `/checkout?equipment=${intent.equipmentId}`
							: "/checkout"
					);
					break;
				case "callback":
					intent.fn();
					break;
			}
		}, 1500);
	};

	// ── Google ──
	const handleGoogle = async () => {
		setIsLoading(true);
		const callbackUrl =
			intent.type === "redirect"
				? intent.url
				: intent.type === "booking"
					? `/checkout${intent.equipmentId ? `?equipment=${intent.equipmentId}` : ""}`
					: "/dashboard";
		await signIn("google", { callbackUrl });
	};

	// ── Yandex ──
	const handleYandex = async () => {
		setIsLoading(true);

		const callbackUrl =
			intent.type === "redirect"
				? intent.url
				: intent.type === "booking"
					? `/checkout${intent.equipmentId ? `?equipment=${intent.equipmentId}` : ""}`
					: "/dashboard";
		await signIn("yandex", { callbackUrl });
	};

	// ── OTP: отправка кода ────────────────────────────────────────────────────
	const handleSendOtp = async () => {
		if (!email.trim()) {
			toast.error("Введите email");
			return;
		}
		setIsSending(true);
		try {
			const res = await sendOtpCode(email);
			if (res.success) {
				setStep("otp");
				setCooldown(RESEND_COOLDOWN);
				toast.success("Код отправлен на почту");
			} else {
				toast.error(res.error || "Не удалось отправить код");
			}
		} catch (e) {
			toast.error(getErrorMessage(e));
		} finally {
			setIsSending(false);
		}
	};

	// ── OTP: проверка кода ────────────────────────────────────────────────────
	const handleOtpComplete = async (code: string) => {
		setIsVerifying(true);
		try {
			const res = await signIn("otp", { email, code, redirect: false });
			if (res?.ok) {
				handleSuccess();
			} else {
				toast.error("Неверный или просроченный код");
			}
		} catch (e) {
			toast.error(getErrorMessage(e));
		} finally {
			setIsVerifying(false);
		}
	};

	// ── Пароль ────────────────────────────────────────────────────────────────
	const handlePasswordLogin = async (e: React.SubmitEvent) => {
		e.preventDefault();
		const result = loginSchema.safeParse({ email, password });
		if (!result.success) {
			const errs: Record<string, string> = {};
			result.error.issues.forEach((i) => {
				errs[i.path[0] as string] = i.message;
			});
			setErrors(errs);
			return;
		}
		setErrors({});
		setIsLoading(true);
		try {
			const res = await signIn("otp", {
				email,
				password,
				redirect: false,
			});
			if (res?.error) {
				toast.error("Неверный email или пароль");
				return;
			}
			handleSuccess();
		} catch (e) {
			toast.error(getErrorMessage(e));
		} finally {
			setIsLoading(false);
		}
	};

	const isAnyLoading = isLoading || isSending || isVerifying;
	const formatCooldown = (s: number) =>
		`${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

	// ── Заголовок по intent ───────────────────────────────────────────────────
	const title =
		intent.type === "booking"
			? "Войдите для бронирования"
			: intent.type === "redirect" || intent.type === "callback"
				? "Требуется авторизация"
				: "Добро пожаловать";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-3xl p-0 overflow-hidden max-w-sm border border-foreground/8">
				<DialogTitle className="hidden">Авторизация</DialogTitle>
				<DialogDescription className="hidden">
					Выберите способ входа в систему
				</DialogDescription>
				<AnimatePresence mode="wait" initial={false}>
					{/* ── Успех ── */}
					{step === "success" && (
						<motion.div
							key="success"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
							className="flex flex-col items-center justify-center py-12 px-8 text-center gap-4"
						>
							<div className="bg-green-500/10 rounded-full p-4">
								<CheckCircle2 className="text-green-500" size={48} />
							</div>
							<div>
								<h2 className="text-xl font-black uppercase italic">
									Успешно!
								</h2>
								<p className="text-sm text-muted-foreground mt-1">
									Выполняется вход...
								</p>
							</div>
							<Loader2
								className="animate-spin text-muted-foreground/40"
								size={20}
							/>
						</motion.div>
					)}

					{/* ── Опции входа ── */}
					{step === "options" && (
						<motion.div
							key="options"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
							className="p-6 space-y-4"
						>
							<div className="space-y-2 pb-4">
								<h2 className="text-xl font-black uppercase italic">{title}</h2>
								<p className="text-sm text-muted-foreground pl-2">
									Выберите способ входа
								</p>
							</div>

							{/* Email */}
							<div className="relative">
								<Mail className="z-1 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-4 w-4" />
								<Input
									type="email"
									placeholder="Введите ваш email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
									className="pl-9 h-11 rounded-xl"
									disabled={isAnyLoading}
								/>
							</div>

							<Button
								className="w-full h-11 rounded-xl font-bold"
								onClick={handleSendOtp}
								disabled={isAnyLoading || !email}
							>
								{isSending ? (
									<Loader2 className="animate-spin" size={16} />
								) : (
									"Получить код"
								)}
							</Button>

							<div className="relative flex justify-center text-xs uppercase my-2">
								<span className="bg-background px-2 text-muted-foreground z-10">
									Или
								</span>
								<div className="absolute top-1/2 left-0 w-full h-px bg-border z-0" />
							</div>

							<div className="w-full flex gap-4 justify-center p-2">
								<Button
									variant="social"
									className="flex-1 gap-2 h-11"
									onClick={handleGoogle}
								>
									<svg
										viewBox="0 0 24 24"
										width="18"
										height="18"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
									Google
								</Button>

								<Button
									variant="social"
									className="flex-1 gap-2 h-11"
									onClick={handleYandex}
								>
									<svg
										viewBox="0 0 24 24"
										width="18"
										height="18"
										xmlns="http://www.w3.org/2000/svg"
									>
										<circle cx="12" cy="12" r="12" fill="#FC3F1D" />
										<path
											d="M14 18.5V5.5H11C9.1 5.5 7.5 7.1 7.5 9C7.5 10.9 9.1 12.5 11 12.5H14 M7.5 18.5L11.5 12.5"
											fill="none"
											stroke="white"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									Яндекс
								</Button>
							</div>

							{/* Переключатель на пароль */}
							<Button
								variant="link"
								onClick={() => setStep("password")}
								className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
							>
								Войти по паролю →
							</Button>
						</motion.div>
					)}

					{/* ── OTP ── */}
					{step === "otp" && (
						<motion.div
							key="otp"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
							className="p-6 space-y-6"
						>
							<div className="space-y-1">
								<button
									type="button"
									onClick={() => setStep("options")}
									className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
								>
									← Назад
								</button>
								<h2 className="text-xl font-black uppercase italic">
									Введите код
								</h2>
								<p className="text-sm text-muted-foreground">
									Отправили 6-значный код на{" "}
									<span className="text-foreground font-medium">{email}</span>
								</p>
							</div>

							<OTPInput
								maxLength={6}
								onComplete={handleOtpComplete}
								disabled={isVerifying}
								containerClassName="flex gap-2 justify-center"
								render={({ slots }) => (
									<div className="flex gap-2">
										{slots.map((slot, idx) => (
											<div
												key={idx}
												className={cn(
													"w-10 h-14 flex items-center justify-center text-xl font-bold rounded-xl border transition-all duration-200",
													slot.isActive
														? "border-primary ring-2 ring-primary/20 scale-105"
														: "border-foreground/10 bg-foreground/4"
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

							{isVerifying && (
								<div className="flex justify-center">
									<Loader2 className="animate-spin text-primary" size={20} />
								</div>
							)}

							{cooldown > 0 ? (
								<p className="text-center text-xs text-muted-foreground">
									Повторно через{" "}
									<span className="font-mono tabular-nums">
										{formatCooldown(cooldown)}
									</span>
								</p>
							) : (
								<Button
									variant="ghost"
									onClick={handleSendOtp}
									disabled={isSending}
									className="w-full text-xs"
								>
									Отправить повторно
								</Button>
							)}
						</motion.div>
					)}

					{/* ── Pass ── */}
					{step === "password" && (
						<motion.div
							key="password"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
							className="p-6 space-y-10"
						>
							<div className="space-y-1">
								<h2 className="text-xl font-black uppercase italic">
									Вход по паролю
								</h2>
								<p className="text-sm text-muted-foreground pl-2">
									Звбыли пароль? Войдите по коду
								</p>
							</div>

							<form
								onSubmit={handlePasswordLogin}
								className="space-y-3"
								noValidate
							>
								<div className="pb-4 space-y-3">
									<div className="relative">
										<Mail className="z-1 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-4 w-4" />
										<Input
											type="email"
											placeholder="your@email.com"
											value={email}
											onChange={(e) => {
												setEmail(e.target.value);
												setErrors((p) => ({ ...p, email: "" }));
											}}
											className={cn(
												"pl-9 h-11 rounded-xl",
												errors.email && "border-destructive"
											)}
										/>
										{errors.email && (
											<p className="text-xs text-destructive mt-1">
												{errors.email}
											</p>
										)}
									</div>

									<div className="relative">
										<Lock className="z-1 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-4 w-4" />
										<Input
											type={showPassword ? "text" : "password"}
											placeholder="••••••••"
											value={password}
											onChange={(e) => {
												setPassword(e.target.value);
												setErrors((p) => ({ ...p, password: "" }));
											}}
											className={cn(
												"pl-9 pr-10 h-11 rounded-xl",
												errors.password && "border-destructive"
											)}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground"
											tabIndex={-1}
										>
											{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
										</button>
										{errors.password && (
											<p className="text-xs text-destructive mt-1">
												{errors.password}
											</p>
										)}
									</div>
								</div>
								<Button
									type="submit"
									className="w-full h-11 rounded-xl font-bold"
									disabled={isLoading}
								>
									{isLoading ? (
										<Loader2 className="animate-spin" size={16} />
									) : (
										"Войти"
									)}
								</Button>
							</form>

							<Button
								variant="link"
								onClick={() => setStep("options")}
								className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
							>
								← Войти по одноразовому коду
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}
