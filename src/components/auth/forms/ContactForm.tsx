"use client";

import { Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RainbowSpinner } from "@/components/shared";
import { Button, Input, Label } from "@/components/ui";
import { useOtpAuth } from "@/hooks/useOtpAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getURL } from "@/utils";

export function ContactForm({ mode }: { mode: string }) {
	const [email, setEmail] = useState("");
	const [isGooglePending, setIsGooglePending] = useState(false);

	const { sendOtpCode, isSendingCode } = useOtpAuth();
	const router = useRouter();
	const supabase = createClient();

	const handleGoogleLogin = async () => {
		setIsGooglePending(true);
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${getURL()}auth/callback`,
				},
			});

			if (error) {
				toast.error("Ошибка Google авторизации");
				setIsGooglePending(false);
			}
		} catch {
			setIsGooglePending(false);
			toast.error(
				"Произошла непредвиденная ошибка. Попробуйте повторить попытку позже"
			);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await sendOtpCode(email, "email");
		if (success) {
			router.push(`/auth?view=otp&email=${encodeURIComponent(email)}`);
		}
	};

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label className="text-sm font-medium text-foreground/70 ml-1">
						{mode === "register" ? "Email для регистрации" : "Email для входа"}
					</Label>
					<div className="relative">
						<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 z-1" />
						<Input
							type="email"
							placeholder="example@mail.com"
							className={cn(
								"glass-input w-full pl-12",
								"h-11 min-w-0 text-base transition-all outline-none",
								"disabled:opacity-20 disabled:cursor-not-allowed",
								"md:text-sm"
							)}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
				</div>

				<Button
					type="submit"
					size="xl"
					className="w-full"
					disabled={isSendingCode}
				>
					{isSendingCode ? (
						<Loader2 className="animate-spin" />
					) : (
						"Получить код"
					)}
				</Button>
			</form>

			<div className="relative py-2">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t border-foreground/10"></span>
				</div>
				<div className="relative flex justify-center text-xs uppercase ">
					<span className="bg-background rounded-xl border px-2 text-foreground/30">
						Или
					</span>
				</div>
			</div>

			<Button
				variant="social"
				size="xl"
				disabled={isGooglePending || isSendingCode}
				className="w-full gap-3"
				onClick={handleGoogleLogin}
			>
				{isGooglePending ? (
					<RainbowSpinner />
				) : (
					<div className="flex items-center gap-3">
						<Image
							src="https://www.svgrepo.com/show/475656/google-color.svg"
							width={20}
							height={20}
							alt="Google"
						/>
						Войти через Google
					</div>
				)}
			</Button>

			<div className="text-center">
				<Link
					href="/auth?view=forgot"
					className="underline text-sm text-foreground/50 hover:text-primary transition-colors"
				>
					Не удаётся войти?
				</Link>
			</div>
		</div>
	);
}
