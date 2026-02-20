"use client";

import {
	faHeart as faHeartReg,
	faShareFromSquare,
} from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronDown, Package, ShieldCheck, Video, Zap } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { AddToCartButton } from "@/components/core/AddToCartButton";
import {
	Badge,
	Button,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
	Separator,
	Tabs,
	TabsList,
	TabsTrigger,
} from "@/components/ui";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

// ── react-markdown: карта компонентов для единого стиля ──────────────────────
//
// Установка: npm i react-markdown
// (remark-gfm опционально: npm i remark-gfm — добавляет таблицы, strikethrough)
//
const mdComponents: Components = {
	// Заголовки
	h1: ({ children }) => (
		<h1 className="text-lg font-black uppercase italic mb-2 text-foreground mt-4 first:mt-0">
			{children}
		</h1>
	),
	h2: ({ children }) => (
		<h2 className="text-base font-black uppercase italic mb-2 text-foreground mt-3 first:mt-0">
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3 className="text-sm font-black uppercase italic mb-1.5 text-foreground mt-3 first:mt-0">
			{children}
		</h3>
	),

	// Параграф
	p: ({ children }) => (
		<p className="text-sm leading-relaxed text-foreground/80 mb-2 last:mb-0">
			{children}
		</p>
	),

	// Списки
	ul: ({ children }) => (
		<ul className="list-none space-y-1 mb-2">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="list-none space-y-1 mb-2 counter-reset-[item]">
			{children}
		</ol>
	),
	li: ({ children }) => (
		<li className="flex items-start gap-2 text-sm text-foreground/80">
			<span className="text-primary mt-1 shrink-0 select-none">•</span>
			<span>{children}</span>
		</li>
	),

	// Инлайн
	strong: ({ children }) => (
		<strong className="font-bold text-foreground">{children}</strong>
	),
	em: ({ children }) => (
		<em className="italic text-foreground/70">{children}</em>
	),
	code: ({ children }) => (
		<code className="text-xs bg-white/10 rounded px-1 py-0.5 font-mono">
			{children}
		</code>
	),

	// Горизонтальная линия
	hr: () => <hr className="border-white/10 my-3" />,

	// Блок кода (если вдруг встретится)
	pre: ({ children }) => (
		<pre className="bg-white/5 rounded-xl p-3 overflow-x-auto text-xs mb-2">
			{children}
		</pre>
	),
};

