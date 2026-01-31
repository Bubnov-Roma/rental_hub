"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
	currentImageUrl?: string | undefined;
	onFileSelect: (file: File | null) => void;
	aspectRatio?: "square" | "video";
}

export function ImageUploader({
	currentImageUrl,
	onFileSelect,
	aspectRatio = "square",
}: ImageUploaderProps) {
	const [preview, setPreview] = useState<string | null>(
		currentImageUrl || null
	);

	// Классы для смены формы: круглая для аватара, скругленный квадрат для остального
	const containerClasses =
		aspectRatio === "square"
			? "rounded-full w-32 h-32"
			: "rounded-lg w-full aspect-video";

	return (
		<div
			className={`relative group mx-auto ${aspectRatio === "square" ? "w-32" : "w-full"}`}
		>
			<div
				className={`relative overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 ${containerClasses}`}
			>
				{preview ? (
					<Image src={preview} alt="Preview" fill className="object-cover" />
				) : (
					<div className="flex flex-col items-center">
						<Upload className="h-8 w-8 text-gray-400" />
						{aspectRatio === "video" && (
							<span className="text-xs text-gray-400 mt-2">
								Загрузить фото техники
							</span>
						)}
					</div>
				)}
				<input
					type="file"
					accept="image/*"
					className="absolute inset-0 opacity-0 cursor-pointer"
					onChange={(e) => {
						const file = e.target.files?.[0] || null;
						if (file) {
							onFileSelect(file);
							setPreview(URL.createObjectURL(file));
						}
					}}
				/>
			</div>
			{preview && (
				<Button
					type="button"
					variant="destructive"
					size="icon"
					onClick={() => {
						setPreview(null);
						onFileSelect(null);
					}}
					className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
				>
					<X className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
