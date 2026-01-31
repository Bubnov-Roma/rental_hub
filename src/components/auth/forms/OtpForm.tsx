"use client";

import { OTPInput } from "input-otp";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOtpAuth } from "@/hooks/useOtpAuth";
import { cn } from "@/utils";

export function OtpForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email") || "";
	const { verifyOtpCode, resendCode, isVerifyingCode } = useOtpAuth();

	const handleComplete = async (value: string) => {
		const success = await verifyOtpCode(email, value, "email");
		if (success) {
			router.push("/auth?view=success");
		}
	};

	return (
		<div className="flex flex-col items-center space-y-8 py-4 shadow-[0_0_15px_rgba(var(--color-accent-glow),2)] ">
			<Button
				onClick={() => router.push("/auth?view=contact")}
				variant="ghost"
				className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
			>
				<ArrowLeft size={16} /> {email}
			</Button>

			<OTPInput
				maxLength={6}
				onComplete={handleComplete}
				containerClassName="flex gap-3"
				render={({ slots }) => (
					<div className="flex gap-2">
						{slots.map((slot, idx) => (
							<div
								key={`${idx}+${slot}`}
								className={cn(
									"w-12 h-16 flex round items-center justify-center text-2xl font-bold rounded-xl border transition-all duration-300",
									slot.isActive
										? "border-primary bg-card scale-110"
										: "border-primary/60 bg-white/5 text-foreground/50"
								)}
							>
								{slot.char}
								{slot.hasFakeCaret && (
									<div className="w-px h-8 bg-primary animate-pulse" />
								)}
							</div>
						))}
					</div>
				)}
			/>

			{isVerifyingCode && <Loader2 className="animate-spin text-accent-glow" />}

			<Button
				onClick={() => resendCode()}
				className="text-sm h-14 hover:text-accent-glow transition-colors"
			>
				Отправить повторно?
			</Button>
		</div>
	);
}
