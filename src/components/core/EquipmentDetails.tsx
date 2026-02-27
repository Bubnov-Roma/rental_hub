"use client";

import {
	faHeart as faHeartReg,
	faShareFromSquare,
} from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Info, Package, Video, X, Zap } from "lucide-react";
import Image from "next/image";
// import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { AddToCartButton } from "@/components/core/AddToCartButton";
import {
	Badge,
	Button,
	Card,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	Separator,
	Tabs,
	TabsList,
	TabsTrigger,
} from "@/components/ui";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { useFavorite } from "@/hooks";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

// ─── Markdown components ──────────────────────────────────────────────────────
const mdComponents: Components = {
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
	p: ({ children }) => (
		<p className="text-sm leading-relaxed text-foreground/80 mb-2 last:mb-0">
			{children}
		</p>
	),
	ul: ({ children }) => (
		<ul className="list-none space-y-1 mb-2">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="list-none space-y-1 mb-2">{children}</ol>
	),
	li: ({ children }) => (
		<li className="flex items-start gap-2 text-sm text-foreground/80">
			<span className="text-primary mt-1 shrink-0">•</span>
			<span>{children}</span>
		</li>
	),
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
	hr: () => <hr className="border-white/10 my-3" />,
	pre: ({ children }) => (
		<pre className="bg-white/5 rounded-xl p-3 overflow-x-auto text-xs mb-2">
			{children}
		</pre>
	),
};

function MD({ children }: { children: string | null | undefined }) {
	if (!children) return null;
	return <ReactMarkdown components={mdComponents}>{children}</ReactMarkdown>;
}

// ─── Image placeholder when no photo loaded ───────────────────────────────────
function ImagePlaceholder({ title }: { title: string }) {
	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/5 gap-3">
			<div className="w-16 h-16 rounded-2xl bg-foreground/10 flex items-center justify-center">
				<Package size={28} className="text-muted-foreground/30" />
			</div>
			<p className="text-sm font-bold text-muted-foreground/40 text-center px-4 line-clamp-2">
				{title}
			</p>
		</div>
	);
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
	src,
	title,
	onClose,
}: {
	src: string;
	title: string;
	onClose: () => void;
}) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <fieldset>
		<fieldset
			className="fixed inset-0 z-100 flex items-center justify-center bg-background/90 backdrop-blur-sm"
			onClick={onClose}
		>
			{/* Close button */}
			<Button
				variant="glass"
				onClick={onClose}
				className="absolute top-8 right-8 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
			>
				<X size={18} className="text-foreground" />
			</Button>

			<button
				type="button"
				className="relative w-full h-full max-w-5xl max-h-[90vh] m-4"
				onClick={(e) => e.stopPropagation()}
			>
				<Image src={src} fill className="object-contain" alt={title} />
			</button>
		</fieldset>
	);
}

// ─── Info section tabs (NavigationMenu horizontal) ────────────────────────────
const INFO_TABS = [
	{ id: "description", label: "Описание", icon: Info },
	{ id: "specs", label: "Характеристики", icon: Zap },
	{ id: "kit", label: "Комплектация", icon: Package },
	{ id: "reviews", label: "Обзоры", icon: Video },
] as const;

type InfoTabId = (typeof INFO_TABS)[number]["id"];

