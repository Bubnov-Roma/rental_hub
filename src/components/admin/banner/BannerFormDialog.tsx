import { CheckIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	type Banner,
	type BannerType,
	createBannerAction,
	updateBannerAction,
} from "@/actions/banner-actions";
import { MarkdownEditor } from "@/components/shared";
import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";
import { TYPE_OPTIONS } from "@/constants";

// ─── Форма создания / редактирования ─────────────────────────────────────────

interface BannerFormValues {
	title: string;
	subtitle: string;
	body: string;
	imageUrl: string;
	linkUrl: string;
	linkLabel: string;
	type: BannerType;
	isActive: boolean;
	eventDate: string;
}

const emptyForm = (): BannerFormValues => ({
	title: "",
	subtitle: "",
	body: "",
	imageUrl: "",
	linkUrl: "",
	linkLabel: "",
	type: "info",
	isActive: true,
	eventDate: "",
});

const isValidUrl = (url: string) =>
	url.startsWith("http://") || url.startsWith("https://");

function bannerToForm(b: Banner): BannerFormValues {
	return {
		title: b.title,
		subtitle: b.subtitle ?? "",
		body: b.body ?? "",
		imageUrl: b.imageUrl ?? "",
		linkUrl: b.linkUrl ?? "",
		linkLabel: b.linkLabel ?? "",
		type: b.type as BannerType,
		isActive: b.isActive,
		eventDate: b.eventDate
			? new Date(b.eventDate).toISOString().slice(0, 10)
			: "",
	};
}

export function BannerFormDialog({
	open,
	onOpenChange,
	initial,
	bannerId,
	onCheckIcond,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	initial?: Banner;
	bannerId?: string;
	onCheckIcond: () => void;
}) {
	const [form, setForm] = useState<BannerFormValues>(
		initial ? bannerToForm(initial) : emptyForm()
	);
	const [isPending, start] = useTransition();

	const set = (k: keyof BannerFormValues, v: string | boolean) =>
		setForm((prev) => ({ ...prev, [k]: v }));

	const handleCheckIcon = () => {
		if (!form.title.trim()) {
			toast.error("Введите заголовок");
			return;
		}

		start(async () => {
			const payload = {
				title: form.title,
				subtitle: form.subtitle || "",
				body: form.body || "",
				imageUrl: form.imageUrl || "",
				linkUrl: form.linkUrl || "",
				linkLabel: form.linkLabel || "",
				type: form.type,
				isActive: form.isActive,
				eventDate: form.eventDate || "",
			};

			const result = bannerId
				? await updateBannerAction(bannerId, payload)
				: await createBannerAction(payload);

			if (!result.success) {
				toast.error(result.error ?? "Ошибка");
			} else {
				toast.success(bannerId ? "Баннер обновлён" : "Баннер создан");
				onCheckIcond();
				onOpenChange(false);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-black italic uppercase tracking-tight">
						{bannerId ? "Редактировать баннер" : "Новый баннер"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{/* Тип */}
					<div className="space-y-1.5">
						<Label>Тип</Label>
						<Select
							value={form.type}
							onValueChange={(v) => set("type", v as BannerType)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TYPE_OPTIONS.map((t) => (
									<SelectItem key={t.value} value={t.value}>
										<div className="flex items-center gap-2">
											{t.icon}
											{t.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Заголовок */}
					<div className="space-y-1.5">
						<Label>Заголовок *</Label>
						<Input
							value={form.title}
							onChange={(e) => set("title", e.target.value)}
							placeholder="Встреча с фотографами | Скидка 20% на свет..."
						/>
					</div>

					{/* Подзаголовок */}
					<div className="space-y-1.5">
						<Label>Подзаголовок</Label>
						<Input
							value={form.subtitle}
							onChange={(e) => set("subtitle", e.target.value)}
							placeholder="Краткое описание, видное на слайде"
						/>
					</div>

					{/* Тело (Markdown) */}
					<MarkdownEditor
						label="Полное описание (Markdown)"
						value={form.body}
						onChange={(v) => set("body", v)}
						rows={8}
						placeholder={
							"# Заголовок\n\nОписание события или акции.\n\n- Пункт 1\n- Пункт 2\n\n[Регистрация](https://...)"
						}
					/>

					{/* Изображение */}
					<div className="space-y-1.5">
						<Label>URL изображения</Label>
						<Input
							value={form.imageUrl}
							onChange={(e) => set("imageUrl", e.target.value)}
							placeholder="https://... (из Beget S3 или другого источника)"
						/>
						{form.imageUrl && isValidUrl(form.imageUrl) && (
							<div className="relative w-full aspect-video ...">
								<Image
									src={form.imageUrl}
									alt="preview"
									fill
									sizes="768px"
									className="object-cover"
									// Важно: onError скроет битую картинку, если ссылка ведет в никуда
									onError={(e) => {
										(e.target as HTMLImageElement).style.opacity = "0";
									}}
								/>
							</div>
						)}
					</div>

					{/* Дата события */}
					<div className="space-y-1.5">
						<Label>Дата события (для type=event)</Label>
						<Input
							type="date"
							value={form.eventDate}
							onChange={(e) => set("eventDate", e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						{/* Ссылка */}
						<div className="space-y-1.5">
							<Label>URL ссылки</Label>
							<Input
								value={form.linkUrl}
								onChange={(e) => set("linkUrl", e.target.value)}
								placeholder="https://..."
							/>
						</div>
						{/* Текст кнопки */}
						<div className="space-y-1.5">
							<Label>Текст кнопки</Label>
							<Input
								value={form.linkLabel}
								onChange={(e) => set("linkLabel", e.target.value)}
								placeholder="Зарегистрироваться"
							/>
						</div>
					</div>

					{/* Активен */}
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={form.isActive}
							onChange={(e) => set("isActive", e.target.checked)}
							className="accent-primary w-4 h-4"
						/>
						<span className="text-sm">Отображать на сайте</span>
					</label>
				</div>

				<div className="flex gap-2 pt-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="flex-1"
					>
						Отмена
					</Button>
					<Button
						onClick={handleCheckIcon}
						disabled={isPending}
						className="flex-1 gap-2"
					>
						<CheckIcon size={14} />
						{bannerId ? "Сохранить" : "Создать"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
