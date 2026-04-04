"use client";

import {
	HandshakeIcon,
	ShieldCheckIcon,
	ShieldStarIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export function RoleBadge({ role }: { role: string }) {
	const r = role.toLowerCase();

	const styles: Record<string, string> = {
		admin: "bg-purple-500/15 text-purple-400 border-purple-500/20",
		manager: "bg-green-500/15 text-green-400 border-green-500/20",
		partner: "bg-amber-500/15 text-amber-400 border-amber-500/20",
		user: "bg-blue-500/15 text-blue-400 border-blue-500/20",
	};

	const icons: Record<string, React.ReactNode> = {
		admin: <ShieldStarIcon size={11} />,
		manager: <ShieldCheckIcon size={11} />,
		partner: <HandshakeIcon size={11} />,
		user: <UserIcon size={11} />,
	};

	return (
		<Badge
			variant="outline"
			className={cn(
				"text-[10px] font-bold gap-1",
				styles[r] ?? "bg-foreground/8"
			)}
		>
			{icons[r]}
			{role}
		</Badge>
	);
}
