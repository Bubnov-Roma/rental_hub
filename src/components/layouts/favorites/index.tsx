/** biome-ignore-all lint/suspicious/noArrayIndexKey: <skeletons> */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	Edit3,
	Heart,
	Layers,
	MoreHorizontal,
	Package,
	Plus,
	ShoppingCart,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EquipmentCard } from "@/components/shared/EquipmentCard";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui";
import type {
	GroupedEquipment,
	RawEquipmentRow,
} from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { groupEquipmentRows } from "@/utils/group-equipment";
import { FavoriteSetEditor } from "./FavoriteSetEditor";
import type { EquipmentSet, FavoriteItem } from "./types";

// ─── Singleton supabase ───────────────────────────────────────────────────────
const supabase = createClient();

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchFavorites(): Promise<FavoriteItem[]> {
	const { data, error } = await supabase
		.from("favorites")
		.select(
			`id, equipment_id, equipment (*, equipment_image_links(images(id, url)))`
		)
		.order("created_at", { ascending: false });
	if (error) throw error;
	return (data ?? []) as unknown as FavoriteItem[];
}

async function fetchSets(): Promise<EquipmentSet[]> {
	const { data, error } = await supabase
		.from("equipment_sets")
		.select("*")
		.order("created_at", { ascending: false });
	if (error) throw error;
	return (data ?? []) as EquipmentSet[];
}

async function removeFavoriteFromDb(favId: string) {
	const { error } = await supabase.from("favorites").delete().eq("id", favId);
	if (error) throw error;
}

// ─── Grouped equipment map (for correct available_count in favorites) ──────────
// Загружает ВСЕ equipment, группирует по title → Map<unit_id → GroupedEquipment>.
// Ключ — любой unit_id из группы. Позволяет получить реальный available_count
// для товаров из избранного, которые приходят как одиночные строки из join.

async function fetchGroupedEquipmentMap(): Promise<
	Map<string, GroupedEquipment>
> {
	const { data } = await supabase
		.from("equipment")
		.select(`*, equipment_image_links(images(id, url))`);

	const rows = (data || []) as RawEquipmentRow[];
	const grouped = groupEquipmentRows(rows);

	const map = new Map<string, GroupedEquipment>();
	for (const group of grouped) {
		for (const unitId of group.allUnitIds) {
			map.set(unitId, group);
		}
	}
	return map;
}

