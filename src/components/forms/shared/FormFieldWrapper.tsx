"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";

interface FormFieldWrapperProps {
	label: string;
	error?: string;
	children: React.ReactNode;
	className?: string;
	id?: string;
	topErrorPosition?: boolean;
	required?: boolean;
}

export const FormFieldWrapper = ({
	label,
	error,
	children,
	className,
	id,
	topErrorPosition = false,
	required = false,
}: FormFieldWrapperProps) => {
	return (
		<div className={cn("space-y-2 w-full", className)} id={id}>
			<div className="flex justify-between items-center px-1">
				<Label required={required} error={!!error}>
					{label}
				</Label>
			</div>

			<div className="relative pb-5">
				{children}
				<AnimatePresence>
					{error && (
						<motion.span
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							className={cn(
								"px-2 absolute text-[10px] font-medium text-red-400 animate-in fade-in slide-in-from-right-1 leading-none",
								topErrorPosition ? "right-0 -top-5" : "bottom-0 left-0"
							)}
						>
							{error}
						</motion.span>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
