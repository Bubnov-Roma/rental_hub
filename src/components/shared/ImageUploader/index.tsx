"use client";

import { RefreshCw } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { CropEditor } from "./CropEditor";
import { FileDropzone } from "./FileDropzone";

interface Props {
	currentImageUrl?: string;
	onFileSelect: (file: File | null) => void;
	aspectRatio?: number;
	className?: string;
}

export function ImageUploader({
	currentImageUrl,
	onFileSelect,
	aspectRatio = 1,
	className,
}: Props) {
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(
		currentImageUrl || null
	);
	const [confirmingBlob, setConfirmingBlob] = useState<Blob | null>(null);
	const [targetType, setTargetType] = useState("image/webp");
	const [uploadAttempts, setUploadAttempts] = useState(0);

	// called from CropEditor
	const handleCropDone = (blob: Blob, type: string) => {
		setConfirmingBlob(blob);
		setTargetType(type);
		setUploadAttempts(0); // Reset attempts when new crop is done
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
		setUploadAttempts(0);
	};

	// Force retry upload
	const handleRetryUpload = () => {
		setUploadAttempts((prev) => prev + 1);
		handleFinalConfirm();
	};

	// Cancel and go back to crop
	const handleBackToCrop = () => {
		setConfirmingBlob(null);
		// Image to crop is still available, so it will reopen the crop editor
	};

	return (
		<div className={cn("w-full max-w-sm mx-auto", className)}>
			<FileDropzone
				preview={preview}
				aspectRatio={aspectRatio}
				onFileReady={setImageToCrop}
				onClear={() => {
					setPreview(null);
					onFileSelect(null);
					setUploadAttempts(0);
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
								onClick={handleBackToCrop}
								className="rounded-xl flex-1 uppercase text-[10px] font-bold hover:bg-muted-foreground/40"
							>
								Изменить
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

						{uploadAttempts > 0 && (
							<Button
								variant="outline"
								onClick={handleRetryUpload}
								className="rounded-xl flex-1 uppercase text-[10px] font-bold"
							>
								<RefreshCw className="w-3 h-3 mr-1" />
								Повторить ({uploadAttempts})
							</Button>
						)}
					</AlertDialogFooter>

					{/* Hint about retry */}
					<div className="text-[9px] text-muted-foreground text-center px-4 pb-2">
						Если загрузка зависла, используйте кнопку "Повторить" для
						принудительной повторной попытки
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