async function deleteSet(setId: string) {
	const { error } = await supabase
		.from("equipment_sets")
		.delete()
		.eq("id", setId);
	if (error) throw error;
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

// Строит GroupedEquipment из одиночной строки join + map с реальными счётчиками.
// Если map ещё не загружен — fallback к is_available (хотя бы не ?? 1).
function getFavoriteGrouped(
	fav: FavoriteItem,
	groupedMap: Map<string, GroupedEquipment>
): GroupedEquipment {
	// Приоритет — полноценный GroupedEquipment из глобального map
	const fromMap = groupedMap.get(fav.equipment_id);
	if (fromMap) return fromMap;

	// Fallback: map ещё не загружен, собираем из join-данных
	const eq = fav.equipment;
	const links = eq?.equipment_image_links ?? [];
	const imageUrls = links
		.map((l) => l.images?.url)
		.filter((u): u is string => Boolean(u));

	return {
		...(eq as unknown as GroupedEquipment),
		imageUrl: imageUrls[0] ?? "/placeholder-equipment.png",
		images: imageUrls,
		imagesData: [],
		totalCount: 1,
		// is_available — единственный корректный источник для одной строки
		availableCount: eq?.isAvailable ? 1 : 0,
		allUnitIds: [fav.equipment_id],
	};
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "favorites" | "sets";

interface Props {
	initialFavorites: FavoriteItem[];
	initialSets: EquipmentSet[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientFavoritesPage({
	initialFavorites,
	initialSets,
}: Props) {
	const [activeTab, setActiveTab] = useState<Tab>("favorites");
	const [editingSet, setEditingSet] = useState<EquipmentSet | null>(null);
	const [creatingSet, setCreatingSet] = useState(false);
	const queryClient = useQueryClient();
	const addItem = useCartStore((s) => s.addItem);

	// SSR-prefetched data as initialData — no loading flash on first render
	const { data: favorites = [] } = useQuery({
		queryKey: ["favorites"],
		queryFn: fetchFavorites,
		initialData: initialFavorites,
		staleTime: 1000 * 60 * 2,
	});

	const { data: sets = [] } = useQuery({
		queryKey: ["equipment-sets"],
		queryFn: fetchSets,
		initialData: initialSets,
		staleTime: 1000 * 60 * 2,
	});

	// Map unit_id → GroupedEquipment для получения реального available_count
	// в карточках избранного (join даёт одну строку, не сгруппированную).
	const { data: groupedMap = new Map() } = useQuery({
		queryKey: ["equipment-grouped-map"],
		queryFn: fetchGroupedEquipmentMap,
		staleTime: 1000 * 60 * 5,
	});

	// ── Remove with undo ──────────────────────────────────────────────────────
	const UNDO_MS = 4500;
	const undoTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
		new Map()
	);

	const removeFavMutation = useMutation({
		mutationFn: removeFavoriteFromDb,
		onError: () => {
			queryClient.invalidateQueries({ queryKey: ["favorites"] });
			toast.error("Не удалось удалить из избранного");
		},
	});

	const handleRemoveFav = (fav: FavoriteItem) => {
		queryClient.setQueryData<FavoriteItem[]>(["favorites"], (old = []) =>
			old.filter((f) => f.id !== fav.id)
		);

		toast.arguments(`Удалено из избранного`, {
			duration: UNDO_MS,
			action: {
				label: "Отменить",
				onClick: () => {
					const timer = undoTimers.current.get(fav.id);
					if (timer) {
						clearTimeout(timer);
						undoTimers.current.delete(fav.id);
					}
					queryClient.setQueryData<FavoriteItem[]>(
						["favorites"],
						(old = []) => {
							if (old.some((f) => f.id === fav.id)) return old;
							return [fav, ...old];
						}
					);
				},
			},
		});

		const timer = setTimeout(() => {
			undoTimers.current.delete(fav.id);
			removeFavMutation.mutate(fav.id);
		}, UNDO_MS);
		undoTimers.current.set(fav.id, timer);
	};

	const deleteSetMutation = useMutation({
		mutationFn: deleteSet,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["equipment-sets"] });
			toast.success("Сет удалён");
		},
	});

	const tabs = [
		{
			id: "favorites" as Tab,
			label: "Избранное",
			icon: Heart,
			count: favorites.length,
		},
		{ id: "sets" as Tab, label: "Сетапы", icon: Layers, count: sets.length },
	];

	return (
		<>
			<div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
				{/* Header */}
				<div className="flex items-end justify-between gap-4">
					<div>
						<h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic">
							Избранное
						</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Сохранённая техника и готовые сеты
						</p>
					</div>
					{activeTab === "sets" && (
						<Button
							onClick={() => setCreatingSet(true)}
							className="rounded-xl gap-2 shrink-0"
						>
							<Plus size={16} />
							<span className="hidden sm:inline">Новый сет</span>
						</Button>
					)}
				</div>

				{/* Tabs */}
				<div className="tabs-group">
					{tabs.map(({ id, label, icon: Icon, count }) => (
						<button
							key={id}
							type="button"
							onClick={() => setActiveTab(id)}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
								activeTab === id
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<Icon size={15} />
							{label}
							{count > 0 && (
								<span
									className={cn(
										"flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1",
										activeTab === id
											? "bg-primary/10 text-primary"
											: "bg-foreground/10"
									)}
								>
									{count}
								</span>
							)}
						</button>
					))}
				</div>

				{/* Content */}
				<AnimatePresence mode="wait">
					{activeTab === "favorites" ? (
						<motion.div
							key="favs"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.18 }}
						>
							{favorites.length === 0 ? (
								<EmptyState
									icon={Heart}
									title="Пусто"
									description="Добавляйте позиции в избранное прямо из каталога"
									action={{ label: "Перейти в каталог", href: "/equipment" }}
								/>
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
									<AnimatePresence>
										{favorites.map((fav) => {
											const grouped = getFavoriteGrouped(fav, groupedMap);
											return (
												<motion.div
													key={fav.id}
													layout
													initial={{ opacity: 0, scale: 0.95 }}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.9 }}
													transition={{ duration: 0.15 }}
												>
													<EquipmentCard
														item={grouped}
														variant="favorites"
														onFavoriteToggle={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleRemoveFav(fav);
														}}
													/>
												</motion.div>
											);
										})}
									</AnimatePresence>
								</div>
							)}
						</motion.div>
					) : (
						<motion.div
							key="sets"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.18 }}
						>
							{sets.length === 0 ? (
								<EmptyState
									icon={Layers}
									title="Нет сетов"
									description="Создавайте наборы техники для любимых сценариев съёмок"
									action={{
										label: "Создать сет",
										onClick: () => setCreatingSet(true),
									}}
								/>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{sets.map((set) => (
										<SetCard
											groupedMap={groupedMap}
											key={set.id}
											set={set}
											favorites={favorites}
											onEdit={() => setEditingSet(set)}
											onDelete={() => deleteSetMutation.mutate(set.id)}
											onAddAllToCart={(items) => {
												for (const i of items) addItem(i);
												toast.success(`${items.length} позиций в корзине`, {
													action: {
														label: "В корзину →",
														onClick: () => {
															window.location.href = "/checkout";
														},
													},
												});
											}}
										/>
									))}
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<FavoriteSetEditor
				isOpen={creatingSet}
				onClose={() => setCreatingSet(false)}
				favorites={favorites}
			/>
			{editingSet && (
				<FavoriteSetEditor
					isOpen
					onClose={() => setEditingSet(null)}
					existingSet={editingSet}
					favorites={favorites}
				/>
			)}
		</>
	);
}

// ─── Set Card ────────────────────────────────────