// ── Collapsible секция с animated border-bottom trigger ─────────────────────
function InfoSection({
	icon,
	title,
	children,
	defaultOpen = false,
}: {
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<Collapsible open={open} onOpenChange={setOpen} className="group/section">
			<CollapsibleTrigger className="w-full flex items-center gap-2.5 py-3.5 text-left focus:outline-none">
				<span
					className={cn(
						"flex items-center gap-2.5 flex-1 min-w-0",
						"text-sm font-bold uppercase italic tracking-wide",
						"border-b-2 pb-0.5 transition-all duration-300",
						open
							? "text-primary border-primary"
							: "text-foreground/60 border-white/15 hover:text-foreground hover:border-white/30"
					)}
				>
					<span
						className={cn(
							"shrink-0",
							open ? "text-primary" : "text-foreground/40"
						)}
					>
						{icon}
					</span>
					{title}
				</span>
				<ChevronDown
					size={14}
					className={cn(
						"shrink-0 transition-transform duration-300 text-muted-foreground",
						open && "rotate-180 text-primary"
					)}
				/>
			</CollapsibleTrigger>
			<CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
				<div className="pb-4 pt-1">{children}</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

// ── Обёртка-помощник для react-markdown ──────────────────────────────────────
function MD({ children }: { children: string | null | undefined }) {
	if (!children) return null;
	return <ReactMarkdown components={mdComponents}>{children}</ReactMarkdown>;
}

// ── Основной компонент ────────────────────────────────────────────────────────
export default function EquipmentDetailClient({
	equipment,
}: {
	equipment: GroupedEquipment;
}) {
	const { items } = useCartStore();
	const [selectedImg, setSelectedImg] = useState(equipment.imageUrl);
	const [activeRentTab, setActiveRentTab] = useState<"h4" | "h8" | "day">(
		"day"
	);
	const [isFavorite, setIsFavorite] = useState(false);
	const imageRef = useRef<HTMLDivElement>(null);

	const cartItem = items.find((i) => i.equipment.id === equipment.id);
	const quantity = cartItem?.quantity || 0;
	const images = equipment.images?.length
		? equipment.images
		: [equipment.imageUrl];

	const currentPrice = useMemo(() => {
		const base =
			activeRentTab === "h4"
				? equipment.price_4h
				: activeRentTab === "h8"
					? equipment.price_8h
					: equipment.price_per_day;
		return base * Math.max(quantity, 1);
	}, [activeRentTab, equipment, quantity]);

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success("Ссылка скопирована");
	};

	const specEntries = useMemo(() => {
		const s = equipment.specifications;
		if (!s || typeof s !== "object") return [];
		return Object.entries(s as Record<string, string>).filter(
			([k]) => k !== "description"
		);
	}, [equipment.specifications]);

	const specDesc =
		typeof (equipment.specifications as Record<string, string>)?.description ===
		"string"
			? (equipment.specifications as Record<string, string>).description
			: null;

	const hasSpecs = specEntries.length > 0 || !!specDesc;
	const hasDescription = !!equipment.description;
	const hasKit = !!equipment.kit_description;

	return (
		<>
			<div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-24 lg:pb-8">
				{/* ━━ ЛЕВАЯ КОЛОНКА ━━ */}
				<div className="lg:col-span-7 space-y-4">
					{/* Главное фото */}
					<Dialog>
						<DialogTrigger asChild>
							<div
								ref={imageRef}
								className="relative aspect-video rounded-3xl overflow-hidden cursor-zoom-in bg-foreground/5 group"
							>
								<Image
									src={selectedImg}
									fill
									className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
									alt={equipment.title}
									priority
								/>
								<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<span className="text-white text-xs font-bold uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-full">
										Открыть
									</span>
								</div>
							</div>
						</DialogTrigger>
						<DialogContent
							showCloseButton={false}
							className="max-w-[92vw] h-[90vh] p-0 border-none bg-transparent shadow-none outline-none"
						>
							<DialogTitle className="sr-only">
								Просмотр: {equipment.title}
							</DialogTitle>
							<div className="relative w-full h-full">
								<Image
									src={selectedImg}
									fill
									className="object-contain rounded-2xl"
									alt="Preview"
								/>
							</div>
						</DialogContent>
					</Dialog>

					{/* Миниатюры */}
					{images.length > 1 && (
						<div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
							{images.map((img, i) => (
								<button
									type="button"
									key={`${img}` + `${i}`}
									onClick={() => setSelectedImg(img)}
									className={cn(
										"relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200",
										selectedImg === img
											? "border-primary scale-95"
											: "border-transparent opacity-50 hover:opacity-80"
									)}
								>
									<Image
										src={img}
										fill
										className="object-cover"
										alt={`Фото ${i + 1}`}
									/>
								</button>
							))}
						</div>
					)}

					{/* Мобильная карточка с ценой */}
					<div className="lg:hidden">
						<MobilePriceCard
							equipment={equipment}
							quantity={quantity}
							activeTab={activeRentTab}
							onTabChange={setActiveRentTab}
							price={currentPrice}
							onShare={handleShare}
							isFavorite={isFavorite}
							onFavorite={() => setIsFavorite((v) => !v)}
						/>
					</div>

					{/* Collapsible-блоки с react-markdown */}
					<div className="divide-y divide-white/5">
						{hasDescription && (
							<InfoSection icon={<span>📋</span>} title="Описание" defaultOpen>
								<MD>{equipment.description}</MD>
							</InfoSection>
						)}

						{hasSpecs && (
							<InfoSection icon={<Zap size={14} />} title="Характеристики">
								{specEntries.length > 0 ? (
									<dl className="divide-y divide-white/5">
										{specEntries.map(([key, val]) => (
											<div key={key} className="flex gap-4 py-2">
												<dt className="text-xs text-muted-foreground w-36 shrink-0 font-medium pt-0.5">
													{key}
												</dt>
												<dd className="text-sm font-bold">{val}</dd>
											</div>
										))}
									</dl>
								) : (
									<MD>{specDesc}</MD>
								)}
							</InfoSection>
						)}

						{hasKit && (
							<InfoSection icon={<Package size={14} />} title="Комплектация">
								<MD>{equipment.kit_description}</MD>
							</InfoSection>
						)}

						<InfoSection icon={<Video size={14} />} title="Обзоры">
							<div className="py-8 text-center">
								<Video
									size={24}
									className="text-muted-foreground/25 mx-auto mb-2"
								/>
								<p className="text-sm text-muted-foreground">
									Видеообзоры появятся позже
								</p>
							</div>
						</InfoSection>
					</div>
				</div>

				{/* ━━ ПРАВАЯ КОЛОНКА (только desktop) ━━ */}
				<div className="hidden lg:block lg:col-span-5">
					<div className="glass-card bg-muted-foreground/10 sticky top-24 space-y-5 p-5 md:p-6 rounded-3xl border border-white/10 backdrop-blur-3xl">
						{/* Категория + действия */}
						<div className="flex items-center justify-between">
							<Badge
								variant="outline"
								className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/30 bg-primary/10"
							>
								{equipment.category}
							</Badge>
							<div className="flex items-center gap-5">
								<Button
									variant="glass"
									onClick={handleShare}
									aria-label="Поделиться"
									className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
								>
									<FontAwesomeIcon
										icon={faShareFromSquare}
										className="w-3.5 h-3.5"
									/>
								</Button>
								<Button
									variant="glass"
									onClick={() => setIsFavorite((v) => !v)}
									aria-label="В избранное"
									className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
								>
									<FontAwesomeIcon
										icon={isFavorite ? faHeartSolid : faHeartReg}
										className={cn("w-3.5 h-3.5", isFavorite && "text-primary")}
									/>
								</Button>
							</div>
						</div>

						<h1 className="text-3xl font-black uppercase italic leading-tight tracking-tighter">
							{equipment.title}
						</h1>

						<Separator className="bg-foreground/10" />

						{/* Тарифы */}
						<div>
							<p className="text-[10px] uppercase font-black tracking-[.2em] text-muted-foreground/50 mb-2">
								Тариф аренды
							</p>
							<Tabs
								value={activeRentTab}
								onValueChange={(v) =>
									setActiveRentTab(v as "h4" | "h8" | "day")
								}
							>
								<TabsList className="grid grid-cols-3 w-full h-11 bg-black/20 rounded-xl p-1 border border-white/5">
									<TabsTrigger
										value="h4"
										className="rounded-lg font-bold uppercase text-[11px]"
									>
										4 часа
									</TabsTrigger>
									<TabsTrigger
										value="h8"
										className="rounded-lg font-bold uppercase text-[11px]"
									>
										8 часов
									</TabsTrigger>
									<TabsTrigger
										value="day"
										className="rounded-lg font-bold uppercase text-[11px]"
									>
										Сутки
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						{/* Цена */}
						<div className="flex items-end justify-between">
							<div>
								<span className="text-[10px] uppercase font-black opacity-40 block mb-1">
									{quantity > 1 ? `Итого за ${quantity} шт.` : "Стоимость"}
								</span>
								<div className="text-5xl font-black italic text-primary tracking-tighter leading-none">
									{currentPrice.toLocaleString("ru")}₽
								</div>
							</div>
							<div className="text-right">
								<div className="text-[10px] uppercase font-bold opacity-40 mb-1">
									Доступно
								</div>
								<div className="text-xl font-black italic">
									{equipment.available_count}
									<span className="text-[10px] not-italic opacity-60 ml-0.5">
										шт.
									</span>
								</div>
							</div>
						</div>

						{/* Залог */}
						{!!equipment.deposit && (
							<div className="flex items-center gap-2.5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
								<ShieldCheck size={15} className="text-yellow-500 shrink-0" />
								<div>
									<p className="text-[10px] font-bold uppercase text-yellow-500/70">
										Залог при получении
									</p>
									<p className="text-sm font-black text-yellow-400">
										{(equipment.deposit * Math.max(quantity, 1)).toLocaleString(
											"ru"
										)}{" "}
										₽
									</p>
								</div>
							</div>
						)}

						<Separator className="bg-foreground/10" />

						<AddToCartButton
							item={equipment}
							sourceRef={imageRef as React.RefObject<HTMLElement | null>}
							size="lg"
							className="w-full"
						/>

						{/* Вспомогательные цены */}
						<div className="grid grid-cols-2 gap-2">
							<div className="p-3 rounded-xl bg-background border border-white/5 text-center">
								<p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
									Цена 4ч
								</p>
								<p className="text-sm font-black">
									{equipment.price_4h?.toLocaleString("ru") ?? "—"} ₽
								</p>
							</div>
							<div className="p-3 rounded-xl bg-background border border-white/5 text-center">
								<p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
									Цена 8ч
								</p>
								<p className="text-sm font-black">
									{equipment.price_8h?.toLocaleString("ru") ?? "—"} ₽
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ━━ МОБИЛЬНЫЙ FAB ━━ */}
			<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 bg-background/85 backdrop-blur-xl border-t border-white/10 safe-area-pb">
				<AddToCartButton
					item={equipment}
					sourceRef={imageRef as React.RefObject<HTMLElement | null>}
					size="lg"
					className="w-full"
				/>
			</div>
		</>
	);
}

