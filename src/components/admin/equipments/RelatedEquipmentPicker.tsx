"use client";

import { GripVertical, Plus, Search, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useDebounceValue } from "usehooks-ts";
import { searchEquipmentAction } from "@/actions/equipment-actions";
import { InputGroup, InputGroupInput } from "@/components/ui";
import type { DbEquipmentWithImages } from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";

interface RelatedItem {
	id: string;
	title: string;
	imageUrl: string;
	pricePerDay: number;
}

interface RelatedEquipmentPickerProps {
	value: string[]; // array of equipment IDs in order
	onChange: (ids: string[]) => void;
	excludeId?: string; // ID текущей позиции — не показываем в поиске
}

export function RelatedEquipmentPicker({
	value,
	onChange,
	excludeId,
}: RelatedEquipmentPickerProps) {
	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounceValue(query, 250);
	const [results, setResults] = useState<DbEquipmentWithImages[]>([]);
	const [isSearching, startSearchTransition] = useTransition();
	const [selectedItems, setSelectedItems] = useState<RelatedItem[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: < Load current selected items metadata on mount >
	useEffect(() => {
		if (value.length === 0) {
			setSelectedItems([]);
			return;
		}
		// Keep existing items order, fill in missing data via search
		const missingIds = value.filter(
			(id) => !selectedItems.find((item) => item.id === id)
		);
		if (missingIds.length > 0) {
			// Re-fetch missing items
			(async () => {
				const all = await searchEquipmentAction("");
				const mapped = value
					.map((id) => {
						const found = all.find((e) => e.id === id);
						if (!found) return null;
						return {
							id: found.id,
							title: found.title,
							imageUrl:
								found.equipmentImageLinks?.[0]?.image?.url ??
								"/placeholder-equipment.png",
							pricePerDay: found.pricePerDay,
						};
					})
					.filter((x): x is RelatedItem => x !== null);
				setSelectedItems(mapped);
			})();
		}
	}, []);

	// Search
	useEffect(() => {
		if (!debouncedQuery || debouncedQuery.length < 2) {
			setResults([]);
			return;
		}
		startSearchTransition(async () => {
			const data = await searchEquipmentAction(debouncedQuery);
			setResults(
				data.filter((item) => item.id !== excludeId && !value.includes(item.id))
			);
		});
	}, [debouncedQuery, excludeId, value]);

	const addItem = (item: DbEquipmentWithImages) => {
		const newItem: RelatedItem = {
			id: item.id,
			title: item.title,
			imageUrl:
				item.equipmentImageLinks?.[0]?.image?.url ??
				"/placeholder-equipment.png",
			pricePerDay: item.pricePerDay,
		};
		const newSelected = [...selectedItems, newItem];
		setSelectedItems(newSelected);
		onChange(newSelected.map((i) => i.id));
		setQuery("");
		setResults([]);
	};

	const removeItem = (id: string) => {
		const newSelected = selectedItems.filter((i) => i.id !== id);
		setSelectedItems(newSelected);
		onChange(newSelected.map((i) => i.id));
	};

	// ─── Drag & Drop ────────────────────────────────────────────────────────
	const dragIndex = useRef<number | null>(null);
	const dragOverIndex = useRef<number | null>(null);

	const handleDragStart = useCallback((index: number) => {
		dragIndex.current = index;
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
		e.preventDefault();
		dragOverIndex.current = index;
	}, []);

	const handleDrop = useCallback(() => {
		const from = dragIndex.current;
		const to = dragOverIndex.current;
		if (from === null || to === null || from === to) return;

		const reordered = [...selectedItems];
		const [moved] = reordered.splice(from, 1);
		if (!moved) return;
		reordered.splice(to, 0, moved);

		setSelectedItems(reordered);
		onChange(reordered.map((i) => i.id));
		dragIndex.current = null;
		dragOverIndex.current = null;
	}, [selectedItems, onChange]);

	return (
		<div className="space-y-3">
			{/* Selected items list */}
			{selectedItems.length > 0 && (
				<div className="space-y-1.5">
					<p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
						Выбрано ({selectedItems.length}) — перетащите для изменения порядка
					</p>
					<div className="space-y-1.5">
						{selectedItems.map((item, index) => (
							<button
								type="button"
								key={item.id}
								draggable
								onDragStart={() => handleDragStart(index)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDrop={handleDrop}
								className={cn(
									"flex items-center gap-2 p-2 rounded-xl border border-white/8 bg-foreground/3",
									"hover:bg-foreground/5 transition-colors group cursor-grab active:cursor-grabbing"
								)}
							>
								<GripVertical
									size={14}
									className="text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors"
								/>
								<div className="w-8 h-8 rounded-lg overflow-hidden bg-foreground/8 shrink-0">
									<Image
										src={item.imageUrl}
										alt={item.title}
										width={32}
										height={32}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate leading-tight">
										{item.title}
									</p>
									<p className="text-[11px] text-muted-foreground">
										{item.pricePerDay} ₽/сут
									</p>
								</div>
								<span className="text-[10px] text-muted-foreground/40 font-mono shrink-0">
									#{index + 1}
								</span>
								<button
									type="button"
									onClick={() => removeItem(item.id)}
									className="p-1 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0"
								>
									<X size={12} />
								</button>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Search input */}
			<div className="relative">
				<InputGroup className="flex items-center gap-2  px-3 rounded-xl border border-white/10 bg-foreground/5 focus-within:border-primary/50 transition-colors">
					<Search size={13} className="text-muted-foreground shrink-0" />
					<InputGroupInput
						type="text"
						className="flex-1 input-glass bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
						placeholder="Поиск техники для добавления..."
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setIsOpen(true);
						}}
						onFocus={() => setIsOpen(true)}
						onBlur={() => setTimeout(() => setIsOpen(false), 200)}
					/>
					{isSearching && (
						<div className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin shrink-0" />
					)}
				</InputGroup>

				{/* Results dropdown */}
				{isOpen && results.length > 0 && (
					<div className="absolute left-0 right-0 top-full mt-1 z-50  border border-foreground/10 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto backdrop-blur-2xl bg-background/80">
						{results.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => addItem(item)}
								className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-foreground/5 transition-colors text-left group"
							>
								<div className="w-9 h-9 rounded-lg overflow-hidden bg-foreground/8 shrink-0">
									<Image
										src={
											item.equipmentImageLinks?.[0]?.image?.url ??
											"/placeholder-equipment.png"
										}
										alt={item.title}
										width={36}
										height={36}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
									/>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{item.title}</p>
									<p className="text-[11px] text-muted-foreground">
										{item.pricePerDay} ₽/сут
									</p>
								</div>
								<Plus
									size={14}
									className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
								/>
							</button>
						))}
					</div>
				)}

				{isOpen &&
					debouncedQuery.length >= 2 &&
					results.length === 0 &&
					!isSearching && (
						<div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-white/10 rounded-xl shadow-xl px-3 py-4 text-center text-sm text-muted-foreground">
							Ничего не найдено
						</div>
					)}
			</div>
		</div>
	);
}
