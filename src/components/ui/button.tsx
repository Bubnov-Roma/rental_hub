import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-[0_0_20px_var(--brand-glow)] hover:shadow-[0_0_30px_var(--brand-glow)] hover:brightness-110",
				glass:
					"bg-white/5 backdrop-blur-lg border border-white/10 text-foreground hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_15px_var(--brand-glow)]",
				social:
					"border border-foreground/10 bg-background hover:bg-blue-500/5 hover:border-blue-500/30 hover:shadow-[0_0_20px_oklch(0.6_0.17_250_/_0.12)] text-foreground active:shadow-inner",
				accent:
					"bg-background border border-primary/20 shadow-[var(--nm-shadow)] hover:shadow-[0_0_15px_rgba(var(--color-accent),0.2)] text-primary",
				neumorph:
					"bg-background shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.05)] text-foreground active:shadow-inner",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border-2 border-primary/10 bg-transparent hover:bg-primary/5 hover:border-primary/50 text-primary",
				secondary:
					"bg-secondary/50 hover:bg-secondary/100 text-secondary-foreground shadow-inner border border-white/5",
				ghost: "hover:bg-primary/10 text-muted-foreground hover:text-primary",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				xs: "h-6 rounded-2xl gap-1 px-2 has-[>svg]:px-1 text-xs",
				sm: "h-8 rounded-2xl gap-1.5 px-3 has-[>svg]:px-2.5 text-sm",
				md: "h-10 rounded-2xl gap-2 px-4 has-[>svg]:px-3 text-md",
				lg: "h-12 rounded-2xl gap-2.5 px-5 has-[>svg]:px-4 text-lg",
				xl: "h-14 rounded-2xl gap-3 px-6 has-[>svg]:px-5",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
