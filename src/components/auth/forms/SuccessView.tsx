"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
export function SuccessView() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectPath = searchParams.get("redirect") || "/dashboard";

	useEffect(() => {
		const timer = setTimeout(() => router.push(redirectPath), 2000);
		return () => clearTimeout(timer);
	}, [redirectPath, router.push]);

	return (
		<div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in-95 duration-500">
			<div className="relative">
				<div className="absolute inset-0 blur-2xl bg-accent-glow/50 rounded-full" />
				<CheckCircle2 size={80} className="relative text-accent-glow" />
			</div>
			<h2 className="text-2xl font-bold text-foreground">Успешный вход!</h2>
			<p className="text-foreground/50">Перенаправляем в личный кабинет...</p>
		</div>
	);
}
