import { cn } from "@/utils";

interface FormSectionColumnProps {
	title: string;
	indicatorColor: string;
	children: React.ReactNode;
	className?: string;
	isLast?: boolean;
	headerRight?: React.ReactNode;
}

export const SectionColumn = ({
	title,
	indicatorColor,
	children,
	className,
	isLast,
	headerRight,
}: FormSectionColumnProps) => {
	return (
		<div
			className={cn(
				"space-y-6 flex flex-col",
				isLast && "lg:border-l lg:border-foreground/5 lg:pl-8",
				className
			)}
		>
			<div className="flex items-center justify-between min-h-10">
				<div className="flex items-center gap-3">
					<div className={cn("w-1 h-4 rounded-full", indicatorColor)} />
					<h3 className="text-xs uppercase tracking-[0.2em] text-foreground/70 font-bold">
						{title}
					</h3>
				</div>
				{headerRight}
			</div>
			{children}
		</div>
	);
};
