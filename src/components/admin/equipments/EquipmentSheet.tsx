/** biome-ignore-all lint/suspicious/noArrayIndexKey: <this is> */
"use client";

import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Eye, Loader2, Pencil, Plus, Save, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
	createCategoryAction,
	createSubcategoryAction,
} from "@/actions/category-actions";
import {
	type CreateEquipmentData,
	createEquipmentAction,
	syncEquipmentByTitle,
	updateEquipment,
} from "@/actions/equipment-actions";
import { ImageCell } from "@/components/admin/equipments/ImageCell-improved";
import { RelatedEquipmentPicker } from "@/components/admin/equipments/RelatedEquipmentPicker";
import {
	Button,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	Textarea,
	Tooltip,
} from "@/components/ui";
import { SINKABLE_FIELDS } from "@/constants";
import type {
	DbCategory,
	DbEquipment,
	// DbEquipmentBase,
	DbEquipmentWithImages,
	DbSubcategory,
	EquipmentStatus,
	OwnershipType,
} from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";
import { useUnsavedChanges } from "@/store";

// ─── RelatedItemChip — shows an existing related item with remove button ──────
function RelatedItemChip({
	id,
	onRemove,
}: {
	id: string;
	onRemove: () => void;
}) {
	// We show just the short UUID since we don't fetch titles here
	// (titles are visible in the RelatedEquipmentPicker below)
	return (
		<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground/8 border border-foreground/10 text-xs font-medium text-foreground/70 group">
			<span className="font-mono text-[10px]">{id.slice(0, 8)}…</span>
			<button
				type="button"
				onClick={onRemove}
				className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-red-400"
			>
				<X size={11} />
			</button>
		</span>
	);
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Режим «редактирование» — передаём существующий equipment */
interface EditMode {
	mode: "edit";
	equipment: DbEquipmentWithImages;
	hasSiblings?: boolean;
}

/** Режим «создание» — equipment не передаём */
interface CreateMode {
	mode: "create";
	equipment?: undefined;
	hasSiblings?: undefined;
}

export type EquipmentSheetProps = (EditMode | CreateMode) & {
	open: boolean;
	/** Категории из БД — передаём сверху, чтобы не дублировать fetch */
	categories: DbCategory[];
	onOpenChange: (open: boolean) => void;
	/** Вызывается после успешного сохранения. В create-режиме получает новый id */
	onSuccess: (id?: string) => void;
	/** Вызывается когда пользователь создал новую категорию/подкатегорию inline
	 *  — родитель должен обновить свой список категорий */
	onCategoriesChange?: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeSpecsToText(specs: unknown): string {
	if (!specs) return "{}";
	if (typeof specs === "string") {
		try {
			JSON.parse(specs);
			return specs;
		} catch {
			return JSON.stringify({ description: specs }, null, 2);
		}
	}
	try {
		return JSON.stringify(specs, null, 2);
	} catch {
		return "{}";
	}
}

function safeParseSpecs(text: string): Record<string, unknown> {
	try {
		const parsed = JSON.parse(text);
		if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed))
			return parsed;
		return { value: String(parsed) };
	} catch {
		return text.trim() ? { description: text.trim() } : {};
	}
}

// ─── MarkdownEditor ───────────────────────────────────────────────────────────

function MarkdownEditor({
	label,
	value,
	onChange,
	placeholder,
	rows = 5,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	rows?: number;
}) {
	const [tab, setTab] = useState<"write" | "preview">("write");
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<Label>{label}</Label>
				<div className="flex items-center gap-0.5 rounded-md border border-white/10 bg-muted/10 p-0.5">
					{(["write", "preview"] as const).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setTab(t)}
							className={cn(
								"flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors",
								tab === t
									? "bg-primary/10 text-foreground"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							{t === "write" ? <Pencil size={9} /> : <Eye size={9} />}
							{t === "write" ? "Write" : "Preview"}
						</button>
					))}
				</div>
			</div>
			{tab === "write" ? (
				<Textarea
					rows={rows}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className="font-mono text-xs resize-none"
				/>
			) : (
				<div
					className="rounded-md border border-white/10 bg-muted/10 p-3 overflow-auto"
					style={{ minHeight: `${rows * 24}px` }}
				>
					{value ? (
						<SimpleMarkdown text={value} />
					) : (
						<span className="text-muted-foreground text-xs italic">
							Нет содержимого
						</span>
					)}
				</div>
			)}
		</div>
	);
}