// ── Мобильная карточка с ценой ────────────────────────────────────────────────
function MobilePriceCard({
	equipment,
	quantity,
	activeTab,
	onTabChange,
	price,
	onShare,
	isFavorite,
	onFavorite,
}: {
	equipment: GroupedEquipment;
	quantity: number;
	activeTab: "h4" | "h8" | "day";
	onTabChange: (v: "h4" | "h8" | "day") => void;
	price: number;
	onShare: () => void;
	isFavorite: boolean;
	onFavorite: () => void;
}) {
	return (
		<div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<Badge
						variant="outline"
						className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/30 bg-primary/10 mb-1.5"
					>
						{equipment.category}
					</Badge>
					<h1 className="text-xl font-black uppercase italic leading-tight tracking-tighter">
						{equipment.title}
					</h1>
				</div>
				<div className="flex gap-1 shrink-0 pt-5">
					<button
						type="button"
						onClick={onShare}
						className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
					>
						<FontAwesomeIcon icon={faShareFromSquare} className="w-3 h-3" />
					</button>
					<button
						type="button"
						onClick={onFavorite}
						className={cn(
							"w-8 h-8 rounded-full border flex items-center justify-center transition-all",
							isFavorite ? "border-primary/40 bg-primary/10" : "border-white/10"
						)}
					>
						<FontAwesomeIcon
							icon={isFavorite ? faHeartSolid : faHeartReg}
							className={cn("w-3 h-3", isFavorite && "text-primary")}
						/>
					</button>
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(v) => onTabChange(v as "h4" | "h8" | "day")}
			>
				<TabsList className="grid grid-cols-3 w-full h-9 bg-black/20 rounded-xl p-0.5 border border-white/5">
					<TabsTrigger
						value="h4"
						className="rounded-lg font-bold uppercase text-[10px]"
					>
						4ч
					</TabsTrigger>
					<TabsTrigger
						value="h8"
						className="rounded-lg font-bold uppercase text-[10px]"
					>
						8ч
					</TabsTrigger>
					<TabsTrigger
						value="day"
						className="rounded-lg font-bold uppercase text-[10px]"
					>
						Сутки
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<div className="flex items-end justify-between">
				<div>
					<p className="text-[10px] opacity-40 uppercase font-bold mb-0.5">
						{quantity > 1 ? `За ${quantity} шт.` : "Стоимость"}
					</p>
					<p className="text-3xl font-black italic text-primary tracking-tighter leading-none">
						{price.toLocaleString("ru")}₽
					</p>
				</div>
				<div className="text-right">
					<p className="text-[10px] opacity-40 uppercase font-bold">Доступно</p>
					<p className="font-black italic text-lg">
						{equipment.available_count}
						<span className="text-[10px] opacity-60 not-italic ml-0.5">
							шт.
						</span>
					</p>
				</div>
			</div>

			{!!equipment.deposit && (
				<div className="flex items-center gap-2 p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
					<ShieldCheck size={13} className="text-yellow-500 shrink-0" />
					<p className="text-[11px] font-bold text-yellow-500">
						Залог при получении:{" "}
						{(equipment.deposit * Math.max(quantity, 1)).toLocaleString("ru")} ₽
					</p>
				</div>
			)}
		</div>
	);
}

