"use client";

import { ru } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import {
	type SiteSettingsInfo,
	updateSiteSettingsAction,
} from "@/actions/settings-actions";
import { DashboardBreadcrumb } from "@/components/dashboard/DashboardBreadcrumb";
import {
	Button,
	Calendar,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Label,
} from "@/components/ui";

export function SettingsClient({
	initialSettings,
}: {
	initialSettings: SiteSettingsInfo;
}) {
	const [formData, setFormData] = useState(initialSettings);
	const [isSaving, setIsSaving] = useState(false);

	// Конвертируем строки YYYY-MM-DD в Date объекты для календаря
	const selectedDates = formData.disabledDates.map((d) => new Date(d));

	const handleDatesChange = (dates: Date[] | undefined) => {
		if (!dates) return;
		// Сохраняем в ISO формате (срез YYYY-MM-DD)
		const strings = dates.map((d) => {
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, "0");
			const day = String(d.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		});
		setFormData({ ...formData, disabledDates: strings });
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		try {
			const result = await updateSiteSettingsAction({
				phone: formData.phone,
				telegram: formData.telegram,
				address: formData.address,
				workStart: Number(formData.workStart),
				workEnd: Number(formData.workEnd),
				disabledDates: formData.disabledDates,
			});

			if (result.success) {
				toast.success("Настройки успешно обновлены");
			} else {
				toast.error(result.error || "Ошибка при сохранении");
			}
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="max-w-5xl mx-auto space-y-6 pb-20">
			<DashboardBreadcrumb items={[{ label: "Настройки сайта" }]} />

			<div>
				<h1 className="text-3xl font-black italic uppercase tracking-tight">
					Настройки
				</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Глобальные параметры и график работы.
				</p>
			</div>

			<form
				onSubmit={handleSave}
				className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
			>
				{/* График и выходные */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Часы работы</CardTitle>
							<CardDescription>
								Влияет на автоматический перенос аренды
							</CardDescription>
						</CardHeader>
						<CardContent className="flex gap-4">
							<div className="space-y-2 flex-1">
								<Label>Открытие (ч)</Label>
								<Input
									type="number"
									min={0}
									max={23}
									value={formData.workStart}
									onChange={(e) =>
										setFormData({
											...formData,
											workStart: Number(e.target.value),
										})
									}
								/>
							</div>
							<div className="space-y-2 flex-1">
								<Label>Закрытие (ч)</Label>
								<Input
									type="number"
									min={1}
									max={24}
									value={formData.workEnd}
									onChange={(e) =>
										setFormData({
											...formData,
											workEnd: Number(e.target.value),
										})
									}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Нерабочие дни</CardTitle>
							<CardDescription>
								Заблокированы для выдачи и возврата (праздники и т.д.)
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col items-center">
							<Calendar
								mode="multiple"
								locale={ru}
								selected={selectedDates}
								onSelect={handleDatesChange}
								className="rounded-xl border border-foreground/10 p-3"
							/>
						</CardContent>
					</Card>
				</div>

				{/* Контакты */}
				<Card>
					<CardHeader>
						<CardTitle>Контактная информация</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Телефон поддержки</Label>
							<Input
								value={formData.phone}
								onChange={(e) =>
									setFormData({ ...formData, phone: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Telegram (@username или ссылка)</Label>
							<Input
								value={formData.telegram}
								onChange={(e) =>
									setFormData({ ...formData, telegram: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Адрес самовывоза</Label>
							<Input
								value={formData.address}
								onChange={(e) =>
									setFormData({ ...formData, address: e.target.value })
								}
							/>
						</div>
					</CardContent>
				</Card>

				<div className="lg:col-span-2 flex justify-end">
					<Button
						type="submit"
						disabled={isSaving}
						size="lg"
						className="w-full sm:w-auto h-12 rounded-xl"
					>
						{isSaving ? "Сохранение..." : "Сохранить настройки"}
					</Button>
				</div>
			</form>
		</div>
	);
}
