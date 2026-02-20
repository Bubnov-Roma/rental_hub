import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
	preview: string | null;
	aspectRatio: number;
	onFileReady: (image: string | null) => void;
	onClear: () => void;
}

export function FileDropzone({
	preview,
	aspectRatio,
	onFileReady,
	onClear,
}: FileDropzoneProps) {
	const [isDragging, setIsDragging] = useState(false);

	const processFile = (file: File) => {
		if (!file.type.startsWith("image/")) return;
		const reader = new FileReader();
		reader.onload = () => onFileReady(reader.result as string);
		reader.readAsDataURL(file);
	};

	return (
		<label
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragging(true);
			}}
			onDragLeave={() => setIsDragging(false)}
			onDrop={(e) => {
				e.preventDefault();
				setIsDragging(false);
				if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
			}}
			className={cn(
				"relative group block overflow-hidden border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer hover:bg-muted-foreground/5",
				isDragging
					? "border-primary bg-primary/5 scale-[1.02]"
					: "border-foreground/10 hover:border-foreground/20",
				preview ? "border-transparent" : ""
			)}
		>
			<AspectRatio ratio={aspectRatio}>
				{preview ? (
					<Image src={preview} alt="Preview" fill className="object-cover" />
				) : (
					<span className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground group-hover:text-foreground/80 group-hover:scale-102 transition-all duration-300">
						<Upload
							size={30}
							className={cn(
								"bg-muted-foreground/5 group-hover:bg-muted-foreground/20 hover:text-foreground rounded-full p-2 transition-colors duration-300",
								isDragging && "text-primary bg-primary/30"
							)}
						/>
						<span className="text-[10px] font-bold uppercase tracking-widest">
							Загрузить файл
						</span>
					</span>
				)}
				<input
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => {
						if (e.target.files?.[0]) {
							processFile(e.target.files[0]);
							e.target.value = "";
						}
					}}
				/>
			</AspectRatio>
			{preview && (
				<Button
					variant="destructive"
					size="icon"
					onClick={(e) => {
						e.preventDefault();
						onClear();
					}}
					className={cn(
						"absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
					)}
				>
					<X size={16} />
				</Button>
			)}
		</label>
	);
}
