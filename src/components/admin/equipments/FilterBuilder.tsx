"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import type {
	EquipmentFilter,
	FilterOperator,
} from "@/actions/equipment-actions";
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";
import type { DbCategory } from "@/constants/navigation";

const COLUMNS = [
	{ value: "title", label: "Наименование" },
	{ value: "category", label: "Категория" },
	{ value: "subcategory", label: "Подкатегория" },
	{ value: "inventory_number", label: "Инв. №" },
	{ value: "price_per_day", label: "Цена/сутки" },
	{ value: "status", label: "Статус" },
	{ value: "is_available", label: "Доступность" },
	{ value: "ownership_type", label: "Тип владения" },
	{ value: "deposit", label: "Депозит" },
	{ value: "replacement_value", label: "Стоимость замены" },
] as const;

const OPERATORS: Record<string, { value: FilterOperator; label: string }[]> = {
	text: [
		{ value: "ilike", label: "содержит" },
		{ value: "eq", label: "равно" },
		{ value: "neq", label: "не равно" },
	],
	number: [
		{ value: "eq", label: "=" },
		{ value: "neq", label: "≠" },
		{ value: "gt", label: ">" },
		{ value: "gte", label: "≥" },
		{ value: "lt", label: "<" },
		{ value: "lte", label: "≤" },
	],
	boolean: [
		{ value: "eq", label: "равно" },
		{ value: "neq", label: "не равно" },
	],
	// category/subcategory use uuid select — operator is always "eq"
	category: [{ value: "eq", label: "равно" }],
};

const COLUMN_TYPES: Record<string, "text" | "number" | "boolean" | "category"> =
	{
		title: "text",
		category: "category",
		subcategory: "category",
		inventory_number: "text",
		price_per_day: "number",
		status: "text",
		is_available: "boolean",
		ownership_type: "text",
		deposit: "number",
		replacement_value: "number",
	};

interface FilterBuilderProps {
	onFiltersChange: (filters: EquipmentFilter[]) => void;
	categories?: DbCategory[];
}

