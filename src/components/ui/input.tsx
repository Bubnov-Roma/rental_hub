import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"file:text-foreground placeholder:text-muted-foreground selection:bg-primary h-11 selection:text-primary-foreground w-full min-w-0 rounded-md px-3 py-1 text-base outline-none file:inline-flex file:h-7  file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				// "dark:bg-input/30 border-input h-9 border bg-transparent transition-[color,box-shadow] file:border-0",
				// "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
				"glass-input",
				className
			)}
			{...props}
		/>
	);
}

export { Input };
