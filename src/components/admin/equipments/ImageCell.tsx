"use client";

import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
	deleteImageAction,
	linkImageToEquipmentAction,
} from "@/actions/upload-actions";
import { ImageUploader } from "@/components/shared";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui";
import { Progress } from "@/components/ui/progress";

interface ImageCellProps {
	equipmentId: string;
	initialImages: { id: string; url: string }[];
}

export function ImageCell({ equipmentId, initialImages }: ImageCellProps) {
	const [images, setImages] = useState(initialImages);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [open, setOpen] = useState(false);
	const [galleryOpen, setGalleryOpen] = useState(false);

	const handleDelete = async (
		imageId: string,
		imageUrl: string,
		e?: React.MouseEvent
	) => {
		e?.stopPropagation();

		if (!confirm("Удалить это фото?")) return;

		try {
			const result = await deleteImageAction(imageId, imageUrl);

			if (!result.success) {
				toast.error(result.error || "Ошибка удаления");
				return;
			}

			// Update local state
			setImages((prev) => prev.filter((img) => img.id !== imageId));
			toast.success("Изображение удалено");
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Ошибка удаления");
		}
	};

	const handleUpload = async (file: File | null) => {
		if (!file) return;

		setIsUploading(true);
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", "equipment"); // Папка для оборудования

			// 1. Загружаем файл на наш API Route
			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) throw new Error("Ошибка загрузки файла на сервер");

			const { url } = await res.json();
			setUploadProgress(50);

			// 2. Связываем полученный URL с оборудованием в БД
			const newImageData = await linkImageToEquipmentAction(equipmentId, url);
			setUploadProgress(100);

			setImages((prev) => [...prev, newImageData]);
			setOpen(false);
			toast.success("Файл успешно загружен");
		} catch (error) {
			console.error("Финальная ошибка загрузки:", error);
			toast.error("Не удалось загрузить файл");
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const mainImage = images[0];
	const hasMultiple = images.length > 1;

	return (
		<div className="flex items-center gap-2">
			{/* Main Image Preview */}
			<button
				type="button"
				onClick={() => setGalleryOpen(true)}
				className="relative w-12 h-12 rounded-lg border-2 border-background overflow-hidden bg-muted hover:border-primary transition-colors"
			>
				{mainImage ? (
					<>
						<Image
							src={mainImage.url}
							alt="Equipment"
							fill
							sizes="48px"
							className="object-cover"
							onError={(e) => {
								(e.target as HTMLImageElement).src =
									"/placeholder-equipment.png";
							}}
						/>
						{hasMultiple && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<span className="text-white text-xs font-bold">
									+{images.length - 1}
								</span>
							</div>
						)}
					</>
				) : (
					<Image
						src="/placeholder-equipment.png"
						alt="Placeholder"
						fill
						sizes="48px"
						className="object-cover opacity-50"
					/>
				)}
			</button>

			{/* Add Image Button */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="w-10 h-10 rounded-lg border-dashed"
					>
						<Plus size={16} />
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold italic uppercase tracking-tighter">
							Добавить медиафайл
						</DialogTitle>
					</DialogHeader>
					<DialogDescription asChild>
						<div className="space-y-4">
							<ImageUploader onFileSelect={handleUpload} aspectRatio={1.5} />
							{isUploading && (
								<div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
									<div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
										<span className="animate-pulse">Отправка в облако...</span>
										<span>{uploadProgress}%</span>
									</div>
									<Progress value={uploadProgress} className="h-1.5" />
									<p className="text-[9px] text-muted-foreground leading-tight italic">
										Если загрузка замерла более чем на минуту, попробуйте
										перезагрузить страницу или сменить сеть.
									</p>
								</div>
							)}
						</div>
					</DialogDescription>
				</DialogContent>
			</Dialog>

			{/* Gallery Dialog */}
			<Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Галерея ({images.length})</DialogTitle>
					</DialogHeader>
					{images.length > 0 ? (
						<div className="grid grid-cols-3 gap-4 mt-4">
							{images.map((img) => (
								<div
									key={img.id}
									className="relative aspect-square group rounded-lg overflow-hidden border border-white/10"
								>
									<Image
										src={img.url}
										alt="Equipment"
										fill
										className="object-cover"
									/>
									<Button
										variant="glass"
										size="icon"
										onClick={(e) => handleDelete(img.id, img.url, e)}
										className="absolute top-1 right-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity border-none"
									>
										<X size={14} />
									</Button>
								</div>
							))}
						</div>
					) : (
						<div className="py-12 text-center text-muted-foreground">
							<p>Нет изображений</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
