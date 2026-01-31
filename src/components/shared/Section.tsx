import { Separator } from "@radix-ui/react-select";

export function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold">{title}</h3>
				<Separator className="mt-2" />
			</div>
			{children}
		</div>
	);
}