function SimpleMarkdown({ text }: { text: string }) {
	return (
		<div className="space-y-0.5">
			{text.split("\n").map((line, i) => {
				if (line.startsWith("# "))
					return (
						<h1 key={i} className="text-base font-bold mb-1 mt-2">
							{line.slice(2)}
						</h1>
					);
				if (line.startsWith("## "))
					return (
						<h2 key={i} className="text-sm font-semibold mb-1 mt-2">
							{line.slice(3)}
						</h2>
					);
				if (line.startsWith("- ") || line.startsWith("* "))
					return (
						<li key={i} className="text-sm ml-4 list-disc">
							{line.slice(2)}
						</li>
					);
				if (line === "") return <br key={i} />;
				return (
					<p key={i} className="text-sm leading-relaxed">
						{line}
					</p>
				);
			})}
		</div>
	);
}

// ─── SpecsEditor ──────────────────────────────────────────────────────────────

function SpecsEditor({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	const [mode, setMode] = useState<"text" | "json" | "preview">(() => {
		try {
			const p = JSON.parse(value);
			const keys = Object.keys(p);
			if (keys.length === 1 && keys[0] === "description") return "text";
			if (keys.length > 0) return "json";
		} catch {}
		return "text";
	});
	const [hasJsonError, setHasJsonError] = useState(false);
	const [textValue, setTextValue] = useState(() => {
		try {
			const p = JSON.parse(value);
			return typeof p.description === "string" ? p.description : "";
		} catch {
			return typeof value === "string" && !value.startsWith("{") ? value : "";
		}
	});
	const [jsonValue, setJsonValue] = useState(() => {
		try {
			const p = JSON.parse(value);
			if (Object.keys(p).length === 1 && p.description) return '{\n  "": ""\n}';
			return JSON.stringify(p, null, 2);
		} catch {
			return '{\n  "": ""\n}';
		}
	});

	const handleTextChange = (t: string) => {
		setTextValue(t);
		onChange(JSON.stringify({ description: t }, null, 2));
	};
	const handleJsonChange = (t: string) => {
		setJsonValue(t);
		try {
			JSON.parse(t);
			setHasJsonError(false);
			onChange(t);
		} catch {
			setHasJsonError(true);
		}
	};

	let previewEntries: [string, string][] = [];
	try {
		previewEntries = Object.entries(
			JSON.parse(mode === "json" ? jsonValue : value)
		).map(([k, v]) => [k, String(v)]);
	} catch {}

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<Label className="flex items-center gap-2">
					✅ Xарактеристики
					{hasJsonError && mode === "json" && (
						<span className="text-[10px] text-amber-400 font-normal">
							невалидный JSON
						</span>
					)}
				</Label>
				<div className="flex items-center gap-0.5 rounded-md border border-white/10 bg-muted/10 p-0.5">
					{(["text", "json", "preview"] as const).map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => setMode(m)}
							className={cn(
								"flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors",
								mode === m
									? "bg-primary/10 text-foreground"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							{m === "text" ? (
								<Pencil size={9} />
							) : m === "json" ? (
								<span className="font-mono text-[9px] font-bold">{"{}"}</span>
							) : (
								<Eye size={9} />
							)}
							{m === "text" ? "Текст" : m === "json" ? "JSON" : "Preview"}
						</button>
					))}
				</div>
			</div>
			{mode === "text" && (
				<Textarea
					rows={7}
					value={textValue}
					onChange={(e) => handleTextChange(e.target.value)}
					className="text-xs resize-none"
					placeholder={
						"Произвольный текст с описанием характеристик...\n\nНапример:\nСенсор — Full Frame BSI CMOS\nРазрешение — 33 МП"
					}
				/>
			)}
			{mode === "json" && (
				<Textarea
					rows={7}
					value={jsonValue}
					onChange={(e) => handleJsonChange(e.target.value)}
					className={cn(
						"font-mono text-xs resize-none",
						hasJsonError &&
							"border-amber-400/50 focus-visible:ring-amber-400/30"
					)}
					placeholder={
						'{\n  "Сенсор": "Full Frame",\n  "Разрешение": "33MP"\n}'
					}
				/>
			)}
			{mode === "preview" && (
				<div className="min-h-42 rounded-md border border-white/10 bg-muted/10 p-3">
					{previewEntries.length > 0 ? (
						<dl className="divide-y divide-white/5">
							{previewEntries.map(([k, v]) => (
								<div key={k} className="flex gap-3 py-1.5">
									<dt className="text-xs text-muted-foreground w-36 shrink-0 truncate">
										{k}
									</dt>
									<dd className="text-xs font-medium flex-1 whitespace-pre-wrap">
										{v}
									</dd>
								</div>
							))}
						</dl>
					) : (
						<span className="text-muted-foreground text-xs italic">
							Нет данных
						</span>
					)}
				</div>
			)}
		</div>
	);
}

