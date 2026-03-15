"use client";

import { MapPin, MessageCircle, Phone } from "lucide-react";
import {
	SUPPORT_ADDRESS_DEFAULT,
	SUPPORT_PHONE_DEFAULT,
	SUPPORT_TELEGRAM_DEFAULT,
	type SupportInfo,
} from "@/constants";
import { cn } from "@/lib/utils";

interface SupportBlockProps {
	info?: Partial<SupportInfo>;
	variant?: "compact" | "full" | "inline";
	className?: string;
	label?: string;
}

export function SupportBlock({
	info,
	variant = "full",
	className,
	label = "Нужна помощь?",
}: SupportBlockProps) {
	const phone = info?.phone ?? SUPPORT_PHONE_DEFAULT;
	const telegram = info?.telegram ?? SUPPORT_TELEGRAM_DEFAULT;
	const address = info?.address ?? SUPPORT_ADDRESS_DEFAULT;

	if (variant === "inline") {
		return (
			<p
				className={cn(
					"flex flex-col sm:flex-row flex-wrap items-center gap-3 text-xs text-muted-foreground",
					className
				)}
			>
				<span>Есть вопросы по заказу?</span>
				<span className="block sm:inline">
					<a
						href={`tel:${phone.replace(/\s/g, "")}`}
						className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
					>
						<Phone size={11} />
						{phone}
					</a>
					<span className="px-2">·</span>
					<a
						href={telegram}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
					>
						<MessageCircle size={11} />
						Написать в Telegram
					</a>
				</span>
			</p>
		);
	}

	if (variant === "compact") {
		return (
			<div className={cn("flex items-center gap-3", className)}>
				<a
					href={`tel:${phone.replace(/\s/g, "")}`}
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<Phone size={14} />
					{phone}
				</a>
				<span className="text-muted-foreground/30">·</span>
				<a
					href={telegram}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<MessageCircle size={14} />
					Telegram
				</a>
			</div>
		);
	}

	// full
	return (
		<div className={cn("card-surface px-5 py-4 space-y-3", className)}>
			{label && <p className="card-section-label">{label}</p>}
			<div className="space-y-2.5">
				<a
					href={`tel:${phone.replace(/\s/g, "")}`}
					className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
				>
					<Phone
						size={14}
						className="text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors"
					/>
					{phone}
				</a>
				<a
					href={telegram}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
				>
					<MessageCircle
						size={14}
						className="text-muted-foreground/40 shrink-0 group-hover:text-sky-400 transition-colors"
					/>
					Написать в Telegram
				</a>
				<div className="flex items-start gap-3 text-sm text-muted-foreground">
					<MapPin
						size={14}
						className="text-muted-foreground/40 shrink-0 mt-0.5"
					/>
					{address}
				</div>
			</div>
		</div>
	);
}
