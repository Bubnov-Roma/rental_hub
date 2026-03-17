"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Columns,
	Columns4,
	Copy,
	CopyPlus,
	Crown,
	Download,
	Edit2,
	MoreVertical,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { getCategoriesFromDb } from "@/actions/category-actions";
import {
	deleteEquipment,
	duplicateEquipment,
	type EquipmentFilter,
	type EquipmentSort,
	exportEquipment,
	getEquipmentWithFilters,
	setPrimaryEquipmentAction,
} from "@/actions/equipment-actions";
import { FilterBuilder } from "@/components/admin/equipments/FilterBuilder";
import { SortBuilder } from "@/components/admin/equipments/SortBuilder";
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
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Label,
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
import type {
	DbCategory,
	DbEquipment,
	DbEquipmentWithImages,
} from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";
import { useUnsavedChanges } from "@/store/unsaved-changes-store";
import { EquipmentSheet } from "./EquipmentSheet";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
	available: { label: "Доступно", color: "text-emerald-400" },
	rented: { label: "В аренде", color: "text-blue-400" },
	reserved: { label: "Забронировано", color: "text-amber-400" },
	maintenance: { label: "Обслуживание", color: "text-orange-400" },
	broken: { label: "Неисправно", color: "text-red-400" },
	archived: { label: "Архив", color: "text-zinc-500" },
};