// "use client";

// import {
// 	faHeart as faHeartReg,
// 	faShareFromSquare,
// } from "@fortawesome/free-regular-svg-icons";
// import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { ChevronDown, Package, ShieldCheck, Video, Zap } from "lucide-react";
// import Image from "next/image";
// import type React from "react";
// import { useMemo, useRef, useState } from "react";
// import { toast } from "sonner";
// import { AddToCartButton } from "@/components/core/AddToCartButton";
// import {
// 	Badge,
// 	Button,
// 	Collapsible,
// 	CollapsibleContent,
// 	CollapsibleTrigger,
// 	Dialog,
// 	DialogContent,
// 	DialogTitle,
// 	DialogTrigger,
// 	Separator,
// 	Tabs,
// 	TabsList,
// 	TabsTrigger,
// } from "@/components/ui";
// import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
// import { cn } from "@/lib/utils";
// import { useCartStore } from "@/store/use-cart-store";

// // ── Простой markdown-рендерер (без внешних зависимостей) ─────────────────────
// // Если у вас установлен react-markdown — заменить на него.
// function ContentRenderer({ content }: { content: string }) {
// 	if (!content) return null;

// 	const lines = content.split("\n");
// 	const elements: React.ReactNode[] = [];
// 	let i = 0;

// 	while (i < lines.length) {
// 		const line = lines[i];

// 		// Заголовки
// 		if (line?.startsWith("### ")) {
// 			elements.push(
// 				<h3
// 					key={i}
// 					className="text-sm font-black uppercase italic mb-1.5 text-foreground mt-3 first:mt-0"
// 				>
// 					{line?.slice(4)}
// 				</h3>
// 			);
// 		} else if (line?.startsWith("## ")) {
// 			elements.push(
// 				<h2
// 					key={i}
// 					className="text-base font-black uppercase italic mb-2 text-foreground mt-3 first:mt-0"
// 				>
// 					{line?.slice(3)}
// 				</h2>
// 			);
// 		} else if (line?.startsWith("# ")) {
// 			elements.push(
// 				<h1
// 					key={i}
// 					className="text-lg font-black uppercase italic mb-2 text-foreground mt-3 first:mt-0"
// 				>
// 					{line?.slice(2)}
// 				</h1>
// 			);
// 		}
// 		// Список (- item или * item)
// 		else if (line?.[i] && /^[-*] /.test(line)) {
// 			const listItems: string[] = [];
// 			while (i < lines.length && /^[-*] /.test(lines[i])) {
// 				listItems.push(lines[i].slice(2));
// 				i++;
// 			}
// 			elements.push(
// 				<ul key={`ul-${i}`} className="list-none space-y-1 mb-2">
// 					{listItems.map((item, j) => (
// 						<li
// 							key={j}
// 							className="flex items-start gap-2 text-sm text-foreground/80"
// 						>
// 							<span className="text-primary mt-1 shrink-0">•</span>
// 							<span>{renderInline(item)}</span>
// 						</li>
// 					))}
// 				</ul>
// 			);
// 			continue;
// 		}
// 		// Нумерованный список
// 		else if (/^\d+\. /.test(line)) {
// 			const listItems: string[] = [];
// 			let n = 1;
// 			while (i < lines.length && /^\d+\. /.test(lines[i])) {
// 				listItems.push(lines[i].replace(/^\d+\. /, ""));
// 				i++;
// 				n++;
// 			}
// 			elements.push(
// 				<ol key={`ol-${i}`} className="list-none space-y-1 mb-2">
// 					{listItems.map((item, j) => (
// 						<li
// 							key={j}
// 							className="flex items-start gap-2 text-sm text-foreground/80"
// 						>
// 							<span className="text-primary font-bold shrink-0 min-w-[1.2rem]">
// 								{j + 1}.
// 							</span>
// 							<span>{renderInline(item)}</span>
// 						</li>
// 					))}
// 				</ol>
// 			);
// 			continue;
// 		}
// 		// Горизонтальная линия
// 		else if (/^---+$/.test(line.trim())) {
// 			elements.push(<hr key={i} className="border-white/10 my-3" />);
// 		}
// 		// Пустая строка
// 		else if (line.trim() === "") {
// 			// пропускаем лишние пустые строки
// 		}
// 		// Обычный параграф
// 		else {
// 			elements.push(
// 				<p
// 					key={i}
// 					className="text-sm leading-relaxed text-foreground/80 mb-1.5"
// 				>
// 					{renderInline(line)}
// 				</p>
// 			);
// 		}

