"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function SuccessView() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectPath = searchParams.get("redirect") || "/dashboard";

	useEffect(() => {
		// Небольшая задержка, чтобы пользователь успел порадоваться
		const timer = setTimeout(() => {
			router.push(redirectPath);
			router.refresh(); // Обновляем данные сессии
		}, 2000);
		return () => clearTimeout(timer);
	}, [redirectPath, router]);

	return (
		<div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl animate-in zoom-in-95 fade-in duration-500">
			<div className="flex flex-col items-center justify-center text-center space-y-6">
				<div className="relative">
					<div className="absolute inset-0 blur-2xl bg-green-500/20 rounded-full" />
					<div className="relative bg-background rounded-full p-2 border border-green-500/20">
						<CheckCircle2 size={64} className="text-green-500" />
					</div>
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-black italic uppercase tracking-wide">
						Успешно!
					</h2>
					<p className="text-muted-foreground">Выполняется вход в систему...</p>
				</div>

				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
			</div>
		</div>
	);
}
