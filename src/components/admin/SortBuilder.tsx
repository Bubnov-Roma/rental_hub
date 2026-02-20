"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useState } from "react";
import type { EquipmentSort } from "@/app/actions/equipment-actions";
import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";

const SORTABLE_COLUMNS = [
	{ value: "title", label: "Наименование" },
	{ value: "category", label: "Категория" },
	{ value: "inventory_number", label: "Инв. №" },
	{ value: "price_per_day", label: "Цена/сутки" },
	{ value: "status", label: "Статус" },
	{ value: "created_at", label: "Дата создания" },
	{ value: "updated_at", label: "Дата обновления" },
	{ value: "deposit", label: "Депозит" },
	{ value: "replacement_value", label: "Стоимость замены" },
] as const;

interface SortBuilderProps {
	onSortChange: (sort: EquipmentSort[]) => void;
}

export function SortBuilder({ onSortChange }: SortBuilderProps) {
	const [sorts, setSorts] = useState<EquipmentSort[]>([]);

	const addSort = () => {
		const newSort: EquipmentSort = {
			column: "created_at",
			ascending: false,
		};
		const updated = [...sorts, newSort];
		setSorts(updated);
		onSortChange(updated);
	};

	const updateSort = (
		index: number,
		field: keyof EquipmentSort,
		value: string | boolean
	) => {
		const updated = [...sorts];
		const sort = updated[index];
		if (!sort) return;

		if (field === "column") {
			updated[index] = { ...sort, column: value as string };
		} else if (field === "ascending") {
			updated[index] = { ...sort, ascending: value as boolean };
		}

		setSorts(updated);
		onSortChange(updated);
	};

	const removeSort = (index: number) => {
		const updated = sorts.filter((_, i) => i !== index);
		setSorts(updated);
		onSortChange(updated);
	};

	const clearSorts = () => {
		setSorts([]);
		onSortChange([]);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Button
					variant="outline"
					size="sm"
					onClick={addSort}
					className="h-8 text-xs"
				>
					<Plus className="w-3 h-3 mr-1" />
					Добавить сортировку
				</Button>
				{sorts.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearSorts}
						className="h-8 text-xs text-muted-foreground"
					>
						Очистить
					</Button>
				)}
			</div>

			{sorts.length > 0 && (
				<div className="space-y-2 p-3 border border-white/5 rounded-lg bg-background/20">
					{sorts.map((sort, index) => (
						<div
							key={`${sort}` + `${index}`}
							className="flex items-center gap-2"
						>
							<Select
								value={sort.column}
								onValueChange={(value) => updateSort(index, "column", value)}
							>
								<SelectTrigger className="h-8 flex-1 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SORTABLE_COLUMNS.map((col) => (
										<SelectItem key={col.value} value={col.value}>
											{col.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Button
								variant="outline"
								size="sm"
								onClick={() => updateSort(index, "ascending", !sort.ascending)}
								className="h-9 w-24 text-xs"
							>
								{sort.ascending ? (
									<>
										<ArrowUp className="w-3 h-3 mr-1" />
										По возр.
									</>
								) : (
									<>
										<ArrowDown className="w-3 h-3 mr-1" />
										По убыв.
									</>
								)}
							</Button>

							<Button
								variant="ghost"
								size="icon"
								onClick={() => removeSort(index)}
								className="h-8 w-8 shrink-0"
							>
								<X className="w-3 h-3" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// "use client";

// import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
// import { useState } from "react";
// import type { EquipmentSort } from "@/app/actions/equipment-actions";
// import {
// 	Button,
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui";

// const SORTABLE_COLUMNS = [
// 	{ value: "title", label: "Наименование" },
// 	{ value: "category", label: "Категория" },
// 	{ value: "inventory_number", label: "Инв. №" },
// 	{ value: "price_per_day", label: "Цена/сутки" },
// 	{ value: "status", label: "Статус" },
// 	{ value: "created_at", label: "Дата создания" },
// 	{ value: "updated_at", label: "Дата обновления" },
// 	{ value: "deposit", label: "Депозит" },
// 	{ value: "replacement_value", label: "Стоимость замены" },
// ];

// interface SortBuilderProps {
// 	onSortChange: (sort: EquipmentSort[]) => void;
// }

// export function SortBuilder({ onSortChange }: SortBuilderProps) {
// 	const [sorts, setSorts] = useState<EquipmentSort[]>([]);

// 	const addSort = () => {
// 		const newSort: EquipmentSort = {
// 			column: "created_at",
// 			ascending: false,
// 		};
// 		const updated = [...sorts, newSort];
// 		setSorts(updated);
// 		onSortChange(updated);
// 	};

// 	const updateSort = (
// 		index: number,
// 		field: keyof EquipmentSort,
// 		value: any
// 	) => {
// 		const updated = [...sorts];
// 		updated[index] = { ...updated[index], [field]: value } as EquipmentSort;
// 		setSorts(updated);
// 		onSortChange(updated);
// 	};

// 	const removeSort = (index: number) => {
// 		const updated = sorts.filter((_, i) => i !== index);
// 		setSorts(updated);
// 		onSortChange(updated);
// 	};

// 	const clearSorts = () => {
// 		setSorts([]);
// 		onSortChange([]);
// 	};

// 	return (
// 		<div className="space-y-2">
// 			<div className="flex items-center justify-between">
// 				<Button
// 					variant="outline"
// 					size="sm"
// 					onClick={addSort}
// 					className="h-8 text-xs"
// 				>
// 					<Plus className="w-3 h-3 mr-1" />
// 					Добавить сортировку
// 				</Button>
// 				{sorts.length > 0 && (
// 					<Button
// 						variant="ghost"
// 						size="sm"
// 						onClick={clearSorts}
// 						className="h-8 text-xs text-muted-foreground"
// 					>
// 						Очистить
// 					</Button>
// 				)}
// 			</div>

// 			{sorts.length > 0 && (
// 				<div className="space-y-2 p-3 border border-white/5 rounded-lg bg-background/20">
// 					{sorts.map((sort, index) => (
// 						<div
// 							key={`${sort}` + `${index}`}
// 							className="flex items-center gap-2"
// 						>
// 							<Select
// 								value={sort.column}
// 								onValueChange={(value) => updateSort(index, "column", value)}
// 							>
// 								<SelectTrigger className="h-8 flex-1 text-xs">
// 									<SelectValue />
// 								</SelectTrigger>
// 								<SelectContent>
// 									{SORTABLE_COLUMNS.map((col) => (
// 										<SelectItem key={col.value} value={col.value}>
// 											{col.label}
// 										</SelectItem>
// 									))}
// 								</SelectContent>
// 							</Select>

// 							<Button
// 								variant="outline"
// 								size="sm"
// 								onClick={() => updateSort(index, "ascending", !sort.ascending)}
// 								className="h-8 w-24 text-xs"
// 							>
// 								{sort.ascending ? (
// 									<>
// 										<ArrowUp className="w-3 h-3 mr-1" />
// 										По возр.
// 									</>
// 								) : (
// 									<>
// 										<ArrowDown className="w-3 h-3 mr-1" />
// 										По убыв.
// 									</>
// 								)}
// 							</Button>

// 							<Button
// 								variant="ghost"
// 								size="icon"
// 								onClick={() => removeSort(index)}
// 								className="h-8 w-8"
// 							>
// 								<X className="w-3 h-3" />
// 							</Button>
// 						</div>
// 					))}
// 				</div>
// 			)}
// 		</div>
// 	);
// }
