"use client";

import type { EquipmentStatus } from "@prisma/client";
import Papa from "papaparse";
import type React from "react";
import { useState } from "react";
import { importEquipmentCSVAction } from "@/actions/upload-actions";
import { slugify } from "@/utils";

export interface RawCSVRow {
	Название: string;
	Категория: string;
	Описание?: string;
	"Инв. номер": string;
	"Сумма депозита": string;
	"Стоимость покупки": string;
	Статус: string;
}

const CATEGORY_MAP: Record<string, string> = {
	Камеры: "cameras",
	Объективы: "lenses",
	Свет: "constant-light",
	Штативы: "tripods",
	Прочее: "other",
};

export function CSVUploader() {
	const [isUploading, setIsUploading] = useState(false);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			delimiter: "\t",
			complete: async (results): Promise<void> => {
				const { data } = results;

				const formattedData = (data as RawCSVRow[]).map((row) => {
					const replacementValue = parseFloat(row["Стоимость покупки"]) || 0;
					const dailyPrice = Math.round(replacementValue * 0.03);
					let status: EquipmentStatus = "AVAILABLE";
					if (row.Статус === "Доступен") {
						status = "AVAILABLE";
					} else if (row.Статус === "Занят" || row.Статус === "Арендован") {
						status = "RENTED";
					} else if (row.Статус === "Резерв") {
						status = "RESERVED";
					}

					return {
						title: row.Название,
						slug: slugify(row.Название),
						categoryId: CATEGORY_MAP[row.Категория || "Прочее"] || "other",
						description: row.Описание || null,
						inventoryNumber: row["Инв. номер"] || null,
						deposit: parseFloat(row["Сумма депозита"]) || 0,
						replacementValue: replacementValue,
						pricePerDay: dailyPrice,
						price4h: Math.round(dailyPrice * 0.6),
						price8h: Math.round(dailyPrice * 0.8),
						status: status,
						isAvailable: row.Статус === "Доступен", // true если доступен
					};
				});

				const result = await importEquipmentCSVAction(formattedData);

				if (!result.success) {
					alert(`Ошибка: ${result.error}`);
				} else {
					alert(`Загружено ${result.count} позиций!`);
				}
				setIsUploading(false);
			},
		});
	};

	return (
		<div className="p-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
			<h3 className="text-lg font-bold mb-4">Импорт базы техники (CSV)</h3>
			<input
				type="file"
				accept=".csv"
				onChange={handleFileUpload}
				disabled={isUploading}
				className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-80"
			/>
			{isUploading && <p className="mt-4 animate-pulse">Загрузка данных...</p>}
		</div>
	);
}