// ─── Main component ────────────────────────────────────────────────────────────
export default function EquipmentDetails({
	equipment,
}: {
	equipment: GroupedEquipment;
}) {
	const [quantity, setQuantity] = useState(1);
	const { items } = useCartStore();

	const itemInCart = items.find((i) => i.equipment.id === equipment.id);
	const qtyInCart = itemInCart?.quantity || 0;
	const maxCanAdd = equipment.available_count - qtyInCart;

	useEffect(() => {
		if (quantity > maxCanAdd && maxCanAdd > 0) {
			setQuantity(maxCanAdd);
		}
	}, [maxCanAdd, quantity]);

	// const router = useRouter();
	const [activeRentTab, setActiveRentTab] = useState<"h4" | "h8" | "day">(
		"day"
	);
	const [activeInfoTab, setActiveInfoTab] = useState<InfoTabId>("description");
	const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
	const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
	const imageRef = useRef<HTMLDivElement>(null);

	// ── REMOVED: swipe-to-cart (was conflicting with carousel swipe) ──────────
	// The swipe gesture (left swipe → /checkout) is removed because it conflicts
	// with the image carousel's own touch/swipe handling, causing unexpected
	// redirects when users try to browse photos.

	const { isFavorite, toggle: toggleFavorite } = useFavorite(equipment.id);

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

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success("Ссылка скопирована");
	};

	// Filter tabs to only show sections with content
	const visibleTabs = INFO_TABS.filter((tab) => {
		if (tab.id === "description") return !!equipment.description;
		if (tab.id === "specs") return specEntries.length > 0 || !!specDesc;
		if (tab.id === "kit") return !!equipment.kit_description;
		if (tab.id === "reviews") return true;
		return true;
	});

	return (
		<>
			{lightboxSrc && (
				<Lightbox
					src={lightboxSrc}
					title={equipment.title}
					onClose={() => setLightboxSrc(null)}
				/>
			)}

			{/*
				IMPORTANT CHANGE: Removed onTouchStart/onTouchEnd from the outer
				container div. The swipe-to-cart gesture was intercepting touch events
				from the Carousel component, causing accidental navigation to /checkout
				when users swiped through images.

				The Carousel handles its own touch events internally — adding a competing
				handler on the parent div caused race conditions on mobile.
			*/}
			<div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-28 lg:pb-8">
				{/* ━━ LEFT COLUMN ━━ */}
				<div className="lg:col-span-7 space-y-4">
					{/* ── Gallery carousel — NO touch handlers on parent ── */}
					<Carousel className="w-full">
						<CarouselContent>
							{images.map((img, i) => (
								<CarouselItem key={`${img}` + `${i}`}>
									<Card
										ref={i === 0 ? imageRef : undefined}
										tabIndex={0}
										className="relative aspect-video rounded-3xl overflow-hidden cursor-zoom-in bg-foreground/5 group"
										onClick={() => !imgErrors.has(i) && setLightboxSrc(img)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												!imgErrors.has(i) && setLightboxSrc(img);
											}
										}}
									>
										{imgErrors.has(i) ? (
											<ImagePlaceholder title={equipment.title} />
										) : (
											<Image
												src={img}
												fill
												className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
												alt={equipment.title}
												priority={i === 0}
												onError={() =>
													setImgErrors((prev) => new Set(prev).add(i))
												}
											/>
										)}

										{/* Mobile actions overlay */}
										<div className="absolute top-3 right-3 flex gap-2 lg:hidden">
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
												}}
												className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
											>
												<FontAwesomeIcon
													icon={faShareFromSquare}
													className="w-3 h-3 text-white"
												/>
											</button>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													toggleFavorite(e);
												}}
												className={cn(
													"w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all",
													isFavorite ? "bg-primary/80" : "bg-black/40"
												)}
											>
												<FontAwesomeIcon
													icon={isFavorite ? faHeartSolid : faHeartReg}
													className="w-3 h-3 text-white"
												/>
											</button>
										</div>

										<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<span className="text-white text-xs font-bold uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-full">
												Открыть
											</span>
										</div>
									</Card>
								</CarouselItem>
							))}
						</CarouselContent>
						{images.length > 1 && (
							<>
								<CarouselPrevious className="left-3 hidden sm:flex" />
								<CarouselNext className="right-3 hidden sm:flex" />
							</>
						)}
					</Carousel>

					{/* Thumbnails — desktop only */}
					{images.length > 1 && (
						<div className="hidden lg:flex gap-2 overflow-x-auto pb-1 no-scrollbar">
							{images.map((img, i) => (
								<button
									key={`${img}` + `${i}`}
									type="button"
									onClick={() => setLightboxSrc(img)}
									className={cn(
										"relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
										"border-transparent hover:border-primary/50"
									)}
								>
									{imgErrors.has(i) ? (
										<div className="w-full h-full bg-foreground/10 flex items-center justify-center">
											<Package size={14} className="text-muted-foreground/30" />
										</div>
									) : (
										<Image
											src={img}
											fill
											className="object-cover"
											alt=""
											onError={() =>
												setImgErrors((prev) => new Set(prev).add(i))
											}
										/>
									)}
								</button>
							))}
						</div>
					)}

					{/* ── Mobile price + title row ── */}
					<div className="lg:hidden">
						<div className="flex justify-between gap-3 items-end">
							<h1 className="flex-1 text-2xl font-black uppercase italic leading-tight tracking-tighter">
								{equipment.title}
							</h1>
							<div className="text-right shrink-0 ">
								<p className="text-[10px] uppercase font-black opacity-40 mb-0.5">
									{quantity > 1 ? `За ${quantity} шт.` : "Стоимость"}
								</p>
								<p className="text-2xl font-black italic tracking-tighter leading-none">
									{currentPrice.toLocaleString("ru")} ₽
								</p>
							</div>
						</div>

						{/* Mobile rent tabs */}
						<Tabs
							value={activeRentTab}
							onValueChange={(v) => setActiveRentTab(v as "h4" | "h8" | "day")}
							className="mt-3"
						>
							<TabsList className="grid grid-cols-3 w-full h-9 bg-black/20 rounded-xl p-0.5 border border-white/5">
								<TabsTrigger
									value="h4"
									className="rounded-lg font-bold uppercase text-[10px]"
								>
									4 часа
								</TabsTrigger>
								<TabsTrigger
									value="h8"
									className="rounded-lg font-bold uppercase text-[10px]"
								>
									8 часов
								</TabsTrigger>
								<TabsTrigger
									value="day"
									className="rounded-lg font-bold uppercase text-[10px]"
								>
									Сутки
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* ── Info NavigationMenu (horizontal tabs) ── */}
					<div className="mt-2">
						<NavigationMenu>
							<NavigationMenuList className="gap-0 overflow-x-auto flex-nowrap no-scrollbar">
								{visibleTabs.map(({ id, label, icon: Icon }) => (
									<NavigationMenuItem key={id}>
										<NavigationMenuLink asChild active={activeInfoTab === id}>
											<button
												type="button"
												onClick={() => setActiveInfoTab(id)}
												className={cn(
													"flex items-center gap-1.5 px-3 py-2 text-sm font-bold whitespace-nowrap rounded-xl transition-all",
													"border-b-2",
													activeInfoTab === id
														? "text-primary border-primary"
														: "text-foreground/50 border-transparent hover:text-foreground hover:border-foreground/20"
												)}
											>
												<Icon size={13} />
												<span className="hidden sm:inline">{label}</span>
												<span className="sm:hidden text-[11px]">
													{label.slice(0, 4)}
												</span>
											</button>
										</NavigationMenuLink>
									</NavigationMenuItem>
								))}
							</NavigationMenuList>
						</NavigationMenu>

						<div className="mt-4 min-h-20">
							{activeInfoTab === "description" && (
								<MD>{equipment.description}</MD>
							)}

							{activeInfoTab === "specs" &&
								(specEntries.length > 0 ? (
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
								))}

							{activeInfoTab === "kit" && <MD>{equipment.kit_description}</MD>}

							{activeInfoTab === "reviews" && (
								<div className="py-8 text-center">
									<Video
										size={24}
										className="text-muted-foreground/25 mx-auto mb-2"
									/>
									<p className="text-sm text-muted-foreground">
										Видеообзоры появятся позже
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* ━━ RIGHT COLUMN — desktop sticky panel ━━ */}
				<div className="hidden lg:block lg:col-span-5">
					<div className="glass-card bg-muted-foreground/10 sticky top-24 space-y-5 p-5 md:p-6 rounded-3xl border border-white/10 backdrop-blur-3xl">
						<div className="flex items-center justify-between">
							<Badge
								variant="outline"
								className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/30 bg-primary/10"
							>
								{equipment.category}
							</Badge>
							<div className="flex items-center gap-2">
								<Button
									variant="glass"
									onClick={handleShare}
									aria-label="Поделиться"
									className="w-9 h-9 rounded-full flex items-center justify-center"
								>
									<FontAwesomeIcon
										icon={faShareFromSquare}
										className="w-3.5 h-3.5"
									/>
								</Button>
								<Button
									variant="glass"
									onClick={(e) =>
										toggleFavorite(e as unknown as React.MouseEvent)
									}
									aria-label="В избранное"
									className="w-9 h-9 rounded-full flex items-center justify-center"
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

						<div className="flex items-end justify-between">
							<div>
								<span className="text-[10px] uppercase font-black opacity-40 block mb-1">
									{quantity > 1 ? `Итого за ${quantity} шт.` : "Стоимость"}
								</span>
								<div className="text-5xl font-black italic text-foreground tracking-tighter leading-none">
									{currentPrice.toLocaleString("ru")} ₽
								</div>
							</div>
						</div>

						<Separator className="bg-foreground/10" />

						<AddToCartButton
							item={equipment}
							sourceRef={imageRef as React.RefObject<HTMLElement | null>}
							size="lg"
							variant="details"
							className="w-full"
						/>

						<div className="grid grid-cols-2 gap-2">
							<div className="p-3 rounded-xl bg-background border border-white/5 text-center">
								<p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
									Аренда на 4 часа
								</p>
								<p className="text-sm font-black">
									{equipment.price_4h?.toLocaleString("ru") ?? "—"} ₽
								</p>
							</div>
							<div className="p-3 rounded-xl bg-background border border-white/5 text-center">
								<p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
									Аренда на 8 часов
								</p>
								<p className="text-sm font-black">
									{equipment.price_8h?.toLocaleString("ru") ?? "—"} ₽
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ━━ MOBILE FAB — pinned above MobileNav ━━ */}
			<div
				className="lg:hidden fixed inset-x-0 z-70 px-4 py-3 bg-transparent"
				style={{
					bottom: "calc(5rem + env(safe-area-inset-bottom))",
					isolation: "isolate",
				}}
			>
				<AddToCartButton
					item={equipment}
					sourceRef={imageRef as React.RefObject<HTMLElement | null>}
					size="lg"
					variant="details"
					className="w-full"
				/>
			</div>
		</>
	);
}

