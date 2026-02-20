"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface SuccessViewProps {
	/** Заголовок (default: «Успешно!»)  */
	title?: string;
	/** Подзаголовок (default: «Выполняется вход в систему…») */
	description?: string;
	/** Куда редиректить. null — не редиректить, управляй снаружи через onDone */
	redirectTo?: string | null;
	/** Задержка перед редиректом, мс (default: 2000) */
	delay?: number;
	/** Вызывается после редиректа / по истечению delay */
	onDone?: () => void;
	/** Extra className для корневого div */
	className?: string;
}

export function SuccessView({
	title = "Успешно!",
	description = "Выполняется вход в систему…",
	redirectTo = "/dashboard",
	delay = 2000,
	onDone,
	className,
}: SuccessViewProps) {
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			if (redirectTo) {
				router.push(redirectTo);
				router.refresh();
			}
			onDone?.();
		}, delay);
		return () => clearTimeout(timer);
	}, [redirectTo, delay, router, onDone]);

	return (
		<div
			className={cn(
				"w-full max-w-md mx-auto p-8 rounded-3xl",
				"bg-background/40 border border-white/5 backdrop-blur-xl",
				"animate-in zoom-in-95 fade-in duration-500",
				className
			)}
		>
			<div className="flex flex-col items-center justify-center text-center space-y-6">
				{/* Иконка с мягким glow */}
				<div className="relative">
					<div className="absolute inset-0 blur-2xl bg-green-500/20 rounded-full" />
					<div className="relative bg-background rounded-full p-2 border border-green-500/20">
						<CheckCircle2 size={64} className="text-green-500" />
					</div>
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-black italic uppercase tracking-wide">
						{title}
					</h2>
					<p className="text-muted-foreground">{description}</p>
				</div>

				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
			</div>
		</div>
	);
}

/**
 * Fullscreen-обёртка — замена целой страницы.
 * Например, показывать вместо пустой корзины после успешной брони.
 */
export function SuccessScreen(props: SuccessViewProps) {
	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<SuccessView {...props} />
		</div>
	);
}
