"use client";

import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createEquipmentAction } from "@/actions/equipment-actions";
import { linkImageToEquipmentAction } from "@/actions/upload-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/utils";

export function EquipmentForm({ categories }: { categories: string[] }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);

	// Generating previews when selecting files
	useEffect(() => {
		if (files.length === 0) {
			setPreviews([]);
			return;
		}

		const objectUrls = files.map((file) => URL.createObjectURL(file));
		setPreviews(objectUrls);
		return () =>
			objectUrls.forEach((url) => {
				URL.revokeObjectURL(url);
			});
	}, [files]);

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);

		try {
			// 1. Create an entry
			const result = await createEquipmentAction({
				title: formData.get("title") as string,
				description: formData.get("description") as string,
				categoryId: formData.get("categoryId") as string,
				pricePerDay: parseFloat(formData.get("price") as string),
				status: "AVAILABLE",
				isAvailable: true,
				ownershipType: "INTERNAL",
			});

			if (!result.success || !result.id)
				throw new Error(result.error || "Ошибка создания");

			// 2. Load image
			for (const file of files) {
				const fileData = new FormData();
				fileData.append("file", file);
				fileData.append("folder", "equipment");

				const res = await fetch("/api/upload", {
					method: "POST",
					body: fileData,
				});
				if (!res.ok) {
					toast.error("Ошибка загрузки изображения");
					throw new Error("Ошибка загрузки изображения");
				}

				const { url } = await res.json();
				// 3. Связываем URL картинки с оборудованием в БД
				await linkImageToEquipmentAction(result.id, url);
			}

			toast.success("Готово! Оборудование добавлено.");
			router.push("/admin/equipment");
			router.refresh();
		} catch (error) {
			toast.error(getErrorMessage(error));
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Информация</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label>Название</Label>
						<Input name="title" required />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>Категория</Label>
							<Select name="category" required>
								<SelectTrigger>
									<SelectValue placeholder="Выберите категорию" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label>Цена в день (₽)</Label>
							<Input name="price" type="number" required />
						</div>
					</div>

					<div className="grid gap-2">
						<Label>Описание</Label>
						<Textarea name="description" rows={3} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Фотографии</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4 mb-4">
						{previews.map((url, i) => (
							<div
								key={url}
								className="relative aspect-square rounded-md overflow-hidden border"
							>
								<Image
									src={url}
									alt="Preview"
									fill
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									className="object-cover"
								/>
								<button
									type="button"
									onClick={() => removeFile(i)}
									className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
						<label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
							<Upload className="h-8 w-8 text-gray-400" />
							<span className="text-xs text-gray-500 mt-2">Добавить фото</span>
							<input
								type="file"
								multiple
								accept="image/*"
								className="hidden"
								onChange={(e) =>
									setFiles((prev) => [
										...prev,
										...Array.from(e.target.files || []),
									])
								}
							/>
						</label>
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-end gap-3">
				<Button variant="outline" type="button" onClick={() => router.back()}>
					Отмена
				</Button>
				<Button type="submit" disabled={loading}>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Сохранить
				</Button>
			</div>
		</form>
	);
}