function SetCard({
	set,
	favorites,
	groupedMap,
	onEdit,
	onDelete,
	onAddAllToCart,
}: {
	set: EquipmentSet;
	favorites: FavoriteItem[];
	groupedMap: Map<string, GroupedEquipment>;
	onEdit: () => void;
	onDelete: () => void;
	onAddAllToCart: (items: GroupedEquipment[]) => void;
}) {
	const favMap = Object.fromEntries(
		favorites.map((f) => [f.equipment_id, f.equipment])
	);
	const itemCount = set.items.length;

	// Все фото (не только 4) для горизонтального скролла
	const allImages = set.items.map((item) => {
		const eq = favMap[item.equipment_id];
		return {
			equipment_id: item.equipment_id,
			url:
				(eq as FavoriteItem["equipment"])?.equipment_image_links?.[0]?.images
					?.url ?? "/placeholder-equipment.png",
			title: (eq as { title?: string })?.title ?? "",
		};
	});

	const handleAddAll = () => {
		const all = set.items
			.map((i) => {
				// Приоритет — GroupedEquipment из map с реальным available_count
				const fromMap = groupedMap.get(i.equipment_id);
				if (fromMap) return fromMap;
				// Fallback через favMap если map не загружен
				const eq = favMap[i.equipment_id];
				return eq
					? getFavoriteGrouped(
							{ equipment_id: i.equipment_id, equipment: eq, id: "" },
							groupedMap
						)
					: null;
			})
			.filter(Boolean) as GroupedEquipment[];

		if (!all.length) {
			toast.error("Техника из сета не найдена в избранном");
			return;
		}
		onAddAllToCart(all);
	};

	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			className="group rounded-2xl border border-foreground/5 bg-card/50 overflow-hidden hover:border-foreground/10 hover:shadow-lg transition-all duration-300"
		>
			{/* ── Горизонтальный скролл фото ── */}
			<div className="relative">
				<div
					className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-0.5 h-28"
					style={{ scrollbarWidth: "none" }}
				>
					{allImages.length > 0 ? (
						allImages.map((img) => (
							<div
								key={img.equipment_id}
								className="relative shrink-0 snap-start overflow-hidden bg-foreground/5"
								// Ширина адаптируется: если мало — шире, если много — уже
								style={{
									width:
										allImages.length <= 2
											? "50%"
											: allImages.length <= 4
												? "25%"
												: "20%",
									minWidth: "72px",
								}}
							>
								<Image
									src={img.url}
									alt={img.title}
									fill
									className="object-cover"
								/>
							</div>
						))
					) : (
						// Заглушка если в сете нет избранных
						<div className="flex-1 flex items-center justify-center bg-foreground/5">
							<Layers size={20} className="text-muted-foreground/20" />
						</div>
					)}
				</div>

				{/* Градиент и счётчик справа — подсказка что можно скроллить */}
				{allImages.length > 4 && (
					<div className="absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-background/60 to-transparent pointer-events-none flex items-center justify-end pr-2">
						<span className="text-[10px] font-bold text-foreground/60 bg-background/70 rounded-full px-1.5 py-0.5">
							+{allImages.length - 4}
						</span>
					</div>
				)}
			</div>

			{/* ── Info ── */}
			<div className="p-4 space-y-3">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<h3 className="font-bold text-sm truncate">{set.name}</h3>
						{set.description && (
							<p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
								{set.description}
							</p>
						)}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-foreground/10 transition-colors"
							>
								<MoreHorizontal size={14} className="text-muted-foreground" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="rounded-xl">
							<DropdownMenuItem onClick={onEdit} className="gap-2">
								<Edit3 size={13} /> Редактировать
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={onDelete}
								className="gap-2 text-red-400 focus:text-red-400"
							>
								<Trash2 size={13} /> Удалить
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Package size={12} />
						<span>{itemCount} поз.</span>
						{set.total_price_per_day ? (
							<>
								<span className="opacity-30">·</span>
								<span className="font-bold text-foreground/70">
									{set.total_price_per_day.toLocaleString()} ₽/сут
								</span>
							</>
						) : null}
					</div>
					<button
						type="button"
						onClick={handleAddAll}
						className="flex items-center gap-1.5 px-3 h-7 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all text-xs font-semibold shrink-0"
					>
						<ShoppingCart size={12} />
						Всё в корзину
					</button>
				</div>
			</div>
		</motion.div>
	);
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
	icon: Icon,
	title,
	description,
	action,
}: {
	icon: React.ElementType;
	title: string;
	description: string;
	action: { label: string; href?: string; onClick?: () => void };
}) {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="w-20 h-20 rounded-3xl bg-foreground/5 flex items-center justify-center mb-5">
				<Icon size={36} className="text-muted-foreground/30" />
			</div>
			<h3 className="font-bold text-base mb-2">{title}</h3>
			<p className="text-sm text-muted-foreground max-w-xs mb-6">
				{description}
			</p>
			<Button
				variant="outline"
				className="rounded-xl"
				onClick={
					action.onClick ?? (() => action.href && router.push(action.href))
				}
			>
				{action.label}
			</Button>
		</div>
	);
}
