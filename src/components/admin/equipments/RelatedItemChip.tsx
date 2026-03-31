import { XIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui";

export function RelatedItemChip({
	id,
	onRemove,
}: {
	id: string;
	onRemove: () => void;
}) {
	return (
		<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground/8 border border-foreground/10 text-xs font-medium text-foreground/70 group">
			<span className="font-mono text-[10px]">{id.slice(0, 8)}…</span>
			<Button
				onClick={onRemove}
				variant="ghost"
				className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-red-400"
			>
				<XIcon size={11} />
			</Button>
		</span>
	);
}
