"use client";

import {
	ChevronDown,
	ChevronRight,
	Clock,
	Edit2,
	FolderOpen,
	GripVertical,
	History,
	Info,
	Layers,
	Plus,
	Save,
	StickyNote,
	Trash2,
	X,
} from "lucide-react";
// import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
	createCategoryAction,
	createSubcategoryAction,
	deleteCategoryAction,
	deleteSubcategoryAction,
	getCategoriesFromDb,
	getCategoryHistoryAction,
	reorderCategoriesAction,
	reorderSubcategoriesAction,
	updateCategoryAction,
	updateSubcategoryAction,
} from "@/actions/category-actions";
import { InlineEditField } from "@/components/shared";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import type {
	DbCategory,
	DbSubcategory,
} from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type HistoryEntry = {
	id: string;
	action: string;
	changedAt: Date;
	changes: Record<string, [unknown, unknown]> | null;
	profiles: { name: string; email: string } | null;
};

// ─── Icon picker (Lucide icon name stored as string) ─────────────────────────

const ICON_OPTIONS = [
	"Package",
	"Camera",
	"Video",
	"Mic",
	"Headphones",
	"Monitor",
	"Laptop",
	"Cpu",
	"Zap",
	"Settings",
	"Tool",
	"Box",
	"Archive",
	"Film",
	"Music",
	"Speaker",
	"Aperture",
	"Layers",
	"Grid",
	"Star",
	"Truck",
	"Wrench",
	"Compass",
	"Radio",
	"Tv",
	"Tablet",
] as const;

function IconPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex items-center gap-2 h-9 px-3 rounded-xl border border-white/10 bg-foreground/5 text-sm hover:border-primary/40 transition-colors"
			>
				<span className="font-mono text-xs text-primary">{value}</span>
				<ChevronDown size={12} className="text-muted-foreground" />
			</button>
			{open && (
				<div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-white/10 rounded-xl shadow-xl p-2 w-64 grid grid-cols-6 gap-1">
					{ICON_OPTIONS.map((icon) => (
						<button
							key={icon}
							type="button"
							title={icon}
							onClick={() => {
								onChange(icon);
								setOpen(false);
							}}
							className={cn(
								"p-2 rounded-lg text-[10px] font-mono text-center truncate",
								"hover:bg-primary/10 hover:text-primary transition-colors",
								value === icon && "bg-primary/10 text-primary"
							)}
						>
							{icon.slice(0, 3)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

// ─── CategoryRow ──────────────────────────────────────────────────────────────

function CategoryRow({
	cat,
	onUpdate,
	onDelete,
	onAddSub,
	onUpdateSub,
	onDeleteSub,
	onReorderSubs,
	dragHandleProps,
}: {
	cat: DbCategory;
	onUpdate: (id: string, data: Partial<DbCategory>) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	onAddSub: (catId: string, name: string) => Promise<void>;
	onUpdateSub: (subId: string, data: Partial<DbSubcategory>) => Promise<void>;
	onDeleteSub: (subId: string) => Promise<void>;
	onReorderSubs: (catId: string, orderedIds: string[]) => Promise<void>;
	dragHandleProps: {
		onDragStart: () => void;
		onDragOver: (e: React.DragEvent) => void;
		onDrop: () => void;
	};
}) {
	const [expanded, setExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [editName, setEditName] = useState(cat.name);
	const [editIcon, setEditIcon] = useState(cat.iconName ?? "Package");
	const [editNotes, setEditNotes] = useState(cat.adminNotes ?? "");
	const [editModular, setEditModular] = useState(cat.isModular ?? false);
	const [newSubName, setNewSubName] = useState("");
	const [isPending, startTransition] = useTransition();
	const [localSubs, setLocalSubs] = useState(cat.subcategories);
	const subDragIndex = useRef<number | null>(null);
	const subDragOverIndex = useRef<number | null>(null);

	// Sync local subs if cat changes
	useEffect(() => setLocalSubs(cat.subcategories), [cat.subcategories]);

	const handleSubDrop = async () => {
		const from = subDragIndex.current;
		const to = subDragOverIndex.current;
		if (from === null || to === null || from === to) return;
		const reordered = [...localSubs];
		const [moved] = reordered.splice(from, 1);
		if (!moved) return;
		reordered.splice(to, 0, moved);
		setLocalSubs(reordered);
		await onReorderSubs(
			cat.id,
			reordered.map((s) => s.id)
		);
		subDragIndex.current = null;
		subDragOverIndex.current = null;
	};

	const handleSave = () => {
		startTransition(async () => {
			await onUpdate(cat.id, {
				name: editName,
				iconName: editIcon,
				adminNotes: editNotes || undefined,
				isModular: editModular,
			});
			setEditing(false);
			toast.success("Категория обновлена");
		});
	};

	const loadHistory = async () => {
		const data = await getCategoryHistoryAction(cat.id);
		setHistory(data as unknown as HistoryEntry[]);
		setShowHistory(true);
	};

	return (
		<Card
			className="card-surface rounded-2xl border overflow-hidden"
			draggable
			onDragStart={dragHandleProps.onDragStart}
			onDragOver={dragHandleProps.onDragOver}
			onDrop={dragHandleProps.onDrop}
		>
			{/* Category header */}
			<div className="flex items-center gap-2 px-4">
				<GripVertical
					size={15}
					className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab shrink-0 transition-colors"
				/>

				<button
					type="button"
					onClick={() => setExpanded((e) => !e)}
					className="flex items-baseline justify-start gap-2 flex-1 min-w-0 text-left cursor-pointer"
				>
					{expanded ? (
						<ChevronDown size={10} className="text-muted-foreground shrink-0" />
					) : (
						<ChevronRight
							size={10}
							className="text-muted-foreground shrink-0"
						/>
					)}
					<span className="font-mono text-xs text-primary shrink-0">
						{editIcon}
					</span>
					{editing ? (
						<Input
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
							className="h-7 text-sm font-semibold"
							autoFocus
							onClick={(e) => e.stopPropagation()}
						/>
					) : (
						<span className="font-semibold text-sm truncate">{cat.name}</span>
					)}
					{cat.isModular && (
						<span className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-1.5 rounded-md bg-violet-500/15 text-violet-400">
							Модуль
						</span>
					)}
					<span className="text-xs text-muted-foreground/80 shrink-0">
						{cat.subcategories.length} шт.
					</span>
				</button>

				<div className="flex items-center gap-1 shrink-0">
					{editing ? (
						<>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 px-2"
								onClick={handleSave}
								disabled={isPending}
							>
								<Save size={13} className="mr-1" /> Сохранить
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 w-7 p-0"
								onClick={() => setEditing(false)}
							>
								<X size={13} />
							</Button>
						</>
					) : (
						<>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
								onClick={loadHistory}
							>
								<History size={13} className="text-muted-foreground" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 w-7 p-0"
								onClick={() => {
									setEditing(true);
									setExpanded(true);
								}}
							>
								<Edit2 size={13} className="text-muted-foreground" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 w-7 p-0 hover:text-red-500 hover:bg-red-500/10"
								onClick={() => {
									if (confirm(`Удалить категорию «${cat.name}»?`))
										startTransition(() => onDelete(cat.id));
								}}
							>
								<Trash2 size={13} />
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Editing panel */}
			{editing && (
				<div className="px-4 pb-4 pt-0 border-t border-white/5 space-y-3 bg-foreground/2">
					<div className="grid grid-cols-2 gap-3 pt-3">
						<div className="space-y-1.5">
							<Label className="text-xs">Иконка (Lucide name)</Label>
							<IconPicker value={editIcon} onChange={setEditIcon} />
						</div>
						<div className="flex items-center gap-2 pt-5">
							<input
								type="checkbox"
								id={`mod-${cat.id}`}
								checked={editModular}
								onChange={(e) => setEditModular(e.target.checked)}
								className="accent-violet-500"
							/>
							<label
								htmlFor={`mod-${cat.id}`}
								className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
							>
								<Layers size={13} /> Модульная категория
							</label>
						</div>
					</div>
					<div className="space-y-1.5">
						<Label className="text-xs flex items-center gap-1">
							<StickyNote size={11} /> Заметки для сотрудников
						</Label>
						<Textarea
							value={editNotes}
							onChange={(e) => setEditNotes(e.target.value)}
							rows={2}
							placeholder="Внутренняя заметка для админов и менеджеров..."
							className="text-xs resize-none"
						/>
					</div>
				</div>
			)}

			{/* History panel */}
			{showHistory && (
				<div className="px-4 pb-4 border-t border-white/5 bg-foreground/2">
					<div className="flex items-center justify-between py-2">
						<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
							<Clock size={11} /> История изменений
						</span>
						<button type="button" onClick={() => setShowHistory(false)}>
							<X size={13} className="text-muted-foreground" />
						</button>
					</div>
					{history.length === 0 ? (
						<p className="text-xs text-muted-foreground/50">Нет записей</p>
					) : (
						<div className="space-y-1">
							{history.map((h) => (
								<div
									key={h.id}
									className="text-xs flex items-start gap-2 py-1 border-b border-white/5 last:border-0"
								>
									<span
										className={cn(
											"shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
											h.action === "created" &&
												"bg-green-500/15 text-green-400",
											h.action === "updated" && "bg-blue-500/15 text-blue-400",
											h.action === "deleted" && "bg-red-500/15 text-red-400"
										)}
									>
										{h.action === "created"
											? "создан"
											: h.action === "updated"
												? "изменён"
												: "удалён"}
									</span>
									<span className="text-muted-foreground flex-1">
										{h.profiles?.name ?? "Система"} ·{" "}
										{new Date(h.changedAt).toLocaleString("ru-RU")}
										{h.changes && Object.keys(h.changes).length > 0 && (
											<span className="ml-1 text-muted-foreground/50">
												({Object.keys(h.changes).join(", ")})
											</span>
										)}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Admin notes display */}
			{!editing && cat.adminNotes && (
				<div className="px-4 pb-3 flex items-start gap-2">
					<Info size={11} className="text-amber-400 mt-0.5 shrink-0" />
					<p className="text-xs text-amber-400/80 italic">{cat.adminNotes}</p>
				</div>
			)}

			{/* Subcategories */}
			{expanded && (
				<div className="border-t border-foreground/5 px-4 py-3 space-y-2">
					{localSubs.map((sub, subIndex) => (
						<SubcategoryRow
							key={sub.id}
							sub={sub}
							onUpdate={onUpdateSub}
							onDelete={onDeleteSub}
							dragHandleProps={{
								onDragStart: () => {
									subDragIndex.current = subIndex;
								},
								onDragOver: (e) => {
									e.preventDefault();
									subDragOverIndex.current = subIndex;
								},
								onDrop: handleSubDrop,
							}}
						/>
					))}
					{/* Add subcategory inline */}
					<InlineEditField
						value={newSubName}
						onChange={(e) => setNewSubName(e.target.value)}
						onAdd={async (name) => {
							if (!name.trim()) return;
							await onAddSub(cat.id, name.trim());
							setNewSubName("");
						}}
						placeholder="Новая подкатегория..."
						className="h-8 text-sm"
						mode="create"
						autoFocus={false}
					/>
				</div>
			)}
		</Card>
	);
}

// ─── SubcategoryRow ───────────────────────────────────────────────────────────

function SubcategoryRow({
	sub,
	onUpdate,
	onDelete,
	dragHandleProps,
}: {
	sub: DbSubcategory;
	onUpdate: (id: string, data: Partial<DbSubcategory>) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	dragHandleProps?: {
		onDragStart: () => void;
		onDragOver: (e: React.DragEvent) => void;
		onDrop: () => void;
	};
}) {
	const [editing, setEditing] = useState(false);
	const [editName, setEditName] = useState(sub.name);
	const [editNotes, setEditNotes] = useState(sub.adminNotes ?? "");
	const [isPending, startTransition] = useTransition();

	const handleSave = () => {
		startTransition(async () => {
			await onUpdate(sub.id, {
				name: editName,
				adminNotes: editNotes || undefined,
			});
			setEditing(false);
			toast.success("Подкатегория обновлена");
		});
	};

	return (
		<Card
			className={cn(
				"p-0",
				editing ? "bg-foreground/5" : "hover:bg-foreground/5",
				dragHandleProps && "cursor-grab active:cursor-grabbing"
			)}
			draggable={!!dragHandleProps}
			onDragStart={dragHandleProps?.onDragStart}
			onDragOver={dragHandleProps?.onDragOver}
			onDrop={dragHandleProps?.onDrop}
		>
			<div className={cn("flex items-center w-full gap-2 rounded-lg group")}>
				{dragHandleProps ? (
					<GripVertical
						size={11}
						className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors"
					/>
				) : (
					<ChevronRight
						size={11}
						className="text-muted-foreground/30 shrink-0"
					/>
				)}
				{editing ? (
					<div className="flex-1 space-y-1.5">
						<Input
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
							className="h-7 text-sm"
							autoFocus
						/>
						<Input
							value={editNotes}
							onChange={(e) => setEditNotes(e.target.value)}
							placeholder="Заметка для сотрудников..."
							className="h-7 text-xs"
						/>
					</div>
				) : (
					<div className="flex-1 min-w-0">
						<span className="text-sm truncate">{sub.name}</span>
						{sub.adminNotes && (
							<p className="text-[11px] text-amber-400/70 truncate">
								{sub.adminNotes}
							</p>
						)}
					</div>
				)}

				<div className="flex items-center gap-1 shrink-0">
					{editing ? (
						<>
							<Button
								size="sm"
								variant="ghost"
								className="h-6 px-2 text-xs"
								onClick={handleSave}
								disabled={isPending}
							>
								<Save size={11} className="mr-1" /> Ок
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-6 w-6 p-0"
								onClick={() => setEditing(false)}
							>
								<X size={11} />
							</Button>
						</>
					) : (
						<>
							<Button
								size="sm"
								variant="ghost"
								className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={() => setEditing(true)}
							>
								<Edit2 size={11} className="text-muted-foreground" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-opacity"
								onClick={() => {
									if (confirm(`Удалить подкатегорию «${sub.name}»?`))
										startTransition(() => onDelete(sub.id));
								}}
							>
								<Trash2 size={11} />
							</Button>
						</>
					)}
				</div>
			</div>
		</Card>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCategoriesClient({
	initialCategories,
}: {
	initialCategories: DbCategory[];
}) {
	const [categories, setCategories] = useState(initialCategories);
	const [isPending, startTransition] = useTransition();
	const [newCatName, setNewCatName] = useState("");
	const [newCatIcon, setNewCatIcon] = useState("Package");
	const [newCatModular, setNewCatModular] = useState(false);
	const [showAddForm, setShowAddForm] = useState(false);

	const refresh = useCallback(async () => {
		const fresh = await getCategoriesFromDb();
		setCategories(fresh);
	}, []);

	// ─── Drag & Drop ────────────────────────────────────────────────────────
	const dragIndex = useRef<number | null>(null);
	const dragOverIndex = useRef<number | null>(null);

	const handleDrop = async () => {
		const from = dragIndex.current;
		const to = dragOverIndex.current;
		if (from === null || to === null || from === to) return;

		const reordered = [...categories];
		const [moved] = reordered.splice(from, 1);
		if (!moved) return;
		reordered.splice(to, 0, moved);
		setCategories(reordered);

		const result = await reorderCategoriesAction(reordered.map((c) => c.id));
		if (!result.success) toast.error("Ошибка сохранения");
		else toast.success("Порядок категорий обновлён");

		dragIndex.current = null;
		dragOverIndex.current = null;
	};

	// ─── CRUD handlers ───────────────────────────────────────────────────────

	const handleCreateCat = async () => {
		if (!newCatName.trim()) return;
		startTransition(async () => {
			const result = await createCategoryAction({
				name: newCatName.trim(),
				iconName: newCatIcon,
				isModular: newCatModular,
			});
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			toast.success(`Категория «${newCatName}» создана`);
			setNewCatName("");
			setNewCatModular(false);
			setShowAddForm(false);
			await refresh();
		});
	};

	const handleUpdateCat = async (id: string, data: Partial<DbCategory>) => {
		const result = await updateCategoryAction(id, data);
		if (!result.success) toast.error(result.error);
		await refresh();
	};

	const handleDeleteCat = async (id: string) => {
		const result = await deleteCategoryAction(id);
		if (!result.success) {
			toast.error(result.error);
			return;
		}
		toast.success("Категория удалена");
		await refresh();
	};

	const handleAddSub = async (catId: string, name: string) => {
		const result = await createSubcategoryAction({ categoryId: catId, name });
		if (!result.success) {
			toast.error(result.error);
			return;
		}
		toast.success(`Подкатегория «${name}» создана`);
		await refresh();
	};

	const handleUpdateSub = async (
		subId: string,
		data: Partial<DbSubcategory>
	) => {
		const result = await updateSubcategoryAction(subId, data);
		if (!result.success) toast.error(result.error);
		await refresh();
	};

	const handleDeleteSub = async (subId: string) => {
		const result = await deleteSubcategoryAction(subId);
		if (!result.success) {
			toast.error(result.error);
			return;
		}
		toast.success("Подкатегория удалена");
		await refresh();
	};

	const handleReorderSubs = async (_catId: string, orderedIds: string[]) => {
		const result = await reorderSubcategoriesAction(orderedIds);
		if (!result.success) toast.error("Ошибка сохранения порядка подкатегорий");
		else toast.success("Порядок подкатегорий сохранён");
		await refresh();
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
						<FolderOpen size={22} className="text-primary" />
						Категории
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{categories.length} категорий · Перетащите для изменения порядка
					</p>
				</div>
				<Button
					onClick={() => setShowAddForm((s) => !s)}
					className="gap-2"
					size="sm"
				>
					{showAddForm ? <X size={14} /> : <Plus size={14} />}
					{showAddForm ? "Отмена" : "Добавить категорию"}
				</Button>
			</div>

			{/* Add category form */}
			{showAddForm && (
				<div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
					<p className="text-sm font-bold">Новая категория</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div className="space-y-1.5 md:col-span-2">
							<Label className="text-xs">Название</Label>
							<Input
								value={newCatName}
								onChange={(e) => setNewCatName(e.target.value)}
								placeholder="Например: Мониторы"
								autoFocus
								onKeyDown={(e) => e.key === "Enter" && handleCreateCat()}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Иконка</Label>
							<IconPicker value={newCatIcon} onChange={setNewCatIcon} />
						</div>
					</div>
					<div className="flex items-center gap-3">
						<label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
							<input
								type="checkbox"
								checked={newCatModular}
								onChange={(e) => setNewCatModular(e.target.checked)}
								className="accent-violet-500"
							/>
							<Layers size={13} /> Модульная (комплект из разных категорий)
						</label>
						<Button
							size="sm"
							className="ml-auto"
							disabled={!newCatName.trim() || isPending}
							onClick={handleCreateCat}
						>
							<Save size={13} className="mr-1" /> Создать
						</Button>
					</div>
				</div>
			)}

			{/* Categories list */}
			<div className="space-y-2">
				{categories.map((cat, index) => (
					<div key={cat.id} className="group">
						<CategoryRow
							cat={cat}
							onUpdate={handleUpdateCat}
							onDelete={handleDeleteCat}
							onAddSub={handleAddSub}
							onUpdateSub={handleUpdateSub}
							onDeleteSub={handleDeleteSub}
							onReorderSubs={handleReorderSubs}
							dragHandleProps={{
								onDragStart: () => {
									dragIndex.current = index;
								},
								onDragOver: (e) => {
									e.preventDefault();
									dragOverIndex.current = index;
								},
								onDrop: handleDrop,
							}}
						/>
					</div>
				))}
				{categories.length === 0 && (
					<div className="text-center py-16 text-muted-foreground">
						<FolderOpen size={32} className="mx-auto mb-3 opacity-20" />
						<p>Категорий ещё нет. Создайте первую.</p>
					</div>
				)}
			</div>
		</div>
	);
}
