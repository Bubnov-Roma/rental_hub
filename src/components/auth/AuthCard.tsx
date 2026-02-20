"use client";

import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { RainbowSpinner } from "@/components/shared";

interface AuthCardProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	footerLink?: {
		text: string;
		href: string;
		label: string;
		onClick?: () => void;
	};
	isLoading?: boolean;
}

export function AuthCard({
	title,
	description,
	children,
	footerLink,
	isLoading,
}: AuthCardProps) {
	return (
		<div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4">
			<div className="text-center space-y-2">
				<div className="flex items-center justify-center">
					<Link
						href="/"
						className="text-2xl font-black tracking-tighter text-primary hover:opacity-80 transition-opacity pb-4"
					>
						<Logo size={40} />
					</Link>
				</div>
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					{title}
				</h1>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>

			<div className="glass-card p-8 rounded-2xl shadow-2xl border border-white/5 bg-background/50 backdrop-blur-xl relative overflow-hidden">
				{isLoading && (
					<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
						<RainbowSpinner />
					</div>
				)}
				{children}
			</div>

			{footerLink && (
				<p className="text-center text-sm text-muted-foreground">
					{footerLink.text}{" "}
					<Link
						href={footerLink.href}
						className="font-medium text-primary hover:underline underline-offset-4"
					>
						{footerLink.label}
					</Link>
				</p>
			)}

			<p className="text-center text-[10px] text-muted-foreground/50 px-8">
				Продолжая, вы принимаете{" "}
				<Link href="/terms" className="hover:text-foreground">
					Условия использования
				</Link>{" "}
				и{" "}
				<Link href="/privacy" className="hover:text-foreground">
					Политику конфиденциальности
				</Link>
			</p>
		</div>
	);
}