// 		i++;
// 	}

// 	return <div className="space-y-0">{elements}</div>;
// }

// /** Обрабатывает **bold**, *italic*, `code` в строке */
// function renderInline(text: string): React.ReactNode {
// 	const parts: React.ReactNode[] = [];
// 	// Регексп для **bold**, *italic*, `code`
// 	const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
// 	let last = 0;
// 	let match: RegExpExecArray | null;

// 	// biome-ignore lint/suspicious/noAssignInExpressions: needed for regex loop
// 	while ((match = regex.exec(text)) !== null) {
// 		if (match.index > last) {
// 			parts.push(text.slice(last, match.index));
// 		}
// 		if (match[2]) {
// 			parts.push(
// 				<strong key={match.index} className="font-bold text-foreground">
// 					{match[2]}
// 				</strong>
// 			);
// 		} else if (match[3]) {
// 			parts.push(
// 				<em key={match.index} className="italic text-foreground/70">
// 					{match[3]}
// 				</em>
// 			);
// 		} else if (match[4]) {
// 			parts.push(
// 				<code
// 					key={match.index}
// 					className="text-xs bg-white/10 rounded px-1 py-0.5 font-mono"
// 				>
// 					{match[4]}
// 				</code>
// 			);
// 		}
// 		last = match.index + match[0].length;
// 	}

// 	if (last < text.length) parts.push(text.slice(last));
// 	return parts.length > 1 ? parts : text;
// }

// // ── Collapsible секция с animated border-bottom trigger ─────────────────────
// function InfoSection({
// 	icon,
// 	title,
// 	children,
// 	defaultOpen = false,
// }: {
// 	icon: React.ReactNode;
// 	title: string;
// 	children: React.ReactNode;
// 	defaultOpen?: boolean;
// }) {
// 	const [open, setOpen] = useState(defaultOpen);

// 	return (
// 		<Collapsible open={open} onOpenChange={setOpen} className="group/section">
// 			<CollapsibleTrigger className="w-full flex items-center gap-2.5 py-3.5 text-left focus:outline-none">
// 				<span
// 					className={cn(
// 						"flex items-center gap-2.5 flex-1 min-w-0",
// 						"text-sm font-bold uppercase italic tracking-wide",
// 						"border-b-2 pb-0.5 transition-all duration-300",
// 						open
// 							? "text-primary border-primary"
// 							: "text-foreground/60 border-white/15 hover:text-foreground hover:border-white/30"
// 					)}
// 				>
// 					<span
// 						className={cn(
// 							"shrink-0",
// 							open ? "text-primary" : "text-foreground/40"
// 						)}
// 					>
// 						{icon}
// 					</span>
// 					{title}
// 				</span>
// 				<ChevronDown
// 					size={14}
// 					className={cn(
// 						"shrink-0 transition-transform duration-300 text-muted-foreground",
// 						open && "rotate-180 text-primary"
// 					)}
// 				/>
// 			</CollapsibleTrigger>
// 			<CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
// 				<div className="pb-4 pt-1">{children}</div>
// 			</CollapsibleContent>
// 		</Collapsible>
// 	);
// }

// // ── Основной компонент ────────────────────────────────────────────────────────
// export default function EquipmentDetailClient({
// 	equipment,
// }: {
// 	equipment: GroupedEquipment;
// }) {
// 	const { items } = useCartStore();
// 	const [selectedImg, setSelectedImg] = useState(equipment.imageUrl);
// 	const [activeRentTab, setActiveRentTab] = useState<"h4" | "h8" | "day">(
// 		"day"
// 	);
// 	const [isFavorite, setIsFavorite] = useState(false);
// 	const imageRef = useRef<HTMLDivElement>(null);

// 	const cartItem = items.find((i) => i.equipment.id === equipment.id);
// 	const quantity = cartItem?.quantity || 0;
// 	const images = equipment.images?.length
// 		? equipment.images
// 		: [equipment.imageUrl];

