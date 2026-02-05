"use client";

import Image from "next/image";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
} from "@/components/ui";
import { CropEditor } from "./CropEditor";
import { FileDropzone } from "./FileDropzone";

interface Props {
	currentImageUrl?: string;
	onFileSelect: (file: File | null) => void;
	aspectRatio?: number;
}

export function ImageUploader({
	currentImageUrl,
	onFileSelect,
	aspectRatio = 1,
}: Props) {
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(
		currentImageUrl || null
	);
	const [confirmingBlob, setConfirmingBlob] = useState<Blob | null>(null);
	const [targetType, setTargetType] = useState("image/webp");

	// called from CropEditor
	const handleCropDone = (blob: Blob, type: string) => {
		setConfirmingBlob(blob);
		setTargetType(type);
	};

	// final save result
	const handleFinalConfirm = () => {
		if (!confirmingBlob) return;
		const extension = targetType.split("/")[1];
		const file = new File([confirmingBlob], `upload.${extension}`, {
			type: targetType,
		});
		// cleaning up old link to avoid memory leaks
		if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
		const newUrl = URL.createObjectURL(confirmingBlob);
		setPreview(newUrl);
		onFileSelect(file);
		// reset all
		setConfirmingBlob(null);
		setImageToCrop(null);
	};

	return (
		<div className="w-full max-w-sm mx-auto">
			<FileDropzone
				preview={preview}
				aspectRatio={aspectRatio}
				onFileReady={setImageToCrop}
				onClear={() => {
					setPreview(null);
					onFileSelect(null);
				}}
			/>

			{imageToCrop && !confirmingBlob && (
				<CropEditor
					image={imageToCrop}
					initialAspect={aspectRatio}
					onClose={() => setImageToCrop(null)}
					onSave={handleCropDone}
				/>
			)}

			<AlertDialog
				open={!!confirmingBlob}
				onOpenChange={() => setConfirmingBlob(null)}
			>
				<AlertDialogContent className="max-w-md border-white/5 bg-background/80">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-xl font-bold italic uppercase">
							Предпросмотр
						</AlertDialogTitle>
						<AlertDialogDescription className="py-4 text-muted-foreground">
							Так будет выглядеть изображение на сайте
						</AlertDialogDescription>
						<div className="relative w-full aspect-video overflow-hidden rounded-xl border border-white/5 bg-transparent shadow-sm mb-4">
							{confirmingBlob && (
								<Image
									alt="preview"
									src={URL.createObjectURL(confirmingBlob)}
									fill
									className="object-contain"
								/>
							)}
						</div>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex-col sm:flex-row gap-2">
						<AlertDialogCancel asChild>
							<Button
								variant="ghost"
								onClick={() => {
									setConfirmingBlob(null);
									setImageToCrop(null);
								}}
								className="rounded-xl flex-1 uppercase text-[10px] font-bold hover:bg-muted-foreground/40"
							>
								Сбросить
							</Button>
						</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button
								onClick={handleFinalConfirm}
								className="rounded-xl flex-1 bg-primary/60 uppercase text-[10px] hover:scale-105"
							>
								Сохранить
							</Button>
						</AlertDialogAction>
						<Button
							variant="ghost"
							onClick={() => setConfirmingBlob(null)}
							className="rounded-xl flex-1 uppercase text-[10px] font-bold hover:bg-muted-foreground/40"
						>
							Изменить
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
