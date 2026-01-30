import { motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import { RainbowSpinner } from "@/components/shared";
import { Button } from "@/components/ui";
import { cn } from "@/utils";

interface NeonSubmitButtonProps {
	isSubmitting: boolean;
	disabled?: boolean;
}

export const SubmitButton = ({
	isSubmitting,
	disabled = false,
}: NeonSubmitButtonProps) => {
	const isDisabled = isSubmitting || disabled;

	return (
		<div
			className={cn(
				"relative group p-0.5 h-fit inline-block rounded-full overflow-hidden shadow-md transition-all duration-300",
				!isDisabled ? "active:scale-[0.98] shadow-md" : "opacity-90"
			)}
		>
			{isSubmitting && (
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[conic-gradient(from_0deg,#3b82f6,#22d3ee,#3b82f6,#f472b6,#3b82f6)] opacity-90"
					style={{ willChange: "transform" }}
				/>
			)}
			<Button
				disabled={isDisabled}
				className={cn(
					"relative rounded-2x w-full justify-center items-center transition-all duration-200 z-10 md:w-auto",
					isDisabled
						? "bg-muted text-foreground/50 cursor-not-allowed"
						: "text-foreground"
				)}
			>
				{isSubmitting ? (
					<RainbowSpinner />
				) : (
					<div className="flex items-center gap-2">
						<span className="hidden md:inline">Отправить</span>
						<SendHorizontal className="w-5 h-5 md:hidden" />
					</div>
				)}
			</Button>
		</div>
	);
};