export function FilterBuilder({
	onFiltersChange,
	categories = [],
}: FilterBuilderProps) {
	const [filters, setFilters] = useState<EquipmentFilter[]>([]);

	const addFilter = () => {
		const updated = [
			...filters,
			{ column: "title", operator: "ilike" as FilterOperator, value: "" },
		];
		setFilters(updated);
		onFiltersChange(updated);
	};

	const updateFilter = (
		index: number,
		field: keyof EquipmentFilter,
		value: string | number | boolean | FilterOperator
	) => {
		const updated = [...filters];
		const filter = updated[index];
		if (!filter) return;

		if (field === "column") {
			const colType = COLUMN_TYPES[value as string] ?? "text";
			const defaultOp = OPERATORS[colType]?.[0]?.value ?? "eq";
			updated[index] = {
				...filter,
				column: value as string,
				operator: defaultOp,
				value: "",
			};
		} else if (field === "operator") {
			updated[index] = { ...filter, operator: value as FilterOperator };
		} else if (field === "value") {
			updated[index] = { ...filter, value };
		}

		setFilters(updated);
		onFiltersChange(updated);
	};

	const removeFilter = (index: number) => {
		const updated = filters.filter((_, i) => i !== index);
		setFilters(updated);
		onFiltersChange(updated);
	};

	const clearFilters = () => {
		setFilters([]);
		onFiltersChange([]);
	};

	// Build subcategories list based on selected category filter value
	const getSubcategoriesForFilter = (
		index: number
	): DbCategory["subcategories"] => {
		// Find if there's a category filter before this index
		const catFilter = filters
			.slice(0, index)
			.find((f) => f.column === "category");
		if (!catFilter || !catFilter.value) {
			// Return all subcategories if no category filter
			return categories.flatMap((c) => c.subcategories);
		}
		return (
			categories.find((c) => c.id === catFilter.value)?.subcategories ?? []
		);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Button variant="outline" size="sm" onClick={addFilter}>
					<Plus className="w-3 h-3 mr-1" />
					Добавить фильтр
				</Button>
				{filters.length > 0 && (
					<Button
						variant="ghost"
						className="h-8 text-xs text-muted-foreground"
						size="sm"
						onClick={clearFilters}
					>
						Очистить
					</Button>
				)}
			</div>

			{filters.length > 0 && (
				<div className="space-y-2 p-3 border border-white/5 rounded-lg bg-background/20">
					{filters.map((filter, index) => {
						const columnType = COLUMN_TYPES[filter.column] ?? "text";
						const operators = OPERATORS[columnType] ?? OPERATORS.text;
						const isCategoryCol = columnType === "category";

						return (
							<div
								key={`filter-${
									// biome-ignore lint/suspicious/noArrayIndexKey: filter UI row
									index
								}`}
								className="flex items-center gap-2"
							>
								{/* Column selector */}
								<Select
									value={filter.column}
									onValueChange={(v) => updateFilter(index, "column", v)}
								>
									<SelectTrigger className="h-8 w-36 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{COLUMNS.map((col) => (
											<SelectItem key={col.value} value={col.value}>
												{col.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{/* Operator selector */}
								<Select
									value={filter.operator}
									onValueChange={(v) =>
										updateFilter(index, "operator", v as FilterOperator)
									}
								>
									<SelectTrigger className="h-8 w-28 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{operators?.map((op) => (
											<SelectItem key={op.value} value={op.value}>
												{op.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{/* Value input — special cases */}
								{isCategoryCol && filter.column === "category" ? (
									<Select
										value={String(filter.value || "")}
										onValueChange={(v) => updateFilter(index, "value", v)}
									>
										<SelectTrigger className="h-8 flex-1 text-xs">
											<SelectValue placeholder="Выберите категорию..." />
										</SelectTrigger>
										<SelectContent>
											{categories.map((cat) => (
												<SelectItem key={cat.id} value={cat.id}>
													{cat.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : isCategoryCol && filter.column === "subcategory" ? (
									<Select
										value={String(filter.value || "")}
										onValueChange={(v) => updateFilter(index, "value", v)}
									>
										<SelectTrigger className="h-8 flex-1 text-xs">
											<SelectValue placeholder="Выберите подкатегорию..." />
										</SelectTrigger>
										<SelectContent>
											{getSubcategoriesForFilter(index).map((sub) => (
												<SelectItem key={sub.id} value={sub.id}>
													{sub.name}
												</SelectItem>
											))}
											{getSubcategoriesForFilter(index).length === 0 && (
												<SelectItem value="_none" disabled>
													Сначала выберите категорию
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								) : columnType === "boolean" ? (
									<Select
										value={String(filter.value)}
										onValueChange={(v) =>
											updateFilter(index, "value", v === "true")
										}
									>
										<SelectTrigger className="h-8 flex-1 text-xs">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="true">Да</SelectItem>
											<SelectItem value="false">Нет</SelectItem>
										</SelectContent>
									</Select>
								) : filter.column === "status" ? (
									<Select
										value={String(filter.value || "")}
										onValueChange={(v) => updateFilter(index, "value", v)}
									>
										<SelectTrigger className="h-8 flex-1 text-xs">
											<SelectValue placeholder="Статус..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="available">Доступно</SelectItem>
											<SelectItem value="rented">В аренде</SelectItem>
											<SelectItem value="reserved">Забронировано</SelectItem>
											<SelectItem value="maintenance">Обслуживание</SelectItem>
											<SelectItem value="broken">Неисправно</SelectItem>
										</SelectContent>
									</Select>
								) : filter.column === "ownership_type" ? (
									<Select
										value={String(filter.value || "")}
										onValueChange={(v) => updateFilter(index, "value", v)}
									>
										<SelectTrigger className="h-8 flex-1 text-xs">
											<SelectValue placeholder="Тип..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="internal">Собственное</SelectItem>
											<SelectItem value="sublease">Субаренда</SelectItem>
										</SelectContent>
									</Select>
								) : (
									<Input
										type={columnType === "number" ? "number" : "text"}
										value={String(filter.value)}
										onChange={(e) =>
											updateFilter(
												index,
												"value",
												columnType === "number"
													? Number(e.target.value)
													: e.target.value
											)
										}
										placeholder="Значение..."
										className="h-8 flex-1 text-xs"
									/>
								)}

								<Button
									variant="ghost"
									size="icon"
									onClick={() => removeFilter(index)}
									className="h-8 w-8 shrink-0"
								>
									<X className="w-3 h-3" />
								</Button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
