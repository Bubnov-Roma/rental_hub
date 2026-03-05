import { SendHorizontal } from "lucide-react";
import { RainbowSpinner } from "@/components/shared";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

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
		<Button
			disabled={isDisabled}
			className={cn(
				"relative rounded-xl justify-center items-center transition-all duration-200 z-10 md:w-auto",
				isDisabled && "bg-muted text-foreground/50 cursor-not-allowed"
			)}
		>
			<div className="flex items-center gap-2">
				{isSubmitting ? (
					<>
						<span>Отправляем</span>
						<RainbowSpinner size={16} />
					</>
				) : (
					<>
						<span>Отправить</span>
						<SendHorizontal className="w-5 h-5" />
					</>
				)}
			</div>
		</Button>
	);
};
