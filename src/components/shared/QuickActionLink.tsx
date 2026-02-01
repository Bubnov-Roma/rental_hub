import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionLinkProps {
	href: string;
	icon: React.ReactNode;
	label: string;
	description?: string;
	className?: string;
}

export function QuickActionLink({
	href,
	icon,
	label,
	description,
	className,
}: QuickActionLinkProps) {
	return (
		<Link
			href={href}
			className={cn(
				"group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
				"bg-foreground/5 border border-foreground/5 hover:bg-white/10 hover:border-foreground/10 hover:shadow-lg",
				className
			)}
		>
			<div className="flex items-center gap-4">
				{/* Иконка с мягким свечением */}
				<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-primary/70 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all duration-300">
					{icon}
				</div>

				<div className="flex flex-col">
					<span className="text-sm font-semibold text-foreground/60 group-hover:text-foreground/80">
						{label}
					</span>
					{description && (
						<span className="text-xs text-foreground/40 group-hover:text-foreground/60">
							{description}
						</span>
					)}
				</div>
			</div>

			<ChevronRight
				size={18}
				className="text-white/20 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-300"
			/>
		</Link>
	);
}