// ─── InlineCategoryCreator ────────────────────────────────────────────────────
// Маленький inline-блок для создания категории или подкатегории прямо в форме

function InlineCreator({
	placeholder,
	onConfirm,
	onCancel,
}: {
	placeholder: string;
	onConfirm: (name: string) => Promise<void>;
	onCancel: () => void;
}) {
	const [value, setValue] = useState("");
	const [pending, startTransition] = useTransition();

	const handleConfirm = () => {
		if (!value.trim()) return;
		startTransition(async () => {
			await onConfirm(value.trim());
		});
	};

	return (
		<div className="flex items-center gap-1.5 mt-1.5 p-2 bg-secondary/60 rounded-2xl shadow-primary">
			<Input
				autoFocus
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={placeholder}
				className="h-7 text-xs flex-1"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						handleConfirm();
					}
					if (e.key === "Escape") onCancel();
				}}
			/>
			<Button
				size="sm"
				variant="ghost"
				className="h-7 w-7 p-0"
				onClick={handleConfirm}
				disabled={pending || !value.trim()}
			>
				{pending ? (
					<Loader2 size={12} className="animate-spin" />
				) : (
					<Save size={12} />
				)}
			</Button>
			<Button
				size="sm"
				variant="ghost"
				className="h-7 w-7 p-0 text-muted-foreground"
				onClick={onCancel}
			>
				<X size={12} />
			</Button>
		</div>
	);
}

// ─── CategorySubcategorySelector ─────────────────────────────────────────────