// 	const currentPrice = useMemo(() => {
// 		const base =
// 			activeRentTab === "h4"
// 				? equipment.price_4h
// 				: activeRentTab === "h8"
// 					? equipment.price_8h
// 					: equipment.price_per_day;
// 		return base * Math.max(quantity, 1);
// 	}, [activeRentTab, equipment, quantity]);

// 	const handleShare = () => {
// 		navigator.clipboard.writeText(window.location.href);
// 		toast.success("Ссылка скопирована");
// 	};

// 	const specEntries = useMemo(() => {
// 		const s = equipment.specifications;
// 		if (!s || typeof s !== "object") return [];
// 		return Object.entries(s as Record<string, string>).filter(
// 			([k]) => k !== "description"
// 		);
// 	}, [equipment.specifications]);

// 	const specDesc =
// 		typeof (equipment.specifications as Record<string, string>)?.description ===
// 		"string"
// 			? (equipment.specifications as Record<string, string>).description
// 			: null;

// 	const hasSpecs = specEntries.length > 0 || !!specDesc;
// 	const hasDescription = !!equipment.description;
// 	const hasKit = !!equipment.kit_description;

// 	return (
// 		<>
// 			<div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-24 lg:pb-8">
// 				{/* ━━ ЛЕВАЯ КОЛОНКА ━━ */}
// 				<div className="lg:col-span-7 space-y-4">
// 					{/* Главное фото */}
// 					<Dialog>
// 						<DialogTrigger asChild>
// 							<div
// 								ref={imageRef}
// 								className="relative aspect-video rounded-3xl overflow-hidden cursor-zoom-in bg-foreground/5 group"
// 							>
// 								<Image
// 									src={selectedImg}
// 									fill
// 									className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
// 									alt={equipment.title}
// 									priority
// 								/>
// 								<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
// 									<span className="text-white text-xs font-bold uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-full">
// 										Открыть
// 									</span>
// 								</div>
// 							</div>
// 						</DialogTrigger>
// 						<DialogContent
// 							showCloseButton={false}
// 							className="max-w-[92vw] h-[90vh] p-0 border-none bg-transparent shadow-none outline-none"
// 						>
// 							<DialogTitle className="sr-only">
// 								Просмотр: {equipment.title}
// 							</DialogTitle>
// 							<div className="relative w-full h-full">
// 								<Image
// 									src={selectedImg}
// 									fill
// 									className="object-contain rounded-2xl"
// 									alt="Preview"
// 								/>
// 							</div>
// 						</DialogContent>
// 					</Dialog>

// 					{/* Миниатюры */}
// 					{images.length > 1 && (
// 						<div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
// 							{images.map((img, i) => (
// 								<button
// 									type="button"
// 									key={`${img}` + `${i}`}
// 									onClick={() => setSelectedImg(img)}
// 									className={cn(
// 										"relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200",
// 										selectedImg === img
// 											? "border-primary scale-95"
// 											: "border-transparent opacity-50 hover:opacity-80"
// 									)}
// 								>
// 									<Image
// 										src={img}
// 										fill
// 										className="object-cover"
// 										alt={`Фото ${i + 1}`}
// 									/>
// 								</button>
// 							))}
// 						</div>
// 					)}

// 					{/* ── Мобильная секция с ценой (только < lg) ── */}
// 					<div className="lg:hidden">
// 						<MobilePriceCard
// 							equipment={equipment}
// 							quantity={quantity}
// 							activeTab={activeRentTab}
// 							onTabChange={setActiveRentTab}
// 							price={currentPrice}
// 							onShare={handleShare}
// 							isFavorite={isFavorite}
// 							onFavorite={() => setIsFavorite((v) => !v)}
// 						/>
// 					</div>

// 					{/* Collapsible информационные блоки */}
// 					<div className="divide-y divide-white/5">
// 						{hasDescription && (
// 							<InfoSection icon={<span>📋</span>} title="Описание" defaultOpen>
// 								<ContentRenderer content={equipment.description ?? ""} />
// 							</InfoSection>
// 						)}
// 						{hasSpecs && (
// 							<InfoSection icon={<Zap size={14} />} title="Характеристики">
// 								{specEntries.length > 0 ? (
// 									<dl className="divide-y divide-white/5">
// 										{specEntries.map(([key, val]) => (
// 											<div key={key} className="flex gap-4 py-2">
// 												<dt className="text-xs text-muted-foreground w-36 shrink-0 font-medium pt-0.5">
// 													{key}
// 												</dt>
// 												<dd className="text-sm font-bold">{val}</dd>
// 											</div>
// 										))}
// 									</dl>
// 								) : (
// 									specDesc && <ContentRenderer content={specDesc} />
// 								)}
// 							</InfoSection>
// 						)}
// 						{hasKit && (
// 							<InfoSection icon={<Package size={14} />} title="Комплектация">
// 								<ContentRenderer content={equipment.kit_description ?? ""} />
// 							</InfoSection>
// 						)}
// 						<InfoSection icon={<Video size={14} />} title="Обзоры">
// 							<div className="py-8 text-center">
// 								<Video
// 									size={24}
// 									className="text-muted-foreground/25 mx-auto mb-2"
// 								/>
// 								<p className="text-sm text-muted-foreground">
// 									Видеообзоры появятся позже
// 								</p>
// 							</div>
// 						</InfoSection>
// 					</div>
// 				</div>