function StatusBadge({
	status,
	isAvailable,
}: {
	status: string;
	isAvailable: boolean;
}) {
	const info = STATUS_LABELS[status] ?? {
		label: status,
		color: "text-muted-foreground",
	};
	return (
		<div className="flex items-center gap-1.5">
			<div
				className={cn(
					"h-1.5 w-1.5 rounded-full shrink-0",
					isAvailable ? "bg-emerald-500" : "bg-red-500"
				)}
			/>
			<span className={cn("text-xs", info.color)}>{info.label}</span>
		</div>
	);
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
	const queryClient = useQueryClient();
	const markClean = useUnsavedChanges((s) => s.markClean);
	const [duplicateId, setDuplicateId] = useState<string | null>(null);
	const [categories, setCategories] = useState<DbCategory[]>([]);
	const [showCreateSheet, setShowCreateSheet] = useState(false);
	const [filters, setFilters] = useState<EquipmentFilter[]>([]);
	const [sorts, setSorts] = useState<EquipmentSort[]>([]);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [activeEquipment, setActiveEquipment] =
		useState<DbEquipmentWithImages | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch] = useDebounceValue(searchTerm, 150);
	const [viewMode, setViewMode] = useState<"compact" | "extended">("compact");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		getCategoriesFromDb().then(setCategories);
	}, []);

	const getCategoryName = (id: string) =>
		categories.find((c) => c.id === id)?.name ?? id;
	const getSubcategoryName = (id: string): string => {
		if (!id) return "";
		for (const cat of categories) {
			const sub = cat.subcategories.find((s) => s.id === id);
			if (sub) return sub.name;
		}
		return id;
	};

	// ─── React Query: фоновое обновление без блокировки UI ───────────────────
	const queryKey = [
		"admin-equipment",
		debouncedSearch,
		filters,
		sorts,
	] as const;
	const { data: queryData, isFetching } = useQuery({
		queryKey,
		queryFn: () =>
			getEquipmentWithFilters({
				search: debouncedSearch,
				filters,
				sort: sorts,
			}),
		staleTime: 1000 * 30,
		gcTime: 1000 * 60 * 5,
		refetchOnWindowFocus: true,
		placeholderData: (prev) => prev,
	});
	const items = queryData?.data ?? [];
	const totalCount = queryData?.count ?? 0;
	// Первая загрузка = нет данных в кэше
	const isLoading = isFetching && items.length === 0;

	const refreshData = () => {
		queryClient.invalidateQueries({ queryKey: ["admin-equipment"] });
	};

	const countSiblings = (title: string) =>
		items.filter((item) => item.title === title).length;

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
		if (
			!confirm(
				`Удалить ${idsToDelete.length} поз.?\n\nПозиции участвующие в бронях будут архивированы (скрыты из каталога), но не удалены.`
			)
		)
			return;

		startTransition(async () => {
			try {
				const result = await deleteEquipment(idsToDelete);
				if (result.partial) {
					toast.warning(result.message ?? "Часть позиций архивирована");
				} else {
					toast.success(`Удалено позиций: ${idsToDelete.length}`);
				}
				setSelectedIds(new Set());
				refreshData();
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
				refreshData();
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

	const handleSetPrimary = async (id: string) => {
		startTransition(async () => {
			const result = await setPrimaryEquipmentAction(id);
			if (result.success) {
				toast.success("Позиция отмечена как основная (витрина)");
				refreshData();
			} else {
				toast.error(result.error ?? "Ошибка");
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
						Таблица оборудования
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
				<InputGroup className="relative flex-1 max-w-sm glass-input">
					<InputGroupAddon>
						<Search className="z-1 h-4 w-4 text-muted-foreground " />
					</InputGroupAddon>
					<InputGroupInput
						placeholder="Поиск по названию или инв. номеру..."
						className="pl-9 bg-muted-foreground/15 border-white/5"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</InputGroup>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(filters.length > 0 && "border-primary")}
						>
							Фильтры
							{filters.length > 0 && (
								<Badge variant="outline" className="ml-2">
									{filters.length}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-125 backdrop-blur-xl" align="start">
						<FilterBuilder
							onFiltersChange={setFilters}
							categories={categories}
						/>
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
								<Badge variant="outline" className="ml-2">
									{sorts.length}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-100 backdrop-blur-xl" align="start">
						<SortBuilder onSortChange={setSorts} />
					</PopoverContent>
				</Popover>

				{/* View mode toggle */}
				<div className="flex flex-col">
					<Label className="text-muted-foreground pb-0.5">Вид таблицы</Label>
					<div className="flex items-center gap-1 rounded-lg border border-foreground/10 bg-foreground/15 p-1">
						<Button
							variant="tab"
							size="sm"
							onClick={() => setViewMode("compact")}
							className={cn(
								"flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors",
								viewMode === "compact"
									? "bg-background text-foreground shadow-md"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<Columns size={13} />
							Сжатый
						</Button>
						<Button
							variant="tab"
							size="sm"
							onClick={() => setViewMode("extended")}
							className={cn(
								"flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors",
								viewMode === "extended"
									? "bg-background text-foreground shadow-md"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<Columns4 size={13} />
							Полный
						</Button>
					</div>
				</div>

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
							isFetching &&
								!isLoading &&
								"opacity-70 transition-opacity duration-200"
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
							<TableHead className="min-w-28">Статус</TableHead>
							{viewMode === "extended" && (
								<>
									<TableHead className="min-w-24">4ч / 8ч</TableHead>
									<TableHead className="min-w-22">Депозит</TableHead>
									<TableHead className="min-w-28">Замена</TableHead>
									<TableHead className="min-w-24">Владение</TableHead>
									<TableHead className="min-w-20">Инв. №</TableHead>
								</>
							)}
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
									const categoryName = getCategoryName(item.categoryId);
									const subcategoryName = getSubcategoryName(
										item.subcategoryId ?? ""
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
															item.equipmentImageLinks?.[0]?.image?.url ||
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
														{(item as DbEquipment & { is_primary?: boolean })
															.is_primary && (
															<Tooltip>
																<TooltipTrigger asChild>
																	<Crown
																		size={12}
																		className="text-amber-400  fill-amber-400  shrink-0"
																	/>
																</TooltipTrigger>
																<TooltipContent className="text-xs">
																	Основная позиция
																</TooltipContent>
															</Tooltip>
														)}
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
													{viewMode === "compact" && (
														<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
															{item.inventoryNumber}
														</span>
													)}
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
												{item.pricePerDay} ₽
											</TableCell>
											<TableCell>
												<StatusBadge
													status={item.status}
													isAvailable={item.isAvailable}
												/>
											</TableCell>
											{viewMode === "extended" && (
												<>
													<TableCell className="text-xs text-muted-foreground whitespace-nowrap">
														{item.price4h ? `${item.price4h} ₽` : "—"} /{" "}
														{item.price8h ? `${item.price8h} ₽` : "—"}
													</TableCell>
													<TableCell className="text-xs text-muted-foreground">
														{item.deposit ? `${item.deposit} ₽` : "—"}
													</TableCell>
													<TableCell className="text-xs text-muted-foreground">
														{item.replacementValue
															? `${item.replacementValue} ₽`
															: "—"}
													</TableCell>
													<TableCell>
														<Badge
															variant="outline"
															className={cn(
																"text-[10px] border-white/10",
																item.ownershipType === "SUBLEASE"
																	? "text-violet-400"
																	: "text-muted-foreground"
															)}
														>
															{item.ownershipType === "SUBLEASE"
																? "Субаренда"
																: "Своё"}
														</Badge>
													</TableCell>
													<TableCell className="text-[10px] text-muted-foreground font-mono">
														{item.inventoryNumber ?? "—"}
													</TableCell>
												</>
											)}
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
														{hasSiblings &&
															!(item as DbEquipment & { is_primary?: boolean })
																.is_primary && (
																<DropdownMenuItem
																	onClick={() => handleSetPrimary(item.id)}
																	className="text-amber-400 focus:text-amber-400"
																>
																	<Crown className="w-4 h-4 mr-2" /> Сделать
																	основной
																</DropdownMenuItem>
															)}
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
				<EquipmentSheet
					key={activeEquipment.id}
					mode="edit"
					equipment={activeEquipment}
					categories={categories}
					open={!!activeEquipment}
					onOpenChange={(open) => {
						if (!open) {
							markClean();
							setActiveEquipment(null);
						}
					}}
					onSuccess={() => refreshData()}
					onCategoriesChange={() => getCategoriesFromDb().then(setCategories)}
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
						onClick={() => setShowCreateSheet(true)}
						className={cn(
							"fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full shadow-2xl shadow-primary/30 group",
							"bg-primary hover:bg-primary/90 text-primary-foreground",
							"transition-all duration-300 active:scale-95",
							"flex items-center justify-center",
							selectedIds.size > 0 && "w-auto px-5 gap-2 rounded-full"
						)}
					>
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
					</Button>
				</TooltipTrigger>
				<TooltipContent side="left" className="text-xs">
					Добавить новую технику
				</TooltipContent>
			</Tooltip>
			<EquipmentSheet
				mode="create"
				categories={categories}
				open={showCreateSheet}
				onOpenChange={(open) => {
					if (!open) markClean();
					setShowCreateSheet(open);
				}}
				onSuccess={() => {
					refreshData();
					setShowCreateSheet(false);
				}}
				onCategoriesChange={() => getCategoriesFromDb().then(setCategories)}
			/>
		</div>
	);
}