function CategorySubcategorySelector({
	categories,
	categoryId,
	subcategoryId,
	onCategoryChange,
	onSubcategoryChange,
	onCategoriesChange,
}: {
	categories: DbCategory[];
	categoryId: string;
	subcategoryId: string;
	onCategoryChange: (id: string) => void;
	onSubcategoryChange: (id: string) => void;
	onCategoriesChange?: () => void;
}) {
	const [showNewCategory, setShowNewCategory] = useState(false);
	const [showNewSubcategory, setShowNewSubcategory] = useState(false);
	const [localCategories, setLocalCategories] = useState(categories);

	// Sync if parent updates
	useEffect(() => setLocalCategories(categories), [categories]);

	const selectedCat = localCategories.find((c) => c.id === categoryId);
	const subcategories: DbSubcategory[] = selectedCat?.subcategories ?? [];

	const handleCreateCategory = async (name: string) => {
		const result = await createCategoryAction({ name });
		if (!result.success || !result.category) {
			toast.error(result.error ?? "Ошибка создания категории");
			return;
		}

		// Явно добавляем пустой массив подкатегорий, чтобы типы совпали с DbCategory
		const newCat: DbCategory = { ...result.category, subcategories: [] };

		setLocalCategories((prev) => [...prev, newCat]);
		onCategoryChange(newCat.id);
		onSubcategoryChange("");
		setShowNewCategory(false);
		onCategoriesChange?.();
		toast.success(`Категория «${newCat.name}» создана`);
	};

	const handleCreateSubcategory = async (name: string) => {
		if (!categoryId) return;
		const result = await createSubcategoryAction({
			categoryId: categoryId,
			name,
		});
		if (!result.success || !result.subcategory) {
			toast.error(result.error ?? "Ошибка создания подкатегории");
			return;
		}
		const newSub = result.subcategory;
		setLocalCategories((prev) =>
			prev.map((cat) =>
				cat.id === categoryId
					? { ...cat, subcategories: [...cat.subcategories, newSub] }
					: cat
			)
		);
		onSubcategoryChange(newSub.id);
		setShowNewSubcategory(false);
		onCategoriesChange?.();
		toast.success(`Подкатегория «${newSub.name}» создана`);
	};

	return (
		<div className="grid md:grid-cols-2 gap-4">
			{/* ── Категория ── */}
			<div className="space-y-1.5">
				<Label>✅ Категория</Label>
				<Select
					value={categoryId}
					onValueChange={(v) => {
						onCategoryChange(v);
						onSubcategoryChange("");
					}}
				>
					<SelectTrigger className="w-full glass-input cursor-pointer">
						<SelectValue placeholder="Выберите категорию" />
					</SelectTrigger>
					<SelectContent>
						{localCategories.map((cat) => (
							<SelectItem
								key={cat.id}
								value={cat.id}
								className="cursor-pointer hover:bg-muted-foreground/30"
							>
								{cat.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{showNewCategory ? (
					<InlineCreator
						placeholder="Название новой категории..."
						onConfirm={handleCreateCategory}
						onCancel={() => setShowNewCategory(false)}
					/>
				) : (
					<Button
						variant="link"
						onClick={() => setShowNewCategory(true)}
						className="flex w-full justify-start text-muted-foreground items-center gap-1 text-sm transition-colors mt-1"
					>
						<Plus size={11} />
						Добавить новую категорию
					</Button>
				)}
			</div>

			{/* ── Подкатегория ── */}
			<div className="space-y-1.5">
				<Label>✅ Подкатегория</Label>
				<Select
					value={subcategoryId || "_none"}
					onValueChange={(v) => onSubcategoryChange(v === "_none" ? "" : v)}
					disabled={!categoryId}
				>
					<SelectTrigger className="w-full glass-input cursor-pointer dark:glass-input">
						<SelectValue
							placeholder={
								!categoryId
									? "Сначала выберите категорию"
									: subcategories.length === 0
										? "Нет подкатегорий"
										: "Выберите подкатегорию"
							}
						/>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="_none">— Без подкатегории —</SelectItem>
						{subcategories.map((sub) => (
							<SelectItem key={sub.id} value={sub.id}>
								{sub.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{categoryId &&
					(showNewSubcategory ? (
						<InlineCreator
							placeholder="Название новой подкатегории..."
							onConfirm={handleCreateSubcategory}
							onCancel={() => setShowNewSubcategory(false)}
						/>
					) : (
						<Button
							variant="link"
							onClick={() => setShowNewSubcategory(true)}
							className="flex w-full justify-start text-muted-foreground items-center gap-1 text-sm  mt-1"
						>
							<Plus size={11} />
							Добавить новую подкатегорию
						</Button>
					))}
			</div>
		</div>
	);
}

// ─── EquipmentSheet (main) ────────────────────────────────────────────────────

type EquipmentFormState = DbEquipment & {
	relatedIds: string[];
};

function buildInitialForm(equipment?: DbEquipment): EquipmentFormState {
	return {
		id: equipment?.id ?? "",
		isPrimary: equipment?.isPrimary ?? false,
		kit: equipment?.kit ?? "",
		specifications: equipment?.specifications ?? {},
		title: equipment?.title ?? "",
		description: equipment?.description ?? "",
		categoryId: equipment?.categoryId ?? "",
		subcategoryId: equipment?.subcategoryId ?? "",
		inventoryNumber: equipment?.inventoryNumber ?? "",
		pricePerDay: equipment?.pricePerDay ?? 0,
		price4h: equipment?.price4h ?? 0,
		price8h: equipment?.price8h ?? 0,
		deposit: equipment?.deposit ?? 0,
		replacementValue: equipment?.replacementValue ?? 0,
		status: equipment?.status ?? "AVAILABLE",
		isAvailable: equipment?.isAvailable ?? true,
		ownershipType: equipment?.ownershipType ?? "INTERNAL",
		partnerName: equipment?.partnerName ?? "",
		defects: equipment?.defects ?? "",
		kitDescription: equipment?.kitDescription ?? "",
		comments: equipment?.comments ?? [],
		slug: equipment?.slug ?? "",
		createdAt: equipment?.createdAt ?? new Date(),
		updatedAt: equipment?.updatedAt ?? new Date(),
		// Так как мы пока не загружаем связи из EquipmentRelation при редактировании,
		// оставляем пустой массив. Позже мы обновим getEquipmentById, чтобы он отдавал их.
		relatedIds: [],
	};
}

export function EquipmentSheet(props: EquipmentSheetProps) {
	const {
		open,
		onOpenChange,
		categories,
		onSuccess,
		onCategoriesChange,
		mode,
		equipment,
	} = props;
	const hasSiblings = props.hasSiblings ?? false;
	const { markClean, isDirty, markDirty } = useUnsavedChanges();

	const [isPending, setIsPending] = useState(false);
	const [syncFields, setSyncFields] = useState<string[]>([]);
	const [showSync, setShowSync] = useState(false);
	const [formData, setFormData] = useState<EquipmentFormState>(() =>
		buildInitialForm(equipment)
	);
	const [specText, setSpecText] = useState(() =>
		safeSpecsToText(equipment?.specifications)
	);
	const [commentsText, setCommentsText] = useState(() => {
		const c = equipment?.comments;
		if (!c || typeof c === "string") return (c as unknown as string) ?? "";
		if (Array.isArray(c)) {
			type OldComment = { text?: string; author?: string; createdAt?: string };
			return (c as OldComment[])
				.map((cm) => {
					if (!cm.text) return "";
					const date = cm.createdAt
						? new Date(cm.createdAt).toLocaleDateString("ru")
						: "";
					return `**${cm.author || "Аноним"}** (${date})\n\n${cm.text}`;
				})
				.filter(Boolean)
				.join("\n\n---\n\n");
		}
		return "";
	});

	const handleSpecChange = (v: string) => {
		markDirty();
		setSpecText(v);
	};

	const handleCommentsChange = (v: string) => {
		markDirty();
		setCommentsText(v);
	};

	// Сброс формы при открытии
	useEffect(() => {
		markClean();
		if (open) {
			setFormData(buildInitialForm(equipment));
			setSpecText(safeSpecsToText(equipment?.specifications));
			setSyncFields([]);
			setShowSync(false);
		}
	}, [open, equipment, markClean]);

	const set = (patch: Partial<EquipmentFormState>) =>
		setFormData((prev) => ({ ...prev, ...patch }));

	const handleSave = async () => {
		if (!formData.title.trim()) {
			toast.error("Укажите наименование");
			return;
		}
		if (!formData.categoryId) {
			toast.error("Выберите категорию");
			return;
		}
		if (!formData.pricePerDay) {
			toast.error("Укажите цену/сутки");
			return;
		}

		setIsPending(true);
		try {
			const specs = safeParseSpecs(specText);
			const commentsPayload = commentsText
				? [
						{
							id: crypto.randomUUID(),
							text: commentsText,
							author: "admin",
							createdAt: new Date().toISOString(),
						},
					]
				: [];

			if (mode === "create") {
				const payload: CreateEquipmentData = {
					title: formData.title.trim(),
					categoryId: formData.categoryId,
					subcategoryId: formData.subcategoryId || null,
					inventoryNumber: formData.inventoryNumber || undefined,
					pricePerDay: Number(formData.pricePerDay),
					price4h: formData.price4h ? Number(formData.price4h) : undefined,
					price8h: formData.price8h ? Number(formData.price8h) : undefined,
					deposit: formData.deposit ? Number(formData.deposit) : undefined,
					replacementValue: formData.replacementValue
						? Number(formData.replacementValue)
						: undefined,
					description: formData.description || undefined,
					kitDescription: formData.kitDescription || undefined,
					defects: formData.defects || undefined,
					status: formData.status,
					isAvailable: formData.isAvailable,
					ownershipType: formData.ownershipType,
					partnerName: formData.partnerName || undefined,
					// related_ids: formData.relatedIds,
					specifications: specs,
				};
				const result = await createEquipmentAction(payload);
				if (!result.success) {
					toast.error(result.error ?? "Ошибка создания");
					return;
				}
				toast.success("Позиция успешно создана");
				onSuccess(result.id);
				markClean();
				onOpenChange(false);
			} else {
				// edit mode
				await updateEquipment(equipment.id, {
					...formData,
					ownershipType: formData.ownershipType,
					status: formData.status as unknown as EquipmentStatus,
					pricePerDay: Number(formData.pricePerDay) || 0,
					price4h: Number(formData.price4h) || 0,
					price8h: Number(formData.price8h) || 0,
					deposit: Number(formData.deposit) || 0,
					replacementValue: Number(formData.replacementValue) || 0,
					subcategoryId: formData.subcategoryId || null,
					partnerName: formData.partnerName || null,
					// relatedIds: formData.relatedIds,
					specifications: specs,
					comments: commentsPayload,
				});
				if (syncFields.length > 0) {
					const result = await syncEquipmentByTitle(equipment.id, syncFields);
					toast.success(
						`Обновлено + синхронизировано ${syncFields.length} полей с ${result.updated} позициями`
					);
				} else {
					toast.success("Данные успешно обновлены");
				}
				onSuccess(equipment.id);
				markClean();
				onOpenChange(false);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Ошибка при сохранении");
		} finally {
			setIsPending(false);
		}
	};

	const isEdit = mode === "edit";
	const title = isEdit ? `Редактирование: ${equipment.title}` : "Новая позиция";
	const isPrimary =
		isEdit &&
		!!(equipment as DbEquipment & { is_primary?: boolean }).is_primary;

	const initialImages = isEdit
		? (equipment.equipmentImageLinks
				?.map((l) => ({ id: l.image.id, url: l.image.url }))
				.filter((i): i is { id: string; url: string } => !!(i.id && i.url)) ??
			[])
		: [];

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen && isDirty) {
			const confirmed = window.confirm(
				"Есть несохранённые изменения. Закрыть без сохранения?"
			);
			if (!confirmed) return;
		}
		if (!nextOpen) markClean();
		onOpenChange(nextOpen);
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent className="w-full sm:max-w-full md:w-[75vw] lg:w-[60vw] overflow-y-auto border-l border-white/10 backdrop-blur bg-background/90">
				<SheetHeader className="bg-muted-foreground/10 px-6 py-4">
					<div className="flex items-start justify-between gap-3">
						<SheetTitle className="text-xl font-bold leading-tight">
							{title}
						</SheetTitle>
						{isEdit && (
							<div className="flex flex-col items-end gap-1 shrink-0 pr-2">
								<span className="font-mono text-[10px] text-muted-foreground/60 select-all bg-muted/20 px-2 py-0.5 rounded border border-white/5">
									{equipment.id}
								</span>
								{isPrimary && (
									<div className="flex items-baseline gap-2 text-[10px] text-foreground font-semibold uppercase tracking-wider transition-all">
										<span>Отображается на сайте</span>
										<Tooltip>
											<TooltipTrigger className="cursor-pointer shadow-primary">
												<span className="text-amber-400 fill-amber-700/50 inline">
													✅
												</span>
											</TooltipTrigger>
											<TooltipContent
												side="bottom"
												className="relative z-5 text-background duration-300 max-w-fit px-2 pb-2 bg-foreground/80 rounded-xl backdrop-blur-2xl my-2 mx-5 flex flex-col gap-1 flex-wrap"
											>
												<span className="p-1 pt-2 bg-primary text-primary-foreground text-center rounded-b-md">
													Данные отмеченныые галочкой " ✅ " будут видны
													пользователям сайта
												</span>
												<span className="text-background/80 lowercase">
													- изображения и цены будут представлены в карточке
													товара ( в каталоге, избранном и т.д. )
												</span>
												<span className="text-background/80 lowercase">
													- описание, характеристики, обзоры, сопутствующие
													товары появятся на странице товара
												</span>
											</TooltipContent>
										</Tooltip>
									</div>
								)}
							</div>
						)}
					</div>
				</SheetHeader>

				<div className="no-scrollbar overflow-y-auto px-6 py-4 space-y-6">
					{/* IMAGES (только в режиме редактирования — нет id до создания) */}
					{isEdit && (
						<div className="space-y-2">
							<Label>✅ Галерея изображений</Label>
							<ImageCell
								equipmentId={equipment.id}
								initialImages={initialImages}
							/>
						</div>
					)}
					{!isEdit && (
						<div className="rounded-lg border border-white/10 bg-muted/10 p-3 text-xs text-muted-foreground">
							💡 Фотографии можно добавить после создания позиции через
							редактирование
						</div>
					)}

					{/* NAME */}
					<div className="space-y-1.5">
						<Label>✅ Наименование *</Label>
						<Input
							value={formData.title}
							onChange={(e) => {
								set({ title: e.target.value });
							}}
							placeholder="Название техники"
						/>
					</div>

					{/* INV NUMBER (отдельно) */}
					<div className="space-y-1.5">
						<Label>Инвентарный номер</Label>
						<Input
							value={formData.inventoryNumber ?? ""}
							placeholder="Уникальный инв. №"
							onChange={(e) => {
								set({ inventoryNumber: e.target.value });
							}}
						/>
					</div>

					{/* CATEGORY / SUBCATEGORY — с inline-созданием */}
					<CategorySubcategorySelector
						categories={categories}
						categoryId={formData.categoryId}
						subcategoryId={formData.subcategoryId ?? ""}
						onCategoryChange={(id) =>
							set({ categoryId: id, subcategoryId: "" })
						}
						onSubcategoryChange={(id) => set({ subcategoryId: id })}
						{...(onCategoriesChange ? { onCategoriesChange } : {})}
					/>

					{/* DESCRIPTION / SPECS */}
					{(!isEdit || isPrimary) && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<MarkdownEditor
								label="✅ Описание"
								value={formData.description ?? ""}
								onChange={(v) => {
									handleCommentsChange(v);
									set({ description: v });
								}}
								placeholder={
									"Описание в **markdown**...\n\n- пункт 1\n- пункт 2\n- пункт 3"
								}
								rows={7}
							/>
							<SpecsEditor
								value={specText}
								onChange={(v) => {
									handleSpecChange(v);
									setSpecText(v);
								}}
							/>
						</div>
					)}

					{/* RELATED EQUIPMENT */}
					{(!isEdit || isPrimary) && (
						<div className="space-y-3">
							<Label>
								✅ Сопутствующие позиции{" "}
								<strong>«Вместе с этим арендуют»</strong>
								<span className="font-normal text-muted-foreground ml-1 text-xs">
									— крестик удаляет, поле добавляет
								</span>
							</Label>
							{formData.relatedIds.length > 0 && (
								<div className="flex flex-wrap gap-2 p-3 rounded-xl bg-foreground/4 border border-foreground/8">
									{formData.relatedIds.map((id) => (
										<RelatedItemChip
											key={id}
											id={id}
											onRemove={() =>
												set({
													...formData,
													relatedIds: formData.relatedIds.filter(
														(rid) => rid !== id
													),
												})
											}
										/>
									))}
								</div>
							)}
							<RelatedEquipmentPicker
								value={formData.relatedIds}
								onChange={(ids) => set({ ...formData, relatedIds: ids })}
								{...(mode === "edit" ? { excludeId: equipment.id } : {})}
							/>
						</div>
					)}

					{/* PRICES */}
					<div className="grid grid-cols-3 gap-4">
						{[
							{ label: "✅ Цена 4ч", key: "price4h" as const },
							{ label: "✅ Цена 8ч", key: "price8h" as const },
							{ label: "✅ Цена/сутки *", key: "pricePerDay" as const },
						].map(({ label, key }) => (
							<div key={key} className="space-y-1.5">
								<Label>{label}</Label>
								<Input
									type="number"
									value={formData[key]}
									onChange={(e) => {
										set({
											[key]:
												e.target.value === "" ? "" : Number(e.target.value),
										});
									}}
								/>
							</div>
						))}
					</div>

					{/* STATUS / AVAILABILITY / OWNERSHIP */}
					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-1.5">
							<Label>Статус состояния</Label>
							<Select
								value={formData.status}
								onValueChange={(v: EquipmentStatus) => {
									set({ status: v });
								}}
							>
								<SelectTrigger className="glass-input">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="available"> Свободно</SelectItem>
									<SelectItem value="reserved">Зарезервировано</SelectItem>
									<SelectItem value="rented">В аренде</SelectItem>
									<SelectItem value="maintenance">На обслуживании</SelectItem>
									<SelectItem value="broken">Неисправно</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Доступность для аренды</Label>
							<Select
								value={String(formData.isAvailable)}
								onValueChange={(v) => {
									set({ isAvailable: v === "true" });
								}}
							>
								<SelectTrigger className="glass-input">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="true">Да</SelectItem>
									<SelectItem value="false">Нет</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Субаренда</Label>
							<Select
								value={formData.ownershipType}
								onValueChange={(v) => {
									set({ ownershipType: v as unknown as OwnershipType });
								}}
							>
								<SelectTrigger className="glass-input">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="sublease">Да</SelectItem>
									<SelectItem value="internal">Нет</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* KIT / DEFECTS */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<MarkdownEditor
							label="Комплектация"
							value={formData.kitDescription ?? ""}
							onChange={(v) => {
								set({ kitDescription: v });
							}}
							placeholder={"- Камера\n- Зарядное устройство\n- Кейс"}
							rows={5}
						/>
						<MarkdownEditor
							label="Состояние / Дефекты"
							value={formData.defects ?? ""}
							onChange={(v) => {
								set({ defects: v });
							}}
							placeholder="Укажите дефекты или **новое**"
							rows={5}
						/>
					</div>

					{/* DEPOSIT / REPLACEMENT */}
					<div className="grid grid-cols-2 gap-4">
						{[
							{ label: "Депозит", key: "deposit" as const },
							{ label: "Стоимость замены", key: "replacementValue" as const },
						].map(({ label, key }) => (
							<div key={key} className="space-y-1.5">
								<Label>{label}</Label>
								<Input
									type="number"
									value={formData[key]}
									onChange={(e) => {
										set({
											[key]:
												e.target.value === "" ? "" : Number(e.target.value),
										});
									}}
								/>
							</div>
						))}
					</div>

					{/* COMMENTS (только в edit-режиме) */}

					<MarkdownEditor
						label="Комментарии для сотрудников"
						value={commentsText}
						onChange={setCommentsText}
						placeholder={
							"Внутренние заметки в **markdown**...\n\n## Важно\n- ..."
						}
						rows={5}
					/>

					{/* SYNC (только в edit-режиме, когда есть siblings) */}

					{isEdit && hasSiblings && isPrimary && (
						<div className="border-t border-white/10 pt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowSync(!showSync)}
								className="mb-3"
							>
								{showSync
									? "Скрыть опции синхронизации"
									: "Синхронизировать с другими позициями"}
							</Button>
							{showSync && (
								<div className="space-y-2 p-3 bg-muted/20 rounded-lg">
									<p className="text-xs text-muted-foreground mb-2">
										Выберите поля для копирования во все позиции с идентичным
										наименованием
									</p>
									<div className="grid grid-cols-2 gap-2">
										{SINKABLE_FIELDS.map((field) => (
											<Label
												key={field.value}
												className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/30 p-2 rounded"
											>
												<input
													type="checkbox"
													checked={syncFields.includes(field.value)}
													onChange={() =>
														setSyncFields((prev) =>
															prev.includes(field.value)
																? prev.filter((f) => f !== field.value)
																: [...prev, field.value]
														)
													}
													className="w-4 h-4"
												/>
												<span>{field.label}</span>
											</Label>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<SheetFooter className="bg-muted-foreground/10 border-t border-white/10 px-6 py-4">
					<div className="flex gap-2 w-full">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => {
								if (isDirty) {
									const confirmed = window.confirm(
										"Есть несохранённые изменения?"
									);
									if (!confirmed) return;
								}
								markClean();
								onOpenChange(false);
							}}
						>
							Отмена
						</Button>
						<Button
							onClick={handleSave}
							className="flex-1"
							disabled={isPending}
						>
							{isPending ? (
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
							) : (
								<Save className="w-4 h-4 mr-2" />
							)}
							{mode === "create" ? "Создать" : "Сохранить"}
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