// "use client";

// import {
// 	faHeart as faHeartReg,
// 	faShareFromSquare,
// } from "@fortawesome/free-regular-svg-icons";
// import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Info, Package, Video, X, Zap } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import type React from "react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import type { Components } from "react-markdown";
// import ReactMarkdown from "react-markdown";
// import { toast } from "sonner";
// import { AddToCartButton } from "@/components/core/AddToCartButton";
// import {
// 	Badge,
// 	Button,
// 	Card,
// 	Carousel,
// 	CarouselContent,
// 	CarouselItem,
// 	CarouselNext,
// 	CarouselPrevious,
// 	NavigationMenu,
// 	NavigationMenuItem,
// 	NavigationMenuLink,
// 	NavigationMenuList,
// 	Separator,
// 	Tabs,
// 	TabsList,
// 	TabsTrigger,
// } from "@/components/ui";
// import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
// import { useFavorite } from "@/hooks";
// import { cn } from "@/lib/utils";
// import { useCartStore } from "@/store/use-cart-store";

// // ─── Markdown components ──────────────────────────────────────────────────────
// const mdComponents: Components = {
// 	h1: ({ children }) => (
// 		<h1 className="text-lg font-black uppercase italic mb-2 text-foreground mt-4 first:mt-0">
// 			{children}
// 		</h1>
// 	),
// 	h2: ({ children }) => (
// 		<h2 className="text-base font-black uppercase italic mb-2 text-foreground mt-3 first:mt-0">
// 			{children}
// 		</h2>
// 	),
// 	h3: ({ children }) => (
// 		<h3 className="text-sm font-black uppercase italic mb-1.5 text-foreground mt-3 first:mt-0">
// 			{children}
// 		</h3>
// 	),
// 	p: ({ children }) => (
// 		<p className="text-sm leading-relaxed text-foreground/80 mb-2 last:mb-0">
// 			{children}
// 		</p>
// 	),
// 	ul: ({ children }) => (
// 		<ul className="list-none space-y-1 mb-2">{children}</ul>
// 	),
// 	ol: ({ children }) => (
// 		<ol className="list-none space-y-1 mb-2">{children}</ol>
// 	),
// 	li: ({ children }) => (
// 		<li className="flex items-start gap-2 text-sm text-foreground/80">
// 			<span className="text-primary mt-1 shrink-0">•</span>
// 			<span>{children}</span>
// 		</li>
// 	),
// 	strong: ({ children }) => (
// 		<strong className="font-bold text-foreground">{children}</strong>
// 	),
// 	em: ({ children }) => (
// 		<em className="italic text-foreground/70">{children}</em>
// 	),
// 	code: ({ children }) => (
// 		<code className="text-xs bg-white/10 rounded px-1 py-0.5 font-mono">
// 			{children}
// 		</code>
// 	),
// 	hr: () => <hr className="border-white/10 my-3" />,
// 	pre: ({ children }) => (
// 		<pre className="bg-white/5 rounded-xl p-3 overflow-x-auto text-xs mb-2">
// 			{children}
// 		</pre>
// 	),
// };

