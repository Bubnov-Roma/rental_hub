"use client";

import Papa from "papaparse";
import type React from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface RawCSVRow {
	Название: string;
	Категория: string;
	Описание?: string;
	"Инв. номер": string;
	"Сумма депозита": string;
	"Стоимость покупки": string;
	Статус: string;
}

// 2. Маппинг категорий (из русского в CSV в ID базы данных)
const CATEGORY_MAP: Record<string, string> = {
	Камеры: "cameras",
	Объективы: "lenses",
	Свет: "constant-light",
	Штативы: "tripods",
	Прочее: "other",
};

export function CSVUploader() {
	const [isUploading, setIsUploading] = useState(false);
	const supabase = createClient();

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

				// Превращаем данные из CSV в формат таблицы equipment
				const formattedData = (data as RawCSVRow[]).map((row) => {
					const replacementValue = parseFloat(row["Стоимость покупки"]) || 0;
					// Логика цен: 3% от стоимости за сутки, 60% от суток за 4ч, 80% за 8ч
					const dailyPrice = Math.round(replacementValue * 0.03);

					return {
						title: row.Название,
						category: CATEGORY_MAP[row.Категория || "Прочее"] || "other",
						description: row.Описание || "",
						inventory_number: row["Инв. номер"],
						deposit: parseFloat(row["Сумма депозита"]) || 0,
						replacement_value: replacementValue,
						price_per_day: dailyPrice,
						price_4h: Math.round(dailyPrice * 0.6),
						price_8h: Math.round(dailyPrice * 0.8),
						status: row.Статус === "Доступен" ? "available" : "reserved",
						is_available: true,
					};
				});

				const { error } = await supabase
					.from("equipment")
					.upsert(formattedData, { onConflict: "inventory_number" });

				if (error) {
					alert(`Ошибка: ${error.message}`);
				} else {
					alert(`Загружено ${formattedData.length} позиций!`);
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
