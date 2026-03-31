"use client";

import {
	ChevronDown,
	ChevronUp,
	Edit2,
	GripVertical,
	HelpCircle,
	Plus,
	Save,
	Trash2,
	X,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
	createFaqItemAction,
	type DbFaqItem,
	deleteFaqItemAction,
	reorderFaqItemsAction,
	updateFaqItemAction,
} from "@/actions/faq-actions";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

function FaqRow({
	item,
	onUpdate,
	onDelete,
	dragHandleProps,
}: {
	item: DbFaqItem;
	onUpdate: (id: string, data: Partial<DbFaqItem>) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	dragHandleProps: {
		onDragStart: () => void;
		onDragOver: (e: React.DragEvent) => void;
		onDrop: () => void;
	};
}) {
	const [editing, setEditing] = useState(false);
	const [editQ, setEditQ] = useState(item.question);
	const [editA, setEditA] = useState(item.answer);
	const [editCat, setEditCat] = useState(item.category ?? "");
	const [expanded, setExpanded] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleSave = () => {
		startTransition(async () => {
			await onUpdate(item.id, {
				question: editQ,
				answer: editA,
				category: editCat,
			});
			setEditing(false);
			toast.success("Вопрос обновлён");
		});
	};

	return (
		<Card
			className={cn(
				"rounded-2xl border overflow-hidden transition-all duration-200",
				item.isActive
					? "border-white/8 bg-foreground/3"
					: "border-white/4 bg-foreground/1 opacity-60"
			)}
			draggable
			onDragStart={dragHandleProps.onDragStart}
			onDragOver={dragHandleProps.onDragOver}
			onDrop={dragHandleProps.onDrop}
		>
			<div className="flex items-start gap-2 px-4 py-3">
				<GripVertical
					size={15}
					className="text-muted-foreground/30 mt-0.5 cursor-grab shrink-0"
				/>

				<div className="flex-1 min-w-0">
					{editing ? (
						<div className="space-y-2">
							<div className="space-y-1">
								<Label className="text-xs">Вопрос</Label>
								<Input
									value={editQ}
									onChange={(e) => setEditQ(e.target.value)}
									autoFocus
								/>
							</div>
							<div className="space-y-1">
								<Label className="text-xs">Ответ (поддерживает Markdown)</Label>
								<Textarea
									value={editA}
									onChange={(e) => setEditA(e.target.value)}
									rows={4}
									className="resize-none text-sm"
								/>
							</div>
							<div className="space-y-1">
								<Label className="text-xs">Категория (тег)</Label>
								<Input
									value={editCat}
									onChange={(e) => setEditCat(e.target.value)}
									placeholder="Например: Оплата"
									className="h-8 text-xs"
								/>
							</div>
						</div>
					) : (
						<button
							type="button"
							className="w-full text-left"
							onClick={() => setExpanded((e) => !e)}
						>
							<div className="flex items-start gap-2">
								<p className="text-sm font-semibold leading-snug flex-1">
									{item.question}
								</p>
								{item.category && (
									<span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-foreground/8 text-muted-foreground">
										{item.category}
									</span>
								)}
								{expanded ? (
									<ChevronUp
										size={14}
										className="text-muted-foreground shrink-0 mt-0.5"
									/>
								) : (
									<ChevronDown
										size={14}
										className="text-muted-foreground shrink-0 mt-0.5"
									/>
								)}
							</div>
							{expanded && (
								<p className="text-sm text-muted-foreground mt-2 leading-relaxed text-left whitespace-pre-line">
									{item.answer}
								</p>
							)}
						</button>
					)}
				</div>

				<div className="flex items-center gap-1 shrink-0 ml-2">
					{editing ? (
						<>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 px-2"
								onClick={handleSave}
								disabled={isPending}
							>
								<Save size={12} className="mr-1" /> Сохранить
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 w-7 p-0"
								onClick={() => setEditing(false)}
							>
								<X size={12} />
							</Button>
						</>
					) : (
						<>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 px-2 text-xs text-muted-foreground"
								onClick={() =>
									startTransition(async () => {
										await onUpdate(item.id, { isActive: !item.isActive });
									})
								}
							>
								{item.isActive ? "Скрыть" : "Показать"}
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 w-7 p-0"
								onClick={() => setEditing(true)}
							>
								<Edit2 size={12} className="text-muted-foreground" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 w-7 p-0 hover:text-red-500 hover:bg-red-500/10"
								onClick={() => {
									if (confirm("Удалить вопрос?"))
										startTransition(() => onDelete(item.id));
								}}
							>
								<Trash2 size={12} />
							</Button>
						</>
					)}
				</div>
			</div>
		</Card>
	);
}

