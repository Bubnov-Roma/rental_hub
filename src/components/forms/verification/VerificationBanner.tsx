"use client";

import { ShieldCheckIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui";
import { Button } from "@/components/ui/button";

export function VerificationBanner() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;
	return (
		<Dialog open={isVisible} onOpenChange={setIsVisible}>
			<DialogTrigger asChild></DialogTrigger>
			<DialogContent className="group overflow-hidden bg-background/60 rounded-[32px] bg-linear-to-r from-blue-500/10 via-purple-200/30 to-blue-500/10">
				<div className="absolute -bottom-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-green-500/50 transition-all duration-1000" />
				<DialogHeader className="flex items-center justify-center">
					<ShieldCheckIcon
						weight="fill"
						size={32}
						className="inline w-14 h-14 rounded-2xl bg-green-500/10 items-center justify-center text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(37,222,119,0.2)]"
					/>
					<DialogTitle className="text-3xl text-center font-bold text-foreground flex-col justify-center items-center gap-2">
						<p>Аренда</p>
						<p>без залога</p>
					</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm sm:text-base flex text-center">
						Заполните анкету один раз и арендуйте без страхового депозита
						всегда.
					</DialogDescription>
				</DialogHeader>
				<Button
					asChild
					size="xl"
					variant="brand"
					className="flex gap-2 hover:shadow-primary transition-colors duration-600 rounded-3xl"
				>
					<Link href="/dashboard/profile">Заполнить анкету</Link>
				</Button>
			</DialogContent>
		</Dialog>
	);
}
