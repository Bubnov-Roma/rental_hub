"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import type {
	EquipmentFilter,
	FilterOperator,
} from "@/app/actions/equipment-actions";
import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";
import { Input } from "@/components/ui/input";

const COLUMNS = [
	{ value: "title", label: "Наименование" },
	{ value: "category", label: "Категория" },
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
};

const COLUMN_TYPES: Record<string, "text" | "number" | "boolean"> = {
	title: "text",
	category: "text",
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
}

export function FilterBuilder({ onFiltersChange }: FilterBuilderProps) {
	const [filters, setFilters] = useState<EquipmentFilter[]>([]);

	const addFilter = () => {
		const newFilter: EquipmentFilter = {
			column: "title",
			operator: "ilike",
			value: "",
		};
		const updated = [...filters, newFilter];
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
			// Reset operator when column changes
			const columnType = COLUMN_TYPES[value as string] || "text";

			const defaultOperator = OPERATORS[columnType]?.[0]?.value || "eq";
			updated[index] = {
				...filter,
				column: value as string,
				operator: defaultOperator,
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
						const columnType = COLUMN_TYPES[filter.column] || "text";
						const operators = OPERATORS[columnType] || [];

						return (
							<div
								key={`${filter}` + `${index}`}
								className="flex items-center gap-2"
							>
								<Select
									value={filter.column}
									onValueChange={(value) =>
										updateFilter(index, "column", value)
									}
								>
									<SelectTrigger className="h-8 w-35 text-xs">
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

								<Select
									value={filter.operator}
									onValueChange={(value) =>
										updateFilter(index, "operator", value as FilterOperator)
									}
								>
									<SelectTrigger className="h-8 w-25 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{operators.map((op) => (
											<SelectItem key={op.value} value={op.value}>
												{op.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{columnType === "boolean" ? (
									<Select
										value={String(filter.value)}
										onValueChange={(value) =>
											updateFilter(index, "value", value === "true")
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
										className="h-9 flex-1 text-xs"
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