// 				{/* ━━ ПРАВАЯ КОЛОНКА (только desktop) ━━ */}
// 				<div className="hidden lg:block lg:col-span-5">
// 					<div className="glass-card bg-muted-foreground/10 sticky top-24 space-y-5 p-5 md:p-6 rounded-3xl border border-white/10  backdrop-blur-3xl">
// 						{/* Категория + действия */}
// 						<div className="flex items-center justify-between">
// 							<Badge
// 								variant="outline"
// 								className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/30 bg-primary/10"
// 							>
// 								{equipment.category}
// 							</Badge>
// 							<div className="flex items-center gap-5">
// 								<Button
// 									variant="glass"
// 									onClick={handleShare}
// 									aria-label="Поделиться"
// 									className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
// 								>
// 									<FontAwesomeIcon
// 										icon={faShareFromSquare}
// 										className="w-3.5 h-3.5"
// 									/>
// 								</Button>
// 								<Button
// 									variant="glass"
// 									onClick={() => setIsFavorite((v) => !v)}
// 									aria-label="В избранное"
// 									className={cn(
// 										"w-9 h-9 rounded-full flex items-center justify-center transition-all"
// 									)}
// 								>
// 									<FontAwesomeIcon
// 										icon={isFavorite ? faHeartSolid : faHeartReg}
// 										className={cn("w-3.5 h-3.5", isFavorite && "text-primary")}
// 									/>
// 								</Button>
// 							</div>
// 						</div>

// 						<h1 className="text-3xl font-black uppercase italic leading-tight tracking-tighter">
// 							{equipment.title}
// 						</h1>

// 						<Separator className="bg-foreground/10" />

// 						{/* Тарифы */}
// 						<div>
// 							<p className="text-[10px] uppercase font-black tracking-[.2em] text-muted-foreground/50 mb-2">
// 								Тариф аренды
// 							</p>
// 							<Tabs
// 								value={activeRentTab}
// 								onValueChange={(v) =>
// 									setActiveRentTab(v as "h4" | "h8" | "day")
// 								}
// 							>
// 								<TabsList className="grid grid-cols-3 w-full h-11 bg-black/20 rounded-xl p-1 border border-white/5">
// 									<TabsTrigger
// 										value="h4"
// 										className="rounded-lg font-bold uppercase text-[11px]"
// 									>
// 										4 часа
// 									</TabsTrigger>
// 									<TabsTrigger
// 										value="h8"
// 										className="rounded-lg font-bold uppercase text-[11px]"
// 									>
// 										8 часов
// 									</TabsTrigger>
// 									<TabsTrigger
// 										value="day"
// 										className="rounded-lg font-bold uppercase text-[11px]"
// 									>
// 										Сутки
// 									</TabsTrigger>
// 								</TabsList>
// 							</Tabs>
// 						</div>

// 						{/* Цена */}
// 						<div className="flex items-end justify-between">
// 							<div>
// 								<span className="text-[10px] uppercase font-black opacity-40 block mb-1">
// 									{quantity > 1 ? `Итого за ${quantity} шт.` : "Стоимость"}
// 								</span>
// 								<div className="text-5xl font-black italic text-primary tracking-tighter leading-none">
// 									{currentPrice.toLocaleString("ru")}₽
// 								</div>
// 							</div>
// 							<div className="text-right">
// 								<div className="text-[10px] uppercase font-bold opacity-40 mb-1">
// 									Доступно
// 								</div>
// 								<div className="text-xl font-black italic">
// 									{equipment.available_count}
// 									<span className="text-[10px] not-italic opacity-60 ml-0.5">
// 										шт.
// 									</span>
// 								</div>
// 							</div>
// 						</div>

// 						{/* Залог */}
// 						{!!equipment.deposit && (
// 							<div className="flex items-center gap-2.5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
// 								<ShieldCheck size={15} className="text-yellow-500 shrink-0" />
// 								<div>
// 									<p className="text-[10px] font-bold uppercase text-yellow-500/70">
// 										Залог при получении
// 									</p>
// 									<p className="text-sm font-black text-yellow-400">
// 										{(equipment.deposit * Math.max(quantity, 1)).toLocaleString(
// 											"ru"
// 										)}{" "}
// 										₽
// 									</p>
// 								</div>
// 							</div>
// 						)}

// 						<Separator className="bg-foreground/10" />

// 						<AddToCartButton
// 							item={equipment}
// 							sourceRef={imageRef as React.RefObject<HTMLElement | null>}
// 							size="lg"
// 							className="w-full"
// 						/>

