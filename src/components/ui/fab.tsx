"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { type LucideIcon, Plus, X } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FabItem {
	id: string;
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	color?: string;
	badge?: number | undefined;
}

interface FabProps {
	items: FabItem[];
	mainIcon?: ReactNode;
	className?: string;
	badge?: number;
}

const containerVariants: Variants = {
	visible: {
		transition: {
			staggerChildren: 0.05,
			staggerDirection: -1, // Вылетают снизу вверх
		},
	},
};

const itemVariants: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.8,
		y: 10,
	},
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 500,
			damping: 10,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.8,
		y: 10,
		transition: { duration: 0.1 },
	},
};

export function Fab({ items, mainIcon, className }: FabProps) {
	const [isOpen, setIsOpen] = useState(false);

	const toggleFab = useCallback(() => {
		if (typeof window !== "undefined" && navigator.vibrate) {
			navigator.vibrate(10);
		}
		setIsOpen((prev) => !prev);
	}, []);

	return (
		<div
			className={cn(
				"fixed bottom-6 right-6 z-50 flex flex-col items-center rounded-full",
				className
			)}
		>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial="hidden"
						animate="visible"
						exit="exit"
						variants={containerVariants}
						className="flex flex-col-reverse items-center gap-4 mb-4"
					>
						{items.map((item, index) => (
							<motion.div
								key={item.id}
								custom={index}
								variants={itemVariants}
								className="group relative"
							>
								{/* Label */}
								<span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-md text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
									{item.label}
								</span>
								<Button
									size="lg"
									onClick={() => {
										item.onClick();
										setIsOpen(false);
									}}
									className={cn(
										"h-12 rounded-full",
										"transform-gpu bg-card/90 shadow-lg border border-white/10",
										"hover:scale-110 active:scale-90 transition-transform duration-200",
										item.color || "text-foreground/80"
									)}
								>
									<item.icon size={20} />
									{/* Badge */}
									{item.badge && (
										<span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white shadow-sm shadow-primary/40">
											{item.badge}
										</span>
									)}
								</Button>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
			<Button
				size="lg"
				onClick={toggleFab}
				className={cn(
					"rounded-full shadow-brand-glow w-12 h-12 p-0 z-50 transition-transform duration-300",
					isOpen ? "rotate-180" : "rotate-0"
				)}
			>
				<AnimatePresence mode="wait">
					<motion.div
						key={isOpen ? "close" : "open"}
						initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
						animate={{ opacity: 1, scale: 1, rotate: 0 }}
						exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
						transition={{ duration: 0.2 }}
					>
						{isOpen ? <X size={24} /> : mainIcon || <Plus size={24} />}
					</motion.div>
				</AnimatePresence>
			</Button>
		</div>
	);
}