export default function AdminFaqClient({
	initialItems,
}: {
	initialItems: DbFaqItem[];
}) {
	const [items, setItems] = useState(initialItems);
	const [isPending, startTransition] = useTransition();
	const [newQ, setNewQ] = useState("");
	const [newA, setNewA] = useState("");
	const [newCat, setNewCat] = useState("");
	const [showAdd, setShowAdd] = useState(false);

	const dragIndex = useRef<number | null>(null);
	const dragOverIndex = useRef<number | null>(null);

	const handleDrop = async () => {
		const from = dragIndex.current;
		const to = dragOverIndex.current;
		if (from === null || to === null || from === to) return;
		const reordered = [...items];
		const [moved] = reordered.splice(from, 1);
		if (!moved) return;
		reordered.splice(to, 0, moved);
		setItems(reordered);
		await reorderFaqItemsAction(reordered.map((i) => i.id));
		dragIndex.current = null;
		dragOverIndex.current = null;
	};

	const handleCreate = () => {
		if (!newQ.trim() || !newA.trim()) return;
		startTransition(async () => {
			const result = await createFaqItemAction({
				question: newQ.trim(),
				answer: newA.trim(),
				category: newCat.trim(),
			});
			if (!result.success) {
				toast.error(result.error);
				return;
			}
			if (result.item) {
				const newItem = result.item;
				setItems((prev) => [...prev, newItem]);
				setNewQ("");
				setNewA("");
				setNewCat("");
				setShowAdd(false);
				toast.success("Вопрос добавлен");
			}
		});
	};

	const handleUpdate = async (id: string, data: Partial<DbFaqItem>) => {
		const result = await updateFaqItemAction(id, data);
		if (!result.success) {
			toast.error(result.error);
			return;
		}
		setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
	};

	const handleDelete = async (id: string) => {
		const result = await deleteFaqItemAction(id);
		if (!result.success) {
			toast.error(result.error);
			return;
		}
		setItems((prev) => prev.filter((i) => i.id !== id));
		toast.success("Вопрос удалён");
	};

	const active = items.filter((i) => i.isActive).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
						<HelpCircle size={22} className="text-primary" />
						FAQ
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{items.length} вопросов · {active} активных · Перетащите для
						изменения порядка
					</p>
				</div>
				<Button size="sm" onClick={() => setShowAdd((s) => !s)}>
					{showAdd ? (
						<X size={14} className="mr-1" />
					) : (
						<Plus size={14} className="mr-1" />
					)}
					{showAdd ? "Отмена" : "Добавить вопрос"}
				</Button>
			</div>

			{showAdd && (
				<div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3 animate-in slide-in-from-top-2 duration-200">
					<p className="text-sm font-bold">Новый вопрос</p>
					<div className="space-y-1.5">
						<Label className="text-xs">Вопрос</Label>
						<Input
							value={newQ}
							onChange={(e) => setNewQ(e.target.value)}
							placeholder="Как оформить аренду?"
							autoFocus
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-xs">Ответ</Label>
						<Textarea
							value={newA}
							onChange={(e) => setNewA(e.target.value)}
							rows={4}
							placeholder="Подробный ответ..."
							className="resize-none"
						/>
					</div>
					<div className="flex items-end gap-3">
						<div className="flex-1 space-y-1.5">
							<Label className="text-xs">Категория (опционально)</Label>
							<Input
								value={newCat}
								onChange={(e) => setNewCat(e.target.value)}
								placeholder="Оплата, Доставка..."
								className="h-8 text-xs"
							/>
						</div>
						<Button
							size="sm"
							disabled={!newQ.trim() || !newA.trim() || isPending}
							onClick={handleCreate}
						>
							<Save size={13} className="mr-1" /> Создать
						</Button>
					</div>
				</div>
			)}

			<div className="space-y-2">
				{items.map((item, index) => (
					<FaqRow
						key={item.id}
						item={item}
						onUpdate={handleUpdate}
						onDelete={handleDelete}
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
				))}
				{items.length === 0 && (
					<div className="text-center py-16 text-muted-foreground">
						<HelpCircle size={32} className="mx-auto mb-3 opacity-20" />
						<p>FAQ пока пуст. Добавьте первый вопрос.</p>
					</div>
				)}
			</div>
		</div>
	);
}
