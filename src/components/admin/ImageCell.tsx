"use client";

import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { uploadEquipmentImage } from "@/lib/supabase/storage";

interface ImageCellProps {
	equipmentId: string;
	initialImages: { id: string; url: string }[];
}

export function ImageCell({ equipmentId, initialImages }: ImageCellProps) {
	const [images, setImages] = useState(initialImages);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [open, setOpen] = useState(false);
	const supabase = createClient();

	const handleDelete = async (imageId: string, e: React.MouseEvent) => {
		e.stopPropagation();

		if (!confirm("Удалить это фото?")) return;

		try {
			const imageToDelete = images.find((img) => img.id === imageId);
			if (!imageToDelete) return;

			// clear path for storage
			let filePath = "";
			const urlObj = new URL(imageToDelete.url);
			const pathParts = urlObj.pathname.split("equipment-images/");

			if (pathParts.length > 1 && pathParts[1]) {
				// take part after name of the bucket and remove unnecessary prefixes
				filePath = pathParts[1].replace(/^(public\/|authenticated\/)/, "");
			}

			if (filePath) {
				console.log("Cleaning path for storage:", filePath);
				await supabase.storage.from("equipment-images").remove([filePath]);
			}

			// delete from db (only if true UUID)
			const isRealUUID =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
					imageId
				);

			if (isRealUUID) {
				const { error: dbError } = await supabase
					.from("images")
					.delete()
					.eq("id", imageId);

				if (dbError) {
					console.error("Database error:", dbError);
					toast.error(`Ошибка БД: ${dbError.message}`);
					return;
				}
			} else {
				console.warn(
					"Attempted to delete a non-UUID image from DB, skipping DB call."
				);
			}
			// always delete from local state
			setImages((prev) => prev.filter((img) => img.id !== imageId));
		} catch (error) {
			console.error("Unexpected error:", error);
		}
	};

	const handleUpload = async (file: File | null) => {
		if (!file) return;

		setIsUploading(true);
		setUploadProgress(0);

		const MAX_ATTEMPTS = 3;

		const uploadWithRetry = async (attempt: number) => {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 45000);

			try {
				console.log(`Запуск попытки загрузки №${attempt}...`);
				const result = await uploadEquipmentImage(file, equipmentId, (p) => {
					setUploadProgress(p);
				});

				clearTimeout(timeoutId);
				return result;
			} catch (err) {
				clearTimeout(timeoutId);
				if (attempt < MAX_ATTEMPTS) {
					const nextAttempt = attempt + 1;
					const delay = attempt * 2000; // pause: 2s, 4s...
					console.warn(
						`Попытка ${attempt} не удалась. Рестарт через ${delay}мс...`
					);
					await new Promise((resolve) => setTimeout(resolve, delay));
					return uploadWithRetry(nextAttempt);
				}
				throw err;
			}
		};

		try {
			const newImageData = await uploadWithRetry(1);
			setImages((prev) => [...prev, newImageData]);
			setOpen(false);
			toast.success("Файл успешно загружен");
		} catch (error) {
			console.error("Финальная ошибка загрузки:", error);
			if (error instanceof Error) {
				const isTimeout = error.name === "AbortError";
				toast.error(
					isTimeout
						? "Сервер долго не отвечал. Попробуйте отключить VPN или сменить Wi-Fi."
						: `Не удалось загрузить: ${error.message || "Ошибка соединения"}`
				);
			}
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const mainImage = images[0];
	return (
		<div className="flex items-center gap-3">
			<div className="relative w-12 h-12 rounded-xl border-2 border-background overflow-hidden bg-muted">
				{mainImage ? (
					<div className="group relative w-full h-full">
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
						<Button
							variant="destructive"
							onClick={(e) => handleDelete(mainImage.id, e)}
							className="absolute h-full inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity p-0 m-0 border-0 rounded-none"
						>
							<Trash2 size={16} />
						</Button>
					</div>
				) : (
					<Image
						src="/placeholder-equipment.png"
						alt="Placeholder"
						fill
						sizes="48px"
						className="object-cover opacity-50"
					/>
				)}
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="w-12 h-12 rounded-xl border-dashed"
					>
						<Plus size={20} />
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md p-6">
					<div className="relative space-y-4">
						<DialogHeader>
							<DialogTitle className="text-lg font-bold italic uppercase tracking-tighter mb-4">
								Добавить медиафайл
							</DialogTitle>
						</DialogHeader>
						<DialogDescription asChild>
							<div className="relative">
								<ImageUploader onFileSelect={handleUpload} aspectRatio={1.5} />
								{isUploading && (
									<div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
										<div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
											<span className="animate-pulse">
												Отправка в облако...
											</span>
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
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
