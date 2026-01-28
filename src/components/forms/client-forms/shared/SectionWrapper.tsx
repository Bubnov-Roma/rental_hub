import { type HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/utils";

interface FormSectionProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
	className?: string;
}

export const SectionWrapper = ({
	children,
	className,
	...props
}: FormSectionProps) => {
	return (
		<motion.div
			{...props}
			className={cn(
				"grid grid-cols-1 gap-8 rounded-xl p-2 backdrop-blur-sm min-h-full",
				className
			)}
		>
			{children}
		</motion.div>
	);
};
