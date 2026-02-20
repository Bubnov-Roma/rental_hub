"use client";

import { Eye, Loader2, Pencil, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	syncEquipmentByTitle,
	updateEquipment,
} from "@/app/actions/equipment-actions";
import { ImageCell } from "@/components/admin/ImageCell-improved";
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
} from "@/components/ui";
import { SINKABLE_FIELDS } from "@/constants";
import { CATEGORIES } from "@/constants/categories";
import type {
	DbEquipment,
	EquipmentStatus,
} from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";

// NOTE: Установите react-markdown если ещё нет: npm install react-markdown
// Если не хотите зависимость — компонент MarkdownPreview можно убрать,
// оставив только Textarea.
// const ReactMarkdown: React.ComponentType<{ children: string }> | null = null;
// try {
// 	// Dynamic fallback — реальный импорт делайте статически выше
// 	// import ReactMarkdown from "react-markdown";
// } catch {}

interface EquipmentDrawerProps {
	equipment: DbEquipment;
	open: boolean;
	onUpdate: () => void;
	onOpenChange: (open: boolean) => void;
	hasSiblings?: boolean;
}

/** Безопасный перевод specifications в текст для редактора */
function safeSpecsToText(specs: unknown): string {
	if (!specs) return "{}";
	if (typeof specs === "string") {
		try {
			// Проверяем что это валидный JSON
			JSON.parse(specs);
			return specs;
		} catch {
			// Кириллица/plain-text — оборачиваем в объект
			return JSON.stringify({ description: specs }, null, 2);
		}
	}
	try {
		return JSON.stringify(specs, null, 2);
	} catch {
		return "{}";
	}
}

/** Безопасный парсинг — не кидает исключение при save */
function safeParseSpecs(text: string): Record<string, unknown> {
	try {
		const parsed = JSON.parse(text);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			!Array.isArray(parsed)
		) {
			return parsed;
		}
		return { value: String(parsed) };
	} catch {
		// Невалидный JSON (например plain-text) — сохраняем как description
		return text.trim() ? { description: text.trim() } : {};
	}
}

