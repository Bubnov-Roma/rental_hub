import * as React from "react";
import type { CornerRounding, InputPosition } from "@/types";
import {
	cn,
	getBorderClasses,
	getCornerStyles,
	getRoundingClasses,
} from "@/utils";

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
		return (
			<input
				ref={ref}
				className={cn(
					"h-11 flex-1 min-w-0 border px-4 py-2 text-base transition-all outline-none",
					"glass-input-neumorphic",
					"disabled:opacity-20 disabled:cursor-not-allowed",
					"md:text-sm",
					getRoundingClasses(corners),
					getBorderClasses(corners),
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
	return (
		<button
			type="button"
			ref={ref}
			className={cn(
				"h-11  border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center",
				getRoundingClasses(corners),
				getBorderClasses(corners),
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
});

InputGroupButton.displayName = "InputGroupButton";
interface InputGroupFieldProps extends React.ComponentProps<"div"> {
	corners?: CornerRounding;
}

const InputGroupField = React.forwardRef<HTMLDivElement, InputGroupFieldProps>(
	({ className, corners, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flex-1 min-w-0",
					"*:w-full",
					"[&>input]:rounded-none! [&>input]:border-r-0! [&>input]:border-b-0!",
					getRoundingClasses(corners),
					getBorderClasses(corners),
					className
				)}
				style={getCornerStyles(corners)}
				{...props}
			>
				{children}
			</div>
		);
	}
);

InputGroupField.displayName = "InputGroupField";

export {
	InputGroup,
	InputGroupItem,
	InputGroupWrapper,
	InputGroupButton,
	InputGroupField,
};
export type { InputGroupOrientation, InputPosition, CornerRounding };