// function MD({ children }: { children: string | null | undefined }) {
// 	if (!children) return null;
// 	return <ReactMarkdown components={mdComponents}>{children}</ReactMarkdown>;
// }

// // ─── Image placeholder when no photo loaded ───────────────────────────────────
// function ImagePlaceholder({ title }: { title: string }) {
// 	return (
// 		<div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/5 gap-3">
// 			<div className="w-16 h-16 rounded-2xl bg-foreground/10 flex items-center justify-center">
// 				<Package size={28} className="text-muted-foreground/30" />
// 			</div>
// 			<p className="text-sm font-bold text-muted-foreground/40 text-center px-4 line-clamp-2">
// 				{title}
// 			</p>
// 		</div>
// 	);
// }

// // ─── Lightbox ─────────────────────────────────────────────────────────────────
// function Lightbox({
// 	src,
// 	title,
// 	onClose,
// }: {
// 	src: string;
// 	title: string;
// 	onClose: () => void;
// }) {
// 	useEffect(() => {
// 		const onKey = (e: KeyboardEvent) => {
// 			if (e.key === "Escape") onClose();
// 		};
// 		document.addEventListener("keydown", onKey);
// 		return () => document.removeEventListener("keydown", onKey);
// 	}, [onClose]);

// 	return (
// 		// biome-ignore lint/a11y/useKeyWithClickEvents: <fieldset>
// 		<fieldset
// 			className="fixed inset-0 z-100 flex items-center justify-center bg-background/90 backdrop-blur-sm"
// 			onClick={onClose}
// 		>
// 			{/* Close button */}
// 			<Button
// 				variant="glass"
// 				onClick={onClose}
// 				className="absolute top-8 right-8 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
// 			>
// 				<X size={18} className="text-foreground" />
// 			</Button>

