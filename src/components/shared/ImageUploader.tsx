"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Input } from "@/components/ui";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { getCroppedImg } from "@/lib/crop-image";

interface ImageUploaderProps {
	currentImageUrl?: string;
	onFileSelect: (file: File | null) => void;
	aspectRatio?: number; // 1 for square, 16/9 for video, etc.
}

export function ImageUploader({
	currentImageUrl,
	onFileSelect,
	aspectRatio = 1,
}: ImageUploaderProps) {
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(
		currentImageUrl || null
	);

	// Cropper states
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

	// Select file and show cropper
	const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const reader = new FileReader();
			reader.addEventListener("load", () =>
				setImageToCrop(reader.result as string)
			);
			const file = e.target.files[0];
			if (file) {
				reader.readAsDataURL(file);
			}
		}
	};

	// Save cropped area pixels
	const onCropComplete = useCallback((_: Area, pixels: Area) => {
		setCroppedAreaPixels(pixels);
	}, []);

	// Handle save crop
	const handleSaveCrop = async () => {
		if (!imageToCrop || !croppedAreaPixels) return;

		try {
			const croppedImageBlob = await getCroppedImg(
				imageToCrop,
				croppedAreaPixels
			);
			const file = new File([croppedImageBlob], "equipment_photo.jpg", {
				type: "image/jpeg",
			});

			const previewUrl = URL.createObjectURL(croppedImageBlob);
			setPreview(previewUrl);
			onFileSelect(file);
			setImageToCrop(null); // close cropper dialog
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className="w-full max-w-sm mx-auto">
			<div className="relative group overflow-hidden border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
				<AspectRatio ratio={aspectRatio}>
					{preview ? (
						<Image src={preview} alt="Preview" fill className="object-cover" />
					) : (
						<div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
							<Upload size={32} />
							<span className="text-xs font-medium uppercase tracking-wider">
								Загрузить фото
							</span>
						</div>
					)}
					<Input
						type="file"
						accept="image/*"
						className="absolute inset-0 opacity-0 cursor-pointer"
						onChange={onSelectFile}
					/>
				</AspectRatio>

				{preview && (
					<Button
						variant="destructive"
						size="icon"
						onClick={() => {
							setPreview(null);
							onFileSelect(null);
						}}
						className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<X size={14} />
					</Button>
				)}
			</div>

			{/* Cropper dialog */}
			<Dialog open={!!imageToCrop} onOpenChange={() => setImageToCrop(null)}>
				<DialogContent className="sm:max-w-150  border-white/10 text-foreground">
					<DialogHeader>
						<DialogTitle>Настройка кадрирования</DialogTitle>
					</DialogHeader>

					<div className="relative h-100 w-full bg-background/80 rounded-xl overflow-hidden mt-4">
						{imageToCrop && (
							<Cropper
								image={imageToCrop}
								crop={crop}
								zoom={zoom}
								aspect={aspectRatio}
								onCropChange={setCrop}
								onZoomChange={setZoom}
								onCropComplete={onCropComplete}
							/>
						)}
					</div>

					<div className="py-6 space-y-4">
						<div className="flex items-center gap-4">
							<span className="text-xs uppercase font-bold text-muted-foreground">
								Зум
							</span>
							<Slider
								value={[zoom]}
								min={1}
								max={3}
								step={0.1}
								onValueChange={([v]) => setZoom(v || 1)}
								className="flex-1"
							/>
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button variant="ghost" onClick={() => setImageToCrop(null)}>
							Отмена
						</Button>
						<Button onClick={handleSaveCrop}>Применить</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
