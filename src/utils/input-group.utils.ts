import type { CornerRounding } from "@/components/ui/input-group";

export const getRoundingClasses = (corners?: CornerRounding): string => {
	if (!corners) return "";

	const classes: string[] = [];
	if (corners.tl) classes.push("rounded-tl-xl");
	if (corners.tr) classes.push("rounded-tr-xl");
	if (corners.bl) classes.push("rounded-bl-xl");
	if (corners.br) classes.push("rounded-br-xl");

	return classes.join(" ");
};

export const getBorderClasses = (corners?: CornerRounding): string => {
	if (!corners) return "";

	const classes: string[] = [];

	if (!corners.tr && !corners.br) {
		classes.push("border-r-0");
	}

	if (!corners.bl && !corners.br) {
		classes.push("border-b-0");
	}

	return classes.join(" ");
};

export const getCornerStyles = (
	corners?: CornerRounding
): React.CSSProperties => {
	if (!corners) return {};

	return {
		"--rounded-tl": corners.tl ? "0.75rem" : "0",
		"--rounded-tr": corners.tr ? "0.75rem" : "0",
		"--rounded-bl": corners.bl ? "0.75rem" : "0",
		"--rounded-br": corners.br ? "0.75rem" : "0",
	} as React.CSSProperties;
};