// 			<button
// 				type="button"
// 				className="relative w-full h-full max-w-5xl max-h-[90vh] m-4"
// 				onClick={(e) => e.stopPropagation()}
// 			>
// 				<Image src={src} fill className="object-contain" alt={title} />
// 			</button>
// 		</fieldset>
// 	);
// }

// // ─── Info section tabs (NavigationMenu horizontal) ────────────────────────────
// const INFO_TABS = [
// 	{ id: "description", label: "Описание", icon: Info },
// 	{ id: "specs", label: "Характеристики", icon: Zap },
// 	{ id: "kit", label: "Комплектация", icon: Package },
// 	{ id: "reviews", label: "Обзоры", icon: Video },
// ] as const;

// type InfoTabId = (typeof INFO_TABS)[number]["id"];

// // ─── Main component ────────────────────────────────────────────────────────────
// export default function EquipmentDetails({
// 	equipment,
// }: {
// 	equipment: GroupedEquipment;
// }) {
// 	const [quantity, setQuantity] = useState(1);
// 	const { items } = useCartStore(); // Подписываемся на корзину

// 	// 1. Считаем, сколько уже в корзине
// 	const itemInCart = items.find((i) => i.equipment.id === equipment.id);
// 	const qtyInCart = itemInCart?.quantity || 0;

// 	// 2. Считаем, сколько ЕЩЕ можно добавить
// 	const maxCanAdd = equipment.available_count - qtyInCart;

// 	// 3. Если в корзине уже максимум, сбрасываем локальный счетчик в 0 или 1 (но кнопка будет заблокирована)
// 	useEffect(() => {
// 		if (quantity > maxCanAdd && maxCanAdd > 0) {
// 			setQuantity(maxCanAdd);
// 		}
// 	}, [maxCanAdd, quantity]);

// 	// Доступно для добавления (всего минус то, что уже в корзине)
// 	// const availableToAdd = Math.max(0, stockLimit - currentInCart);
// 	// const isMaxedOut = currentInCart >= stockLimit;

// 	// const [quantity, setQuantity] = useState(1);
// 	// const { items } = useCartStore();

// 	const router = useRouter();
// 	const [activeRentTab, setActiveRentTab] = useState<"h4" | "h8" | "day">(
// 		"day"
// 	);
// 	const [activeInfoTab, setActiveInfoTab] = useState<InfoTabId>("description");
// 	const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
// 	const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
// 	const imageRef = useRef<HTMLDivElement>(null);
// 	const swipeStartX = useRef<number | null>(null);

