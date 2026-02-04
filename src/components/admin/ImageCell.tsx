"use client";

import { Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button, ImageUploader } from "@/components/ui";
import { uploadEquipmentImage } from "@/lib/supabase/storage";

interface ImageCellProps {
	equipmentId: string;
	initialImages: string[];
}

export function ImageCell({ equipmentId, initialImages }: ImageCellProps) {
	const [images, setImages] = useState(initialImages);
	const [isUploading, setIsUploading] = useState(false);
	const [showUploader, setShowUploader] = useState(false);

	const handleUpload = async (file: File | null) => {
		if (!file) return;

		setIsUploading(true);
		try {
			const publicUrl = await uploadEquipmentImage(file, equipmentId);
			setImages((prev) => [...prev, publicUrl]);
			setShowUploader(false);
		} catch (error) {
			console.error("Upload failed", error);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<div className="flex -space-x-3 overflow-hidden">
				{images.map((url, i) => (
					<div
						key={`${url.toString()}${i}`}
						className="relative w-10 h-10 rounded-lg border-2 border-background overflow-hidden bg-muted"
					>
						<Image src={url} alt="Equipment" fill className="object-cover" />
					</div>
				))}
			</div>

			{showUploader ? (
				<div className="fixed inset-0 z-100 bg-black/50 flex items-center justify-center p-4">
					<div className="bg-background p-6 rounded-3xl max-w-md w-full relative">
						<Button
							variant="ghost"
							className="absolute top-2 right-2"
							onClick={() => setShowUploader(false)}
						>
							Закрыть
						</Button>
						<ImageUploader onFileSelect={handleUpload} aspectRatio={1.5} />
						{isUploading && (
							<div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-3xl">
								<Loader2 className="animate-spin text-primary mb-2" />
								<p className="text-sm font-medium">Загружаем в облако...</p>
							</div>
						)}
					</div>
				</div>
			) : (
				<Button
					variant="outline"
					size="icon"
					className="w-10 h-10 rounded-lg border-dashed"
					onClick={() => setShowUploader(true)}
				>
					<Plus size={16} />
				</Button>
			)}
		</div>
	);
}
