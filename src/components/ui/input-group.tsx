import * as React from "react";
import { cn } from "@/utils";

type InputGroupOrientation = "horizontal" | "vertical";

interface InputGroupProps extends React.ComponentProps<"div"> {
	orientation?: InputGroupOrientation;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
	({ className, orientation = "horizontal", ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flex items-stretch w-full",
					orientation === "vertical" ? "flex-col" : "flex-row",
					className
				)}
				{...props}
			/>
		);
	}
);

InputGroup.displayName = "InputGroup";

type HorizontalPosition = "left" | "middle" | "right";
type VerticalPosition = "top" | "middle" | "bottom";
type InputPosition = HorizontalPosition | VerticalPosition | "single";

type CornerRounding = {
	tl?: boolean;
	tr?: boolean;
	bl?: boolean;
	br?: boolean;
};

interface InputGroupItemProps extends React.ComponentProps<"input"> {
	position?: InputPosition;
	orientation?: InputGroupOrientation;
	corners?: CornerRounding;
}

interface InputGroupWrapperProps extends React.ComponentProps<"div"> {
	position?: InputPosition;
	orientation?: InputGroupOrientation;
	corners?: CornerRounding;
}

const InputGroupItem = React.forwardRef<HTMLInputElement, InputGroupItemProps>(
	(
		{
			className,
			position = "middle",
			orientation = "horizontal",
			corners,
			...props
		},
		ref
	) => {
		const getRoundingClasses = () => {
			if (corners) {
				const classes = [];
				if (corners.tl) classes.push("rounded-tl-xl");
				if (corners.tr) classes.push("rounded-tr-xl");
				if (corners.bl) classes.push("rounded-bl-xl");
				if (corners.br) classes.push("rounded-br-xl");
				return classes.join(" ");
			}

			if (position === "single") {
				return "rounded-xl";
			}

			if (orientation === "horizontal") {
				switch (position) {
					case "left":
						return "rounded-l-xl rounded-r-none border-r-0";
					case "middle":
						return "rounded-none border-r-0";
					case "right":
						return "rounded-r-xl rounded-l-none";
					default:
						return "rounded-none border-r-0";
				}
			} else {
				// vertical
				switch (position) {
					case "top":
						return "rounded-t-xl rounded-b-none border-b-0";
					case "middle":
						return "rounded-none border-b-0";
					case "bottom":
						return "rounded-b-xl rounded-t-none";
					default:
						return "rounded-none border-b-0";
				}
			}
		};

		const getBorderClasses = () => {
			if (corners) {
				const classes = [];
				if (!corners.tr && !corners.br) classes.push("border-r-0");
				if (!corners.br && !corners.bl) classes.push("border-b-0");
				return classes.join(" ");
			}
			return "";
		};

		return (
			<input
				ref={ref}
				className={cn(
					"h-11 flex-1 min-w-0 border px-4 py-2 text-base transition-all outline-none",
					"glass-input-neumorphic",
					"disabled:opacity-20 disabled:cursor-not-allowed",
					"md:text-sm",
					getRoundingClasses(),
					getBorderClasses(),
					className
				)}
				{...props}
			/>
		);
	}
);

InputGroupItem.displayName = "InputGroupItem";

const InputGroupWrapper = React.forwardRef<
	HTMLDivElement,
	InputGroupWrapperProps
>(
	(
		{
			className,
			position = "middle",
			orientation = "horizontal",
			corners,
			children,
			...props
		},
		ref
	) => {
		return (
			<div ref={ref} className={cn("flex items-stretch", className)} {...props}>
				{children}
			</div>
		);
	}
);

InputGroupWrapper.displayName = "InputGroupWrapper";

interface InputGroupButtonProps extends React.ComponentProps<"button"> {
	corners?: CornerRounding;
}

const InputGroupButton = React.forwardRef<
	HTMLButtonElement,
	InputGroupButtonProps
>(({ className, corners, children, ...props }, ref) => {
	const getRoundingClasses = () => {
		if (corners) {
			const classes = [];
			if (corners.tl) classes.push("rounded-tl-xl");
			if (corners.tr) classes.push("rounded-tr-xl");
			if (corners.bl) classes.push("rounded-bl-xl");
			if (corners.br) classes.push("rounded-br-xl");
			return classes.join(" ");
		}
		return "";
	};

	const getBorderClasses = () => {
		if (corners) {
			const classes = [];
			if (!corners.tr) classes.push("border-r-0");
			if (!corners.br && !corners.bl) classes.push("border-b-0");
			return classes.join(" ");
		}
		return "";
	};

	return (
		<button
			type="button"
			ref={ref}
			className={cn(
				"h-11  border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center",
				getRoundingClasses(),
				getBorderClasses(),
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
});

InputGroupButton.displayName = "InputGroupButton";

export { InputGroup, InputGroupItem, InputGroupWrapper, InputGroupButton };
export type { InputGroupOrientation, InputPosition, CornerRounding };