// 	const { isFavorite, toggle: toggleFavorite } = useFavorite(equipment.id);

// 	// const cartItem = items.find((i) => i.equipment.id === equipment.id);
// 	// const quantity = cartItem?.quantity || 0;
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

// 	// ── Swipe right → cart ─────────────────────────────────────────────────────
// 	const handleTouchStart = (e: React.TouchEvent) => {
// 		// Проверяем, есть ли хотя бы одно касание
// 		if (e.touches.length > 0 && e.touches[0]) {
// 			swipeStartX.current = e.touches[0].clientX;
// 		}
// 	};

// 	const handleTouchEnd = (e: React.TouchEvent) => {
// 		if (swipeStartX.current === null) return;

// 		// Проверяем наличие измененного касания
// 		if (e.changedTouches.length > 0 && e.changedTouches[0]) {
// 			const delta = swipeStartX.current - e.changedTouches[0].clientX;

// 			if (delta > 80) {
// 				router.push("/checkout");
// 				toast("Переход в корзину", { icon: "🛒" });
// 			}
// 		}

// 		swipeStartX.current = null;
// 	};

// 	const handleShare = () => {
// 		navigator.clipboard.writeText(window.location.href);
// 		toast.success("Ссылка скопирована");
// 	};

// 	// Filter tabs to only show sections with content
// 	const visibleTabs = INFO_TABS.filter((tab) => {
// 		if (tab.id === "description") return !!equipment.description;
// 		if (tab.id === "specs") return specEntries.length > 0 || !!specDesc;
// 		if (tab.id === "kit") return !!equipment.kit_description;
// 		if (tab.id === "reviews") return true;
// 		return true;
// 	});

// 	return (
// 		<>
// 			{lightboxSrc && (
// 				<Lightbox
// 					src={lightboxSrc}
// 					title={equipment.title}
// 					onClose={() => setLightboxSrc(null)}
// 				/>
// 			)}

// 			<div
// 				className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-28 lg:pb-8"
// 				onTouchStart={handleTouchStart}
// 				onTouchEnd={handleTouchEnd}
// 			>
// 				{/* ━━ LEFT COLUMN ━━ */}
// 				<div className="lg:col-span-7 space-y-4">
// 					{/* ── Gallery carousel ── */}
// 					<Carousel className="w-full">
// 						<CarouselContent>
// 							{images.map((img, i) => (
// 								<CarouselItem key={`${img}` + `${i}`}>
// 									<Card
// 										ref={i === 0 ? imageRef : undefined}
// 										tabIndex={0}
// 										className="relative aspect-video rounded-3xl overflow-hidden cursor-zoom-in bg-foreground/5 group"
// 										onClick={() => !imgErrors.has(i) && setLightboxSrc(img)}
// 										onKeyDown={(e) => {
// 											if (e.key === "Enter" || e.key === " ") {
// 												!imgErrors.has(i) && setLightboxSrc(img);
// 											}
// 										}}
// 									>
// 										{imgErrors.has(i) ? (
// 											<ImagePlaceholder title={equipment.title} />
// 										) : (
// 											<Image
// 												src={img}
// 												fill
// 												className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
// 												alt={equipment.title}
// 												priority={i === 0}
// 												onError={() =>
// 													setImgErrors((prev) => new Set(prev).add(i))
// 												}
// 											/>
// 										)}

// 										{/* Mobile actions overlay */}
// 										<div className="absolute top-3 right-3 flex gap-2 lg:hidden">
// 											<button
// 												type="button"
// 												onClick={(e) => {
// 													e.stopPropagation();
// 												}}
// 												className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
// 											>
// 												<FontAwesomeIcon
// 													icon={faShareFromSquare}
// 													className="w-3 h-3 text-white"
// 												/>
// 											</button>
// 											<button
// 												type="button"
// 												onClick={(e) => {
// 													e.stopPropagation();
// 													toggleFavorite(e);
// 												}}
// 												className={cn(
// 													"w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all",
// 													isFavorite ? "bg-primary/80" : "bg-black/40"
// 												)}
// 											>
// 												<FontAwesomeIcon
// 													icon={isFavorite ? faHeartSolid : faHeartReg}
// 													className="w-3 h-3 text-white"
// 												/>
// 											</button>
// 										</div>

