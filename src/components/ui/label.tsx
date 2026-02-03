"use client";

import { Label as LabelPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
	required?: boolean;
	optional?: boolean;
	error?: boolean;
}

function Label({
	className,
	required,
	error,
	optional,
	children,
	...props
}: LabelProps) {
	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn(
				"flex text-foreground/70 items-center gap-1.5 text-xs tracking-wider px-1 leading-none font-stretch-50% select-none",
				"group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				"peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				required ? "text-foreground/80" : "text-foreground/50",
				className
			)}
			{...props}
		>
			{children}
			{required && (
				<span className={cn(error ? "text-red-400/60" : "text-blue-400/60")}>
					*
				</span>
			)}
		</LabelPrimitive.Root>
	);
}

export { Label };
