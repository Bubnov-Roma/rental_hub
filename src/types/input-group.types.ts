type HorizontalPosition = "left" | "middle" | "right";
type VerticalPosition = "top" | "middle" | "bottom";

export type InputGroupOrientation = "horizontal" | "vertical";

export type InputPosition = HorizontalPosition | VerticalPosition | "single";

export type CornerRounding = {
	tl?: boolean; // top-left
	tr?: boolean; // top-right
	bl?: boolean; // bottom-left
	br?: boolean; // bottom-right
};
