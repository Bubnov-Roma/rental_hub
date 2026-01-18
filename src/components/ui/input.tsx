import * as React from "react";

import { cn } from "@/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				data-slot="input"
				className={cn(
					"h-11 w-full min-w-0 rounded-xl border px-4 py-2 text-base transition-all outline-none",
					"glass-input-neumorphic",
					"disabled:opacity-20 disabled:cursor-not-allowed",
					"md:text-sm",
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);

Input.displayName = "Input";

export { Input };
