import { XIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui";

export function Lightbox({
	src,
	title,
	onClose,
}: {
	src: string;
	title: string;
	onClose: () => void;
}) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <thus>
		<fieldset
			className="fixed inset-0 z-100 flex items-center justify-center bg-background/90 backdrop-blur-sm"
			onClick={onClose}
		>
			<Button
				variant="brand"
				onClick={onClose}
				className="absolute bottom-8 right-8 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
			>
				<XIcon size={18} className="text-foreground" />
			</Button>
			<button
				type="button"
				className="relative w-full h-full max-w-5xl max-h-[90vh] m-4 cursor-default"
				onClick={(e) => e.stopPropagation()}
			>
				<Image src={src} fill className="object-contain" alt={title} />
			</button>
		</fieldset>
	);
}