// 										<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
// 											<span className="text-white text-xs font-bold uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-full">
// 												Открыть
// 											</span>
// 										</div>
// 									</Card>
// 								</CarouselItem>
// 							))}
// 						</CarouselContent>
// 						{images.length > 1 && (
// 							<>
// 								<CarouselPrevious className="left-3 hidden sm:flex" />
// 								<CarouselNext className="right-3 hidden sm:flex" />
// 							</>
// 						)}
// 					</Carousel>

// 					{/* Thumbnails — desktop only */}
// 					{images.length > 1 && (
// 						<div className="hidden lg:flex gap-2 overflow-x-auto pb-1 no-scrollbar">
// 							{images.map((img, i) => (
// 								<button
// 									key={`${img}` + `${i}`}
// 									type="button"
// 									onClick={() => setLightboxSrc(img)}
// 									className={cn(
// 										"relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
// 										"border-transparent hover:border-primary/50"
// 									)}
// 								>
// 									{imgErrors.has(i) ? (
// 										<div className="w-full h-full bg-foreground/10 flex items-center justify-center">
// 											<Package size={14} className="text-muted-foreground/30" />
// 										</div>
// 									) : (
// 										<Image
// 											src={img}
// 											fill
// 											className="object-cover"
// 											alt=""
// 											onError={() =>
// 												setImgErrors((prev) => new Set(prev).add(i))
// 											}
// 										/>
// 									)}
// 								</button>
// 							))}
// 						</div>
// 					)}

// 					{/* ── Mobile price + title row ── */}
// 					<div className="lg:hidden">
// 						<div className="flex justify-between gap-3 items-end">
// 							<h1 className="flex-1 text-2xl font-black uppercase italic leading-tight tracking-tighter">
// 								{equipment.title}
// 							</h1>
// 							<div className="text-right shrink-0 ">
// 								<p className="text-[10px] uppercase font-black opacity-40 mb-0.5">
// 									{quantity > 1 ? `За ${quantity} шт.` : "Стоимость"}
// 								</p>
// 								<p className="text-2xl font-black italic tracking-tighter leading-none">
// 									{currentPrice.toLocaleString("ru")} ₽
// 								</p>
// 							</div>
// 						</div>

// 						{/* Mobile rent tabs */}
// 						<Tabs
// 							value={activeRentTab}
// 							onValueChange={(v) => setActiveRentTab(v as "h4" | "h8" | "day")}
// 							className="mt-3"
// 						>
// 							<TabsList className="grid grid-cols-3 w-full h-9 bg-black/20 rounded-xl p-0.5 border border-white/5">
// 								<TabsTrigger
// 									value="h4"
// 									className="rounded-lg font-bold uppercase text-[10px]"
// 								>
// 									4 часа
// 								</TabsTrigger>
// 								<TabsTrigger
// 									value="h8"
// 									className="rounded-lg font-bold uppercase text-[10px]"
// 								>
// 									8 часов
// 								</TabsTrigger>
// 								<TabsTrigger
// 									value="day"
// 									className="rounded-lg font-bold uppercase text-[10px]"
// 								>
// 									Сутки
// 								</TabsTrigger>
// 							</TabsList>
// 						</Tabs>
// 					</div>

// 					{/* ── Info NavigationMenu (horizontal tabs) ── */}
// 					<div className="mt-2">
// 						<NavigationMenu>
// 							<NavigationMenuList className="gap-0 overflow-x-auto flex-nowrap no-scrollbar">
// 								{visibleTabs.map(({ id, label, icon: Icon }) => (
// 									<NavigationMenuItem key={id}>
// 										<NavigationMenuLink asChild active={activeInfoTab === id}>
// 											<button
// 												type="button"
// 												onClick={() => setActiveInfoTab(id)}
// 												className={cn(
// 													"flex items-center gap-1.5 px-3 py-2 text-sm font-bold whitespace-nowrap rounded-xl transition-all",
// 													"border-b-2",
// 													activeInfoTab === id
// 														? "text-primary border-primary"
// 														: "text-foreground/50 border-transparent hover:text-foreground hover:border-foreground/20"
// 												)}
// 											>
// 												<Icon size={13} />
// 												<span className="hidden sm:inline">{label}</span>
// 												<span className="sm:hidden text-[11px]">
// 													{label.slice(0, 4)}
// 												</span>
// 											</button>
// 										</NavigationMenuLink>
// 									</NavigationMenuItem>
// 								))}
// 							</NavigationMenuList>
// 						</NavigationMenu>

