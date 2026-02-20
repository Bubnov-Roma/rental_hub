import { cn } from "@/lib/utils";
import style from "@/styles/components/rainbow-spinner.module.css";

interface RainbowSpinnerProps {
	size?: number;
	centered?: boolean;
	className?: string;
}

export const RainbowSpinner = ({
	size = 32,
	centered = false,
	className,
}: RainbowSpinnerProps) => {
	const spinner = (
		<div
			className={cn(style.rainbowSpinner, className)}
			style={{
				["--spinner-size" as string]: `${size}px`,
			}}
		/>
	);

	if (centered) {
		return (
			<div className="absolute inset-0 flex items-center justify-center bg-background/10 backdrop-blur-[1px] z-50">
				{spinner}
			</div>
		);
	}

	return spinner;
};
