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
			viewBox="0 0 385 638"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			style={{ height: `${size}px`, width: "auto", ...style }}
			className={cn("text-primary shrink-0", className)}
			{...props}
		>
			<path d="M0 638V0H8C73.7998 244.763 73.6362 384.453 8 638H0Z" />
			<path d="M92.5 638V0H169.5C233.081 248.577 232.886 388.299 169.5 638H92.5Z" />
			<path d="M252.5 638V0H261.5C432.804 212.456 417.05 425.829 261.5 638H252.5Z" />
		</svg>
	);
};