// 						<div className="mt-4 min-h-20">
// 							{activeInfoTab === "description" && (
// 								<MD>{equipment.description}</MD>
// 							)}

// 							{activeInfoTab === "specs" &&
// 								(specEntries.length > 0 ? (
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
// 									<MD>{specDesc}</MD>
// 								))}

// 							{activeInfoTab === "kit" && <MD>{equipment.kit_description}</MD>}

// 							{activeInfoTab === "reviews" && (
// 								<div className="py-8 text-center">
// 									<Video
// 										size={24}
// 										className="text-muted-foreground/25 mx-auto mb-2"
// 									/>
// 									<p className="text-sm text-muted-foreground">
// 										Видеообзоры появятся позже
// 									</p>
// 								</div>
// 							)}
// 						</div>
// 					</div>
// 				</div>

// 				{/* ━━ RIGHT COLUMN — desktop sticky panel ━━ */}
// 				<div className="hidden lg:block lg:col-span-5">
// 					<div className="glass-card bg-muted-foreground/10 sticky top-24 space-y-5 p-5 md:p-6 rounded-3xl border border-white/10 backdrop-blur-3xl">
// 						<div className="flex items-center justify-between">
// 							<Badge
// 								variant="outline"
// 								className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/30 bg-primary/10"
// 							>
// 								{equipment.category}
// 							</Badge>
// 							<div className="flex items-center gap-2">
// 								<Button
// 									variant="glass"
// 									onClick={handleShare}
// 									aria-label="Поделиться"
// 									className="w-9 h-9 rounded-full flex items-center justify-center"
// 								>
// 									<FontAwesomeIcon
// 										icon={faShareFromSquare}
// 										className="w-3.5 h-3.5"
// 									/>
// 								</Button>
// 								<Button
// 									variant="glass"
// 									onClick={(e) =>
// 										toggleFavorite(e as unknown as React.MouseEvent)
// 									}
// 									aria-label="В избранное"
// 									className="w-9 h-9 rounded-full flex items-center justify-center"
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

// 						<div className="flex items-end justify-between">
// 							<div>
// 								<span className="text-[10px] uppercase font-black opacity-40 block mb-1">
// 									{quantity > 1 ? `Итого за ${quantity} шт.` : "Стоимость"}
// 								</span>
// 								<div className="text-5xl font-black italic text-foreground tracking-tighter leading-none">
// 									{currentPrice.toLocaleString("ru")} ₽
// 								</div>
// 							</div>
// 						</div>

// 						<Separator className="bg-foreground/10" />

// 						{/* Ozon-style split button on desktop details */}
// 						<AddToCartButton
// 							item={equipment}
// 							sourceRef={imageRef as React.RefObject<HTMLElement | null>}
// 							size="lg"
// 							variant="details"
// 							className="w-full"
// 						/>

// 						<div className="grid grid-cols-2 gap-2">
// 							<div className="p-3 rounded-xl bg-background border border-white/5 text-center">
// 								<p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
// 									Аренда на 4 часа
// 								</p>
// 								<p className="text-sm font-black">
// 									{equipment.price_4h?.toLocaleString("ru") ?? "—"} ₽
// 								</p>
// 							</div>
// 							<div className="p-3 rounded-xl bg-background border border-white/5 text-center">
// 								<p className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
// 									Аренда на 8 часов
// 								</p>
// 								<p className="text-sm font-black">
// 									{equipment.price_8h?.toLocaleString("ru") ?? "—"} ₽
// 								</p>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</div>

// 			{/* ━━ MOBILE FAB — pinned above MobileNav ━━ */}
// 			<div
// 				className="lg:hidden fixed inset-x-0 z-70 px-4 py-3 bg-transparent"
// 				style={{
// 					bottom: "calc(5rem + env(safe-area-inset-bottom))",
// 					isolation: "isolate",
// 				}}
// 			>
// 				<AddToCartButton
// 					item={equipment}
// 					sourceRef={imageRef as React.RefObject<HTMLElement | null>}
// 					size="lg"
// 					variant="details"
// 					className="w-full"
// 				/>
// 			</div>
// 		</>
// 	);
// }
