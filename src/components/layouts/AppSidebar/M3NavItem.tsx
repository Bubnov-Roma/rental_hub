"use client";

import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function M3NavItem({
	href,
	isActive,
	label,
	icon: Icon,
}: {
	href: string;
	isActive: boolean;
	label: string;
	icon?: Icon;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-4 px-4 rounded-2xl h-14 transition-all duration-200 group/m3",
				isActive
					? "bg-sidebar-accent-foreground/5 text-foreground font-bold shadow-sm"
					: "text-muted-foreground/70 hover:bg-muted-foreground/5 hover:text-foreground hover:shadow-sm"
			)}
		>
			{Icon ? (
				<Icon
					size={20}
					className={cn(
						"shrink-0 transition-transform duration-200 group-hover/m3:scale-110",
						isActive ? "text-primary" : "text-muted-foreground/60"
					)}
				/>
			) : (
				<span
					className={cn(
						"h-1.5 w-1.5 rounded-full shrink-0 ml-1",
						isActive ? "bg-primary" : "bg-muted-foreground/30"
					)}
				/>
			)}
			<span className="text-base font-medium truncate">{label}</span>
			{isActive && (
				<div className="ml-auto h-5 w-1 rounded-full bg-primary shrink-0" />
			)}
		</Link>
	);
}