// 						{/* Цены тарифов */}
// 						<div className="grid grid-cols-2 gap-2 g-black/20">
// 							<div className="p-3 rounded-xl bg-background border border-white/5 text-center">
// 								<p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
// 									Цена 4ч
// 								</p>
// 								<p className="text-sm font-black">
// 									{equipment.price_4h?.toLocaleString("ru") ?? "—"} ₽
// 								</p>
// 							</div>
// 							<div className="p-3 rounded-xl b border bg-background  border-white/5 text-center">
// 								<p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
// 									Цена 8ч
// 								</p>
// 								<p className="text-sm font-black">
// 									{equipment.price_8h?.toLocaleString("ru") ?? "—"} ₽
// 								</p>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</div>

// 			{/* ━━ МОБИЛЬНЫЙ FAB ━━ */}
// 			<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 bg-background/85 backdrop-blur-xl border-t border-white/10 safe-area-pb">
// 				<AddToCartButton
// 					item={equipment}
// 					sourceRef={imageRef as React.RefObject<HTMLElement | null>}
// 					size="lg"
// 					className="w-full"
// 				/>
// 			</div>
// 		</>
// 	);
// }

// // ── Мобильная карточка с ценой ────────────────────────────────────────────────
// function MobilePriceCard({
// 	equipment,
// 	quantity,
// 	activeTab,
// 	onTabChange,
// 	price,
// 	onShare,
// 	isFavorite,
// 	onFavorite,
// }: {
// 	equipment: GroupedEquipment;
// 	quantity: number;
// 	activeTab: "h4" | "h8" | "day";
// 	onTabChange: (v: "h4" | "h8" | "day") => void;
// 	price: number;
// 	onShare: () => void;
// 	isFavorite: boolean;
// 	onFavorite: () => void;
// }) {
// 	return (
// 		<div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
// 			{/* Название + действия */}
// 			<div className="flex items-start justify-between gap-2">
// 				<div className="flex-1 min-w-0">
// 					<Badge
// 						variant="outline"
// 						className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/30 bg-primary/10 mb-1.5"
// 					>
// 						{equipment.category}
// 					</Badge>
// 					<h1 className="text-xl font-black uppercase italic leading-tight tracking-tighter">
// 						{equipment.title}
// 					</h1>
// 				</div>
// 				<div className="flex gap-1 shrink-0 pt-5">
// 					<button
// 						type="button"
// 						onClick={onShare}
// 						className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
// 					>
// 						<FontAwesomeIcon icon={faShareFromSquare} className="w-3 h-3" />
// 					</button>
// 					<button
// 						type="button"
// 						onClick={onFavorite}
// 						className={cn(
// 							"w-8 h-8 rounded-full border flex items-center justify-center transition-all",
// 							isFavorite ? "border-primary/40 bg-primary/10" : "border-white/10"
// 						)}
// 					>
// 						<FontAwesomeIcon
// 							icon={isFavorite ? faHeartSolid : faHeartReg}
// 							className={cn("w-3 h-3", isFavorite && "text-primary")}
// 						/>
// 					</button>
// 				</div>
// 			</div>

// 			{/* Тарифы */}
// 			<Tabs
// 				value={activeTab}
// 				onValueChange={(v) => onTabChange(v as "h4" | "h8" | "day")}
// 			>
// 				<TabsList className="grid grid-cols-3 w-full h-9 bg-black/20 rounded-xl p-0.5 border border-white/5">
// 					<TabsTrigger
// 						value="h4"
// 						className="rounded-lg font-bold uppercase text-[10px]"
// 					>
// 						4ч
// 					</TabsTrigger>
// 					<TabsTrigger
// 						value="h8"
// 						className="rounded-lg font-bold uppercase text-[10px]"
// 					>
// 						8ч
// 					</TabsTrigger>
// 					<TabsTrigger
// 						value="day"
// 						className="rounded-lg font-bold uppercase text-[10px]"
// 					>
// 						Сутки
// 					</TabsTrigger>
// 				</TabsList>
// 			</Tabs>

// 			{/* Цена + доступность */}
// 			<div className="flex items-end justify-between">
// 				<div>
// 					<p className="text-[10px] opacity-40 uppercase font-bold mb-0.5">
// 						{quantity > 1 ? `За ${quantity} шт.` : "Стоимость"}
// 					</p>
// 					<p className="text-3xl font-black italic text-primary tracking-tighter leading-none">
// 						{price.toLocaleString("ru")}₽
// 					</p>
// 				</div>
// 				<div className="text-right">
// 					<p className="text-[10px] opacity-40 uppercase font-bold">Доступно</p>
// 					<p className="font-black italic text-lg">
// 						{equipment.available_count}
// 						<span className="text-[10px] opacity-60 not-italic ml-0.5">
// 							шт.
// 						</span>
// 					</p>
// 				</div>
// 			</div>

// 			{/* Залог */}
// 			{!!equipment.deposit && (
// 				<div className="flex items-center gap-2 p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
// 					<ShieldCheck size={13} className="text-yellow-500 shrink-0" />
// 					<p className="text-[11px] font-bold text-yellow-500">
// 						Залог при получении:{" "}
// 						{(equipment.deposit * Math.max(quantity, 1)).toLocaleString("ru")} ₽
// 					</p>
// 				</div>
// 			)}
// 		</div>
// 	);
// }
