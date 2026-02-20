import type React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
	size?: number;
}

/**
 * SVG-логотип Linza — три оптические линзы.
 */
export const Logo = ({ size = 32, className, style, ...props }: LogoProps) => {
	return (
		<svg
			viewBox="0 0 587 774"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			style={{ height: `${size}px`, width: "auto", ...style }}
			className={cn("text-primary shrink-0", className)}
			{...props}
		>
			<path d="M 117 67 C 117 180 172 280 172 385 C 172 490 117 590 117 703 Z" />
			<path d="M 209 67 C 209 180 331 280 331 385 C 331 490 209 590 209 703 Z" />
			<path d="M 369 66 C 369 180 501 280 501 385 C 501 490 369 590 369 703 Z" />
		</svg>
	);
};
