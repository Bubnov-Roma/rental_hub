"use client";

import {
	Copy,
	CopyPlus,
	Download,
	Edit2,
	MoreVertical,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import {
	deleteEquipment,
	duplicateEquipment,
	type EquipmentFilter,
	type EquipmentSort,
	exportEquipment,
	getEquipmentWithFilters,
	migrateCategoriesToIds,
} from "@/app/actions/equipment-actions";
import { FilterBuilder } from "@/components/admin/FilterBuilder";
import { SortBuilder } from "@/components/admin/SortBuilder";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Badge,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui";
import { CATEGORIES } from "@/constants/categories";
import type { DbEquipment } from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";
import { EquipmentDrawer } from "./EquipmentDrawer";

/** Получить имя категории по id */
function getCategoryName(id: string): string {
	for (const cat of CATEGORIES) {
		if (cat.id === id) return cat.name;
	}
	return id;
}

/** Получить имя подкатегории по id (ищем во всех subcategories) */
function getSubcategoryName(id: string): string {
	if (!id) return "";
	for (const cat of CATEGORIES) {
		if (!cat.subcategories) continue;
		for (const sub of cat.subcategories) {
			if (sub.id === id) return sub.name;
		}
	}
	return id;
}

/** Скелетон-строка таблицы */
function TableRowSkeleton() {
	return (
		<TableRow className="border-white/5">
			<TableCell>
				<Skeleton className="h-4 w-4 rounded" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-10 w-10 rounded" />
			</TableCell>
			<TableCell>
				<div className="space-y-1.5">
					<Skeleton className="h-3.5 w-32 rounded" />
					<Skeleton className="h-2.5 w-20 rounded" />
				</div>
			</TableCell>
			<TableCell>
				<Skeleton className="h-5 w-16 rounded-full" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-5 w-20 rounded-full" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-3.5 w-14 rounded" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-2 w-2 rounded-full" />
			</TableCell>
			<TableCell />
		</TableRow>
	);
}

export default function EquipmentTable() {
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [_isBackgroundLoading, setIsBackgroundLoading] = useState(false);
	const [duplicateId, setDuplicateId] = useState<string | null>(null);

	// Filters и sorts — можно расширить до URL params при необходимости
	const [filters, setFilters] = useState<EquipmentFilter[]>([]);
	const [sorts, setSorts] = useState<EquipmentSort[]>([]);

	const [items, setItems] = useState<DbEquipment[]>([]);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [activeEquipment, setActiveEquipment] = useState<DbEquipment | null>(
		null
	);
	const [searchTerm, setSearchTerm] = useState("");

	const [debouncedSearch] = useDebounceValue(searchTerm, 500);
	const [isPending, startTransition] = useTransition();

	const countSiblings = (title: string) =>
		items.filter((item) => item.title === title).length;

	const loadData = useCallback(
		async (background = false) => {
			if (background) {
				setIsBackgroundLoading(true);
			} else {
				setIsLoading(true);
			}
			try {
				const { data, count } = await getEquipmentWithFilters({
					search: debouncedSearch,
					filters,
					sort: sorts,
				});
				setItems(data || []);
				setTotalCount(count || 0);
			} catch (error) {
				console.error("Load error:", error);
				toast.error(
					error instanceof Error ? error.message : "Ошибка загрузки данных"
				);
			} finally {
				setIsLoading(false);
				setIsBackgroundLoading(false);
			}
		},
		[debouncedSearch, filters, sorts]
	);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const toggleSelect = (id: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedIds(newSelected);
	};

	const handleDelete = async (singleId?: string) => {
		const idsToDelete = singleId ? [singleId] : Array.from(selectedIds);
		if (idsToDelete.length === 0) return;
		if (!confirm(`Удалить ${idsToDelete.length} поз.?`)) return;

		startTransition(async () => {
			try {
				await deleteEquipment(idsToDelete);
				toast.success(`Удалено позиций: ${idsToDelete.length}`);
				setSelectedIds(new Set());
				await loadData();
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Ошибка удаления");
			}
		});
	};

	const handleDuplicate = async (id?: string) => {
		const idsToDuplicate = id ? [id] : Array.from(selectedIds);
		if (idsToDuplicate.length === 0) return;

		startTransition(async () => {
			try {
				for (const targetId of idsToDuplicate) {
					await duplicateEquipment(targetId);
				}
				toast.success(`Скопировано позиций: ${idsToDuplicate.length}`);
				loadData(true);
				if (!id) setSelectedIds(new Set());
			} catch {
				toast.error("Ошибка при копировании");
			}
		});
	};

	const handleExport = async () => {
		startTransition(async () => {
			try {
				const data = await exportEquipment(
					selectedIds.size > 0 ? Array.from(selectedIds) : undefined
				);
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `equipment-export-${new Date().toISOString()}.json`;
				a.click();
				URL.revokeObjectURL(url);
				toast.success("Экспорт завершён");
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Ошибка экспорта");
			}
		});
	};

	const SKELETON_COUNT = 8;

	return (
		<div className="w-full space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-black italic uppercase tracking-tighter">
						Inventory Control
					</h1>
					<p className="text-sm text-muted-foreground">
						Управление парком техники и медиа-файлами
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="h-fit">
						Total: {totalCount} units
					</Badge>
					{selectedIds.size > 0 && (
						<Badge variant="secondary" className="h-fit">
							Выбрано: {selectedIds.size}
						</Badge>
					)}
				</div>
			</div>

			{/* Toolbar */}
			<div className="flex items-center gap-2 flex-wrap">
				<div className="relative flex-1 max-w-sm">
					<Search className="z-1 absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Поиск по названию или инв. номеру..."
						className="pl-9 bg-muted-foreground/15 border-white/5"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(filters.length > 0 && "border-primary")}
						>
							Фильтры
							{filters.length > 0 && (
								<Badge variant="secondary" className="ml-2">
									{filters.length}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-125 backdrop-blur-xl" align="start">
						<FilterBuilder onFiltersChange={setFilters} />
					</PopoverContent>
				</Popover>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(sorts.length > 0 && "border-primary")}
						>
							Сортировка
							{sorts.length > 0 && (
								<Badge variant="secondary" className="ml-2">
									{sorts.length}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-100 backdrop-blur-xl" align="start">
						<SortBuilder onSortChange={setSorts} />
					</PopoverContent>
				</Popover>

				<div className="ml-auto flex gap-2">
					{selectedIds.size > 0 && (
						<>
							<Button
								variant="outline"
								onClick={handleExport}
								disabled={isPending}
							>
								<Download className="w-4 h-4 mr-1" />
								Экспорт ({selectedIds.size})
							</Button>
							<Button
								variant="outline"
								onClick={() => handleDelete()}
								disabled={isPending}
							>
								<Trash2 className="w-4 h-4 mr-1" />
								Удалить ({selectedIds.size})
							</Button>
							<Button
								variant="outline"
								onClick={() => handleDuplicate()}
								disabled={isPending}
							>
								<CopyPlus className="w-4 h-4 mr-1" />
								Копировать ({selectedIds.size})
							</Button>
						</>
					)}
				</div>
			</div>
			<div className="w-full rounded-md border border-white/10 overflow-x-auto">
				<Table className="w-full">
					<TableHeader
						className={cn(
							"bg-primary/70 ",
							(isLoading || isPending) && "bg-foreground/20 animate-pulse"
						)}
					>
						<TableRow className="hover:bg-transparent font-black">
							<TableHead className="w-10">
								<Checkbox
									checked={
										items.length > 0 && selectedIds.size === items.length
									}
									onCheckedChange={(checked) => {
										setSelectedIds(
											checked ? new Set(items.map((i) => i.id)) : new Set()
										);
									}}
								/>
							</TableHead>
							<TableHead className="w-12 text-amber-50" />
							<TableHead className="min-w-45">Наименование</TableHead>
							<TableHead className="min-w-27.5">Категория</TableHead>
							<TableHead className="min-w-30">Подкатегория</TableHead>
							<TableHead className="min-w-22.5">Цена/сут</TableHead>
							<TableHead className="w-16">Статус</TableHead>
							<TableHead className="w-12 text-right">Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading
							? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
									<TableRowSkeleton key={i} />
								))
							: items.map((item) => {
									const siblings = countSiblings(item.title);
									const hasSiblings = siblings > 1;
									const categoryName = getCategoryName(item.category);
									const subcategoryName = getSubcategoryName(
										item.subcategory ?? ""
									);

									return (
										<TableRow
											key={item.id}
											className={cn(
												"group hover:bg-muted-foreground/10 border-white/5 transition-colors cursor-pointer",
												selectedIds.has(item.id) && "bg-primary/10"
											)}
											onClick={() => {
												setActiveEquipment(item);
											}}
										>
											<TableCell onClick={(e) => e.stopPropagation()}>
												<Checkbox
													checked={selectedIds.has(item.id)}
													onCheckedChange={() => toggleSelect(item.id)}
												/>
											</TableCell>
											<TableCell>
												<div className="relative w-10 h-10 rounded overflow-hidden border border-white/10 bg-zinc-400/15 shrink-0">
													<Image
														src={
															item.equipment_image_links?.[0]?.images?.url ||
															"/placeholder-equipment.png"
														}
														alt=""
														fill
														className="object-cover"
													/>
												</div>
											</TableCell>
											<TableCell className="font-medium">
												<div className="flex flex-col gap-0.5">
													<div className="flex items-center gap-1.5">
														<span className="truncate max-w-50">
															{item.title}
														</span>
														{hasSiblings && (
															<Badge
																variant="secondary"
																className="h-4 py-0 px-1.5 text-[10px] shrink-0"
															>
																×{siblings}
															</Badge>
														)}
													</div>
													<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
														{item.inventory_number}
													</span>
												</div>
											</TableCell>
											<TableCell>
												{categoryName && (
													<Badge
														variant="outline"
														className="bg-background text-[10px] font-normal"
													>
														{categoryName}
													</Badge>
												)}
											</TableCell>
											<TableCell>
												{subcategoryName && (
													<Badge
														variant="outline"
														className="bg-background/50 text-[10px] font-normal border-white/10 text-muted-foreground"
													>
														{subcategoryName}
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-sm">
												{item.price_per_day} ₽
											</TableCell>
											<TableCell>
												<div
													className={cn(
														"h-2 w-2 rounded-full",
														item.is_available ? "bg-emerald-500" : "bg-red-500"
													)}
												/>
											</TableCell>
											<TableCell
												className="text-right"
												onClick={(e) => e.stopPropagation()}
											>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
														>
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="w-48 bg-white/20 border-white/10"
													>
														<DropdownMenuItem
															onClick={() => setActiveEquipment(item)}
														>
															<Edit2 className="w-4 h-4 mr-2" /> Редактировать
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleDuplicate(item.id)}
														>
															<Copy className="w-4 h-4 mr-2" /> Создать копию
														</DropdownMenuItem>
														<DropdownMenuSeparator className="bg-white/5" />
														<DropdownMenuItem
															className="text-red-500 focus:text-red-500"
															onClick={() => handleDelete(item.id)}
														>
															<Trash2 className="w-4 h-4 mr-2" /> Удалить
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})}
					</TableBody>
				</Table>
			</div>

			{activeEquipment && (
				<EquipmentDrawer
					key={activeEquipment.id}
					equipment={activeEquipment}
					open={!!activeEquipment}
					onOpenChange={(open) => !open && setActiveEquipment(null)}
					onUpdate={loadData}
					hasSiblings={countSiblings(activeEquipment.title) > 1}
				/>
			)}

			{/* Duplicate confirmation dialog */}
			<AlertDialog
				open={duplicateId !== null}
				onOpenChange={() => setDuplicateId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Создать копию позиции?</AlertDialogTitle>
						<AlertDialogDescription>
							Будет создана копия выбранной позиции с новым инвентарным номером.
							Все изображения и данные будут скопированы.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => duplicateId && handleDuplicate(duplicateId)}
							disabled={isPending}
						>
							Создать копию
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* FAB — добавить технику */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						asChild
						onClick={migrateCategoriesToIds}
						className={cn(
							"fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full shadow-2xl shadow-primary/30 group",
							"bg-primary hover:bg-primary/90 text-primary-foreground",
							"transition-all duration-300 active:scale-95",
							"flex items-center justify-center",
							// Расширяемый FAB при выборе элементов
							selectedIds.size > 0 && "w-auto px-5 gap-2 rounded-full"
						)}
					>
						<Link href="/admin/equipment/new">
							<Plus
								className={cn(
									"transition-transform duration-300 group-hover:scale-150",
									selectedIds.size > 0 ? "h-4 w-4" : "h-6 w-6"
								)}
							/>
							{selectedIds.size === 0 && (
								<span className="sr-only">Добавить технику</span>
							)}
							{selectedIds.size > 0 && (
								<span className="text-sm font-semibold whitespace-nowrap">
									Добавить технику
								</span>
							)}
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent side="left" className="text-xs">
					Добавить новую технику
				</TooltipContent>
			</Tooltip>
		</div>
	);
}