/** Markdown-редактор с вкладками Write / Preview */
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
					<button
						type="button"
						onClick={() => setTab("write")}
						className={cn(
							"flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors",
							tab === "write"
								? "bg-primary/20 text-primary"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<Pencil size={9} />
						Write
					</button>
					<button
						type="button"
						onClick={() => setTab("preview")}
						className={cn(
							"flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors",
							tab === "preview"
								? "bg-primary/20 text-primary"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<Eye size={9} />
						Preview
					</button>
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
						// Простой markdown-рендер без зависимостей
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

/** Лёгкий markdown-рендер без зависимостей (базовые теги) */
function SimpleMarkdown({ text }: { text: string }) {
	const lines = text.split("\n");
	const elements: React.ReactNode[] = [];

	lines.forEach((line, i) => {
		const key = i;
		if (line.startsWith("# ")) {
			elements.push(
				<h1 key={key} className="text-base font-bold mb-1 mt-2">
					{inlineFormat(line.slice(2))}
				</h1>
			);
		} else if (line.startsWith("## ")) {
			elements.push(
				<h2 key={key} className="text-sm font-semibold mb-1 mt-2">
					{inlineFormat(line.slice(3))}
				</h2>
			);
		} else if (line.startsWith("### ")) {
			elements.push(
				<h3 key={key} className="text-xs font-semibold mb-1 mt-1">
					{inlineFormat(line.slice(4))}
				</h3>
			);
		} else if (line.startsWith("- ") || line.startsWith("* ")) {
			elements.push(
				<li key={key} className="text-sm ml-4 list-disc">
					{inlineFormat(line.slice(2))}
				</li>
			);
		} else if (/^\d+\.\s/.test(line)) {
			elements.push(
				<li key={key} className="text-sm ml-4 list-decimal">
					{inlineFormat(line.replace(/^\d+\.\s/, ""))}
				</li>
			);
		} else if (line.startsWith("---")) {
			elements.push(<hr key={key} className="border-white/10 my-2" />);
		} else if (line === "") {
			elements.push(<br key={key} />);
		} else {
			elements.push(
				<p key={key} className="text-sm leading-relaxed">
					{inlineFormat(line)}
				</p>
			);
		}
	});

	return <div className="space-y-0.5">{elements}</div>;
}

function inlineFormat(text: string): React.ReactNode {
	// **bold** и `code`
	const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
	return parts.map((part, i) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return (
				<strong key={`${part}` + `${i}`} className="font-semibold">
					{part.slice(2, -2)}
				</strong>
			);
		}
		if (part.startsWith("`") && part.endsWith("`")) {
			return (
				<code
					key={`${part}` + `${i}`}
					className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono"
				>
					{part.slice(1, -1)}
				</code>
			);
		}
		return part;
	});
}

/**
 * Редактор характеристик — три режима:
 * TEXT  — свободный текст (сохраняется как { description: "..." })
 * JSON  — структурированный JSON объект (ключ: значение)
 * PREVIEW — красивая таблица характеристик для просмотра
 *
 * При смене режима TEXT → JSON конвертируем текст в шаблон,
 * при JSON → TEXT достаём description или stringifies весь объект.
 */
function SpecsEditor({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	// Определяем начальный режим: если value — валидный JSON с ≥1 ключом кроме description, то json
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

	// Текст в режиме TEXT (достаём из JSON если там description)
	const [textValue, setTextValue] = useState<string>(() => {
		try {
			const p = JSON.parse(value);
			return typeof p.description === "string" ? p.description : "";
		} catch {
			return typeof value === "string" && !value.startsWith("{") ? value : "";
		}
	});

	// JSON-текст в режиме JSON
	const [jsonValue, setJsonValue] = useState<string>(() => {
		try {
			const p = JSON.parse(value);
			// Если только description — конвертируем в шаблон
			if (Object.keys(p).length === 1 && p.description) {
				return '{\n  "": ""\n}';
			}
			return JSON.stringify(p, null, 2);
		} catch {
			return '{\n  "": ""\n}';
		}
	});

	const switchMode = (next: "text" | "json" | "preview") => {
		// Синхронизируем внутреннее состояние при переключении
		if (mode === "text" && next === "json") {
			// TEXT → JSON: создаём шаблон с полем description если текст не пустой
			if (textValue.trim()) {
				const template = JSON.stringify(
					{ description: textValue.trim() },
					null,
					2
				);
				setJsonValue(template);
				onChange(template);
			}
		} else if (mode === "json" && next === "text") {
			// JSON → TEXT: достаём description если есть
			try {
				const p = JSON.parse(jsonValue);
				setTextValue(p.description || "");
				const wrapped = JSON.stringify(
					{ description: p.description || "" },
					null,
					2
				);
				onChange(wrapped);
			} catch {
				setTextValue("");
				onChange("{}");
			}
		}
		setMode(next);
	};

	const handleJsonChange = (text: string) => {
		setJsonValue(text);
		try {
			JSON.parse(text);
			setHasJsonError(false);
			onChange(text);
		} catch {
			setHasJsonError(true);
			// Не вызываем onChange при невалидном JSON — не портим данные
		}
	};

	const handleTextChange = (text: string) => {
		setTextValue(text);
		onChange(JSON.stringify({ description: text }, null, 2));
	};

	// Для preview режима
	let previewEntries: [string, string][] = [];
	try {
		const parsed = JSON.parse(mode === "json" ? jsonValue : value);
		previewEntries = Object.entries(parsed)
			.filter(([k]) => k !== "description" || mode !== "text")
			.map(([k, v]) => [k, String(v)]);
	} catch {}

	const tabBtn = (
		id: "text" | "json" | "preview",
		label: string,
		icon: React.ReactNode
	) => (
		<button
			type="button"
			onClick={() => switchMode(id)}
			className={cn(
				"flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors",
				mode === id
					? "bg-primary/20 text-primary"
					: "text-muted-foreground hover:text-foreground"
			)}
		>
			{icon}
			{label}
		</button>
	);

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<Label className="flex items-center gap-2">
					Технические характеристики
					{hasJsonError && mode === "json" && (
						<span className="text-[10px] text-amber-400 font-normal">
							невалидный JSON
						</span>
					)}
				</Label>
				<div className="flex items-center gap-0.5 rounded-md border border-white/10 bg-muted/10 p-0.5">
					{tabBtn("text", "Текст", <Pencil size={9} />)}
					{tabBtn(
						"json",
						"JSON",
						<span className="font-mono text-[9px] font-bold leading-none">
							{"{}"}
						</span>
					)}
					{tabBtn("preview", "Preview", <Eye size={9} />)}
				</div>
			</div>

			{mode === "text" && (
				<Textarea
					rows={7}
					value={textValue}
					onChange={(e) => handleTextChange(e.target.value)}
					className="text-xs resize-none"
					placeholder={
						"Произвольный текст с описанием характеристик...\n\nНапример:\nСенсор — Full Frame BSI CMOS\nРазрешение — 33 МП\nISO — 100-51200"
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
					{/* Если режим был text — показываем текст напрямую */}
					{textValue && !jsonValue.includes('"') ? (
						<p className="text-xs text-muted-foreground whitespace-pre-line">
							{textValue}
						</p>
					) : previewEntries.length > 0 ? (
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
							Нет данных для отображения
						</span>
					)}
				</div>
			)}

			{/* Подсказка о совместимости с Supabase */}
			<p className="text-[10px] text-muted-foreground/50">
				{mode === "text"
					? 'Текст сохраняется в JSONB как { description: "..." } — совместимо с Supabase'
					: mode === "json"
						? "JSON объект сохраняется напрямую в JSONB поле specifications"
						: ""}
			</p>
		</div>
	);
}

export function EquipmentDrawer({
	equipment,
	open,
	onUpdate,
	onOpenChange,
	hasSiblings = false,
}: EquipmentDrawerProps) {
	const [isPending, setIsPending] = useState(false);
	const [syncFields, setSyncFields] = useState<string[]>([]);
	const [showSync, setShowSync] = useState(false);

	const initialImages =
		equipment.equipment_image_links
			?.map((link) => ({
				id: link.images?.id,
				url: link.images?.url,
			}))
			.filter((img) => img.id && img.url) || [];

	const [formData, setFormData] = useState<Partial<DbEquipment>>({
		title: equipment.title,
		description: equipment.description ?? "",
		category: equipment.category,
		subcategory: equipment.subcategory ?? "",
		inventory_number: equipment.inventory_number,
		price_per_day: equipment.price_per_day,
		price_4h: equipment.price_4h,
		price_8h: equipment.price_8h,
		deposit: equipment.deposit,
		replacement_value: equipment.replacement_value,
		status: equipment.status,
		is_available: equipment.is_available,
		ownership_type: equipment.ownership_type,
		partner_name: equipment.partner_name,
		defects: equipment.defects ?? "",
		kit_description: equipment.kit_description ?? "",
		related_ids: equipment.related_ids ?? [],
	});

	// Specs отдельно как текст — не JSON.parse при каждом keystroke
	const [specText, setSpecText] = useState(() =>
		safeSpecsToText(equipment.specifications)
	);

	// Comments как markdown — конвертируем из старого массива если нужно
	const [commentsText, setCommentsText] = useState(() => {
		const c = equipment.comments;
		if (!c) return "";
		if (typeof c === "string") return c;
		if (Array.isArray(c)) {
			type OldComment = { text?: string; author?: string; created_at?: string };
			return (c as OldComment[])
				.map((comment) => {
					if (!comment.text) return "";
					const date = comment.created_at
						? new Date(comment.created_at).toLocaleDateString("ru")
						: "";
					return `**${comment.author || "Аноним"}** (${date})\n\n${comment.text}`;
				})
				.filter(Boolean)
				.join("\n\n---\n\n");
		}
		return "";
	});

	const handleSave = async () => {
		setIsPending(true);
		try {
			const finalSpecs = safeParseSpecs(specText);

			await updateEquipment(equipment.id, {
				...formData,
				specifications: finalSpecs,
				// Комментарии сохраняем как markdown в jsonb-массив из одного элемента
				comments: commentsText
					? [
							{
								id: crypto.randomUUID(),
								text: commentsText,
								author: "admin",
								created_at: new Date().toISOString(),
							},
						]
					: [],
			});

			if (syncFields.length > 0) {
				const result = await syncEquipmentByTitle(equipment.id, syncFields);
				toast.success(
					`Обновлено + синхронизировано ${syncFields.length} полей с ${result.updated} позициями`
				);
			} else {
				toast.success("Данные успешно обновлены");
			}

			onUpdate();
			onOpenChange(false);
		} catch (error) {
			console.error("Save error:", error);
			toast.error(
				error instanceof Error ? error.message : "Ошибка при сохранении данных"
			);
		} finally {
			setIsPending(false);
		}
	};

	const toggleSyncField = (field: string) => {
		setSyncFields((prev) =>
			prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
		);
	};

	const validImages = initialImages
		.filter((img) => img.id && img.url)
		.map(({ id, url }) => ({ id: id ?? "", url: url ?? "" }));

	const subcategories =
		CATEGORIES.find((c) => c.id === formData.category)?.subcategories ?? [];

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-full md:w-[75vw] lg:w-[60vw] overflow-y-auto border-l border-white/10 backdrop-blur bg-background/80">
				<SheetHeader className="bg-muted-foreground/10 px-6 py-4">
					<SheetTitle className="text-xl font-bold">
						Редактирование: {equipment.title}
					</SheetTitle>
				</SheetHeader>

				<div className="no-scrollbar overflow-y-auto px-6 py-4 space-y-6">
					{/** IMAGES */}
					<div className="space-y-2">
						<Label>Галерея изображений</Label>
						<ImageCell equipmentId={equipment.id} initialImages={validImages} />
					</div>

					{/** NAME */}
					<div className="space-y-1.5">
						<Label>Наименование</Label>
						<Input
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
						/>
					</div>

					{/** INV / CATEGORY / SUBCATEGORY */}
					<div className="grid md:grid-cols-3 gap-4">
						<div className="space-y-1.5">
							<Label>Инвентарный номер</Label>
							<Input
								value={formData.inventory_number || ""}
								placeholder="Уникальный инв. №"
								onChange={(e) =>
									setFormData({ ...formData, inventory_number: e.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Категория</Label>
							<Select
								value={formData.category ?? ""}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value, subcategory: "" })
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Выберите категорию" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Подкатегория</Label>
							<Select
								value={formData.subcategory || "_none"}
								onValueChange={(value) =>
									setFormData({
										...formData,
										subcategory: value === "_none" ? "" : value,
									})
								}
								disabled={subcategories.length === 0}
							>
								<SelectTrigger className="w-full">
									<SelectValue
										placeholder={
											subcategories.length === 0
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
						</div>
					</div>

					{/** DESCRIPTION / SPECS */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<MarkdownEditor
							label="Описание"
							value={formData.description ?? ""}
							onChange={(v) => setFormData({ ...formData, description: v })}
							placeholder={"Описание в **markdown**...\n\n- пункт 1\n- пункт 2"}
							rows={7}
						/>
						<SpecsEditor value={specText} onChange={setSpecText} />
					</div>

					{/** KIT / DEFECTS */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<MarkdownEditor
							label="Комплектация"
							value={formData.kit_description ?? ""}
							onChange={(v) => setFormData({ ...formData, kit_description: v })}
							placeholder={"- Камера\n- Зарядное устройство\n- Кейс"}
							rows={5}
						/>
						<MarkdownEditor
							label="Состояние / Дефекты"
							value={formData.defects ?? ""}
							onChange={(v) => setFormData({ ...formData, defects: v })}
							placeholder="Укажите дефекты или **новое**"
							rows={5}
						/>
					</div>

					{/** STATUS / AVAILABILITY / OWNERSHIP */}
					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-1.5">
							<Label>Статус</Label>
							<Select
								value={formData.status ?? "available"}
								onValueChange={(value: EquipmentStatus) =>
									setFormData({ ...formData, status: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="available">Доступно</SelectItem>
									<SelectItem value="reserved">Зарезервировано</SelectItem>
									<SelectItem value="rented">В аренде</SelectItem>
									<SelectItem value="maintenance">На обслуживании</SelectItem>
									<SelectItem value="broken">Неисправно</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Доступность</Label>
							<Select
								value={String(formData.is_available)}
								onValueChange={(value) =>
									setFormData({ ...formData, is_available: value === "true" })
								}
							>
								<SelectTrigger>
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
								value={String(formData.ownership_type)}
								onValueChange={(value) =>
									setFormData({ ...formData, ownership_type: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="sublease">Да</SelectItem>
									<SelectItem value="internal">Нет</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* PRICES */}
					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-1.5">
							<Label>Цена 4ч</Label>
							<Input
								type="number"
								value={formData.price_4h || ""}
								onChange={(e) =>
									setFormData({ ...formData, price_4h: Number(e.target.value) })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Цена 8ч</Label>
							<Input
								type="number"
								value={formData.price_8h || ""}
								onChange={(e) =>
									setFormData({ ...formData, price_8h: Number(e.target.value) })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Цена/сутки</Label>
							<Input
								type="number"
								value={formData.price_per_day || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										price_per_day: Number(e.target.value),
									})
								}
							/>
						</div>
					</div>

					{/* DEPOSIT / REPLACEMENT */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<Label>Депозит</Label>
							<Input
								type="number"
								value={formData.deposit || ""}
								onChange={(e) =>
									setFormData({ ...formData, deposit: Number(e.target.value) })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Стоимость замены</Label>
							<Input
								type="number"
								value={formData.replacement_value || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										replacement_value: Number(e.target.value),
									})
								}
							/>
						</div>
					</div>

					{/** COMMENTS */}
					<MarkdownEditor
						label="Комментарии для сотрудников"
						value={commentsText}
						onChange={setCommentsText}
						placeholder={
							"Внутренние заметки в **markdown**...\n\n## Важно\n- ..."
						}
						rows={5}
					/>

					{/** SYNC BLOCK */}
					{hasSiblings && (
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
										Выберите поля для копирования их содержимого во все другие
										позиции с идентичным наименованием
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
													onChange={() => toggleSyncField(field.value)}
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
							onClick={() => onOpenChange(false)}
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
							Сохранить
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
