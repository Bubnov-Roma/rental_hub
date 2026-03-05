"use client";

import { ArrowRight, ShieldCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function VerificationBanner() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;
	return (
		<div className="relative group overflow-hidden rounded-[32px] p-px bg-linear-to-r from-blue-500/20 via-purple-500/50 to-blue-500/20">
			<div className="relative glass-container rounded-[31px] p-6 sm:p-8 overflow-hidden bg-black/40 backdrop-blur-3xl">
				<div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-green-500/80 transition-all duration-1000" />
				<Button
					variant="ghost"
					onClick={() => setIsVisible(false)}
					className="absolute w-8 h-8 top-2 right-2 p-2 rounded-full transition-all"
				>
					<X size={5} />
				</Button>
				<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex items-start gap-5">
						<div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(37,222,119,0.2)]">
							<ShieldCheck size={32} />
						</div>
						<div className="space-y-1">
							<h3 className="text-xl font-bold text-white flex items-center gap-2">
								Аренда без залога
								<Sparkles size={16} className="text-yellow-400" />
							</h3>
							<p className="text-white/60 max-w-120 text-sm sm:text-base">
								Заполните анкету клиента один раз и арендуйте любое оборудование
								без внесения страхового депозита всегда.
							</p>
						</div>
					</div>

					<Button asChild size="lg" className="glow-button px-8 rounded-2xl">
						<Link
							href="/dashboard/profile"
							className="flex items-center gap-2 hover:shadow-primary"
						>
							Заполнить анкету <ArrowRight size={18} />
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
