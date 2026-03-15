"use client";

import {
	faHeart as faHeartReg,
	faShareFromSquare,
} from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Info, Video, X, Zap } from "lucide-react";
import Image from "next/image";
import NProgress from "nprogress";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import {
	checkAvailabilityAction,
	submitBookingAction,
} from "@/actions/booking-actions";
import { getRelatedEquipmentAction } from "@/actions/equipment-actions";
import { AddToCartButton } from "@/components/core/AddToCartButton";
import { PriceSelector } from "@/components/core/PriceSelector";
import { BookingSuccessScreen } from "@/components/dashboard/bookings/BookingSuccessScreen";
import {
	AuthModal,
	BackButton,
	BookingButton,
	defaultRentalPeriod,
	RentalPeriod,
} from "@/components/shared";
import { EquipmentCard } from "@/components/shared/EquipmentCard";
import {
	Button,
	Card,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { useAuth, useFavorite } from "@/hooks";
import { calculateItemPrice, cn, combineDateAndTime } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

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
		// biome-ignore lint/a11y/useKeyWithClickEvents: <thus>
		<fieldset
			className="fixed inset-0 z-100 flex items-center justify-center bg-background/90 backdrop-blur-sm"
			onClick={onClose}
		>
			<Button
				variant="brand"
				onClick={onClose}
				className="absolute bottom-8 right-8 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
			>
				<X size={18} className="text-foreground" />
			</Button>
			<button
				type="button"
				className="relative w-full h-full max-w-5xl max-h-[90vh] m-4 cursor-default"
				onClick={(e) => e.stopPropagation()}
			>
				<Image src={src} fill className="object-contain" alt={title} />
			</button>
		</fieldset>
	);
}

// ─── Markdown ─────────────────────────────────────────────────────────────────
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

// ─── Info tabs ────────────────────────────────────────────────────────────────
const INFO_TABS = [
	{ id: "description", label: "Описание", icon: Info },
	{ id: "specs", label: "Характеристики", icon: Zap },
	{ id: "reviews", label: "Обзоры", icon: Video },
] as const;

type InfoTabId = (typeof INFO_TABS)[number]["id"];

// ─── Related slider with real EquipmentCard ───────────────────────────────────
function RelatedSlider({ ids }: { ids: string[] }) {
	const [items, setItems] = useState<GroupedEquipment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!ids.length) return;
		let cancelled = false;
		setLoading(true);
		getRelatedEquipmentAction(ids).then((data) => {
			if (!cancelled) {
				setItems(data);
				setLoading(false);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [ids]);

	if (loading) {
		return (
			<div className="flex gap-4">
				{ids.slice(0, 8).map((id) => (
					<div
						key={id}
						className="w-30 shrink-0 rounded-2xl bg-foreground/5 animate-pulse aspect-square"
					/>
				))}
			</div>
		);
	}

	if (!items.length) return null;

	return (
		<div className="py-2 px-2 round-md flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar">
			{items.map((item) => (
				<div key={item.id} className="w-30 shrink-0">
					<EquipmentCard item={item} variant="slider" />
				</div>
			))}
		</div>
	);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EquipmentDetails({
	equipment,
}: {
	equipment: GroupedEquipment;
}) {
	const { user } = useAuth();
	const { items: cartItems } = useCartStore();
	const [isDesktop, setIsDesktop] = useState(true);
	useEffect(() => {
		const check = () => setIsDesktop(window.innerWidth >= 768);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	const [activeInfoTab, setActiveInfoTab] = useState<InfoTabId>("description");
	const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
	const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
	const imageRef = useRef<HTMLDivElement>(null);

	const { isFavorite, toggle: toggleFavorite } = useFavorite(equipment.id);
	const images = equipment.images?.length
		? equipment.images
		: [equipment.imageUrl];

	const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
	const [period, setPeriod] = useState(defaultRentalPeriod);
	const [isChecking, setIsChecking] = useState(false);
	const [busyIds, setBusyIds] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showAuth, setShowAuth] = useState(false);
	const [bookingId, setBookingId] = useState<string | null>(null);

	const isLoggedIn = !!user;

	const quantity = useMemo(() => {
		const inCart = cartItems.find((i) => i.equipment.id === equipment.id);
		return inCart ? inCart.quantity : 1;
	}, [cartItems, equipment.id]);

	const math = useMemo(() => {
		const start = combineDateAndTime(period.startDate, period.startTime);
		const end = combineDateAndTime(period.endDate, period.endTime);
		if (!start || !end)
			return { totalRental: 0, hours: 0, startFull: null, endFull: null };
		const hours = Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
		const linePrice = calculateItemPrice(equipment, hours);
		return {
			hours,
			startFull: start,
			endFull: end,
			totalRental: linePrice * quantity,
			totalRV: (equipment.replacement_value || 0) * quantity,
		};
	}, [period, equipment, quantity]);

	useEffect(() => {
		if (!isQuickBookOpen) return;
		let cancelled = false;
		async function check() {
			if (!math.startFull || !math.endFull) {
				setBusyIds([]);
				return;
			}
			setIsChecking(true);
			NProgress.start();
			try {
				const r = await checkAvailabilityAction(
					[equipment.id],
					math.startFull.toISOString(),
					math.endFull.toISOString()
				);
				if (!cancelled) setBusyIds(r.busyIds ?? []);
			} finally {
				if (!cancelled) {
					setIsChecking(false);
					NProgress.done();
				}
			}
		}
		check();
		return () => {
			cancelled = true;
		};
	}, [math.startFull, math.endFull, equipment.id, isQuickBookOpen]);

	const hasConflict = busyIds.length > 0;
	const canBook =
		!hasConflict && math.totalRental > 0 && !!math.startFull && !!math.endFull;

	const handleQuickBookSubmit = () => {
		if (!canBook) return;
		if (!isLoggedIn) {
			setShowAuth(true);
			return;
		}
		doCreateBooking();
	};

	const doCreateBooking = async () => {
		if (!canBook || !math.startFull || !math.endFull) return;
		setIsSubmitting(true);
		try {
			const result = await submitBookingAction({
				items: [
					{
						id: equipment.id,
						price_to_pay: calculateItemPrice(equipment, math.hours),
					},
				],
				startDate: math.startFull.toISOString(),
				endDate: math.endFull.toISOString(),
				totalPrice: math.totalRental,
				hasInsurance: true,
				totalReplacementValue: math.totalRV,
			});
			if (result.success && result.bookingId) {
				setIsQuickBookOpen(false);
				setBookingId(result.bookingId);
			} else {
				toast.error(result.error || "Ошибка брони");
			}
		} catch {
			toast.error("Непредвиденная ошибка");
		} finally {
			setIsSubmitting(false);
		}
	};

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

	const visibleTabs = INFO_TABS.filter((tab) => {
		if (tab.id === "description") return !!equipment.description;
		if (tab.id === "specs") return specEntries.length > 0 || !!specDesc;
		return true;
	});

	const hasRelated = !!(
		equipment.related_ids && equipment.related_ids.length > 0
	);

	if (bookingId) return <BookingSuccessScreen bookingId={bookingId} />;

	/* ── Quick book sheet content (shared between Sheet and Dialog) ── */
	const quickBookContent = (
		<>
			<div className="p-3 rounded-xl bg-foreground/5 flex items-center justify-between">
				<span className="text-sm font-bold pr-4">{equipment.title}</span>
				<span className="text-sm font-black whitespace-nowrap">
					{quantity} шт.
				</span>
			</div>
			<div className="card-surface p-5 rounded-[1.75rem] border border-foreground/8">
				<p className="text-[10px] font-black uppercase italic tracking-widest opacity-40 mb-4">
					Период аренды
				</p>
				<RentalPeriod value={period} onChange={setPeriod} />
				{hasConflict && (
					<div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
						В этот период техника занята. Выберите другие даты.
					</div>
				)}
			</div>
		</>
	);

	const quickBookFooter = (
		<>
			<div className="flex justify-between items-end">
				<span className="text-xs font-bold uppercase text-muted-foreground">
					Итого к оплате
				</span>
				<span className="text-2xl font-black italic text-foreground leading-none flex items-center gap-2">
					{math.totalRental.toLocaleString("ru")} ₽
					{isChecking && (
						<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mb-1" />
					)}
				</span>
			</div>
			<BookingButton
				onClick={handleQuickBookSubmit}
				disabled={!canBook}
				loading={isSubmitting}
				isLoggedIn={isLoggedIn}
				mode="new"
				className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20"
			/>
		</>
	);

	return (
		<>
			{lightboxSrc && (
				<Lightbox
					src={lightboxSrc}
					title={equipment.title}
					onClose={() => setLightboxSrc(null)}
				/>
			)}

			<div className="max-w-7xl mx-auto px-4 py-4 flex flex-col animate-in fade-in duration-500 lg:overflow-hidden">
				{/* ── Two-column grid ── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 flex-1">
					{/* ━━ LEFT: gallery + price ━━ */}
					<div className="lg:col-span-5 order-1 lg:overscroll-contain custom-scrollbar">
						<div className="space-y-4">
							{/* Mobile title */}
							<div className="flex gap-4 items-center lg:hidden">
								<BackButton fallback="/equipment" />
								<h1 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
									{equipment.title}
								</h1>
							</div>

							{/* Gallery */}
							<div className="relative rounded-3xl overflow-hidden bg-foreground/5">
								<Carousel className="w-full">
									<CarouselContent>
										{images.map((img, i) => (
											<CarouselItem key={`${img}` + `${i}`}>
												<Card
													ref={i === 0 ? imageRef : undefined}
													className="relative aspect-4/3 overflow-hidden cursor-zoom-in group border-0 bg-transparent"
													onClick={() =>
														!imgErrors.has(i) && setLightboxSrc(img)
													}
												>
													<Image
														src={img}
														fill
														className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
														alt={equipment.title}
														priority={i === 0}
														onError={() =>
															setImgErrors((prev) => new Set(prev).add(i))
														}
													/>
												</Card>
											</CarouselItem>
										))}
									</CarouselContent>
									{images.length > 1 && (
										<>
											<CarouselPrevious className="left-4 bg-background/50 backdrop-blur" />
											<CarouselNext className="right-4 bg-background/50 backdrop-blur" />
										</>
									)}
								</Carousel>
								<div className="absolute top-4 left-4 right-4 flex justify-between z-2">
									<button
										type="button"
										onClick={handleShare}
										className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-background transition-colors shadow-sm"
									>
										<FontAwesomeIcon
											icon={faShareFromSquare}
											className="text-foreground/70 w-3.5 h-3.5"
										/>
									</button>
									<button
										type="button"
										onClick={(e) =>
											toggleFavorite(e as unknown as React.MouseEvent)
										}
										className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-background transition-colors shadow-sm"
									>
										<FontAwesomeIcon
											icon={isFavorite ? faHeartSolid : faHeartReg}
											className={cn(
												"w-3.5 h-3.5 transition-colors",
												isFavorite ? "text-primary" : "text-foreground/70"
											)}
										/>
									</button>
								</div>
							</div>
						</div>
						{/* Price + cart */}
						<PriceSelector
							prices={{
								day: equipment.price_per_day,
								h4: equipment.price_4h,
								h8: equipment.price_8h,
							}}
							variant="details"
							action={
								<AddToCartButton
									item={equipment}
									variant="details"
									size="md"
									className="w-full h-11"
									onQuickBook={() => setIsQuickBookOpen(true)}
								/>
							}
							className="mt-4"
						/>
					</div>

					{/* ━━ RIGHT: tabs + scrollable content ━━ */}
					<div className="lg:col-span-7 flex flex-col min-h-0 order-2">
						{/* Desktop title */}
						<div className="hidden lg:block shrink-0 mb-6">
							<h1 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
								{equipment.title}
							</h1>

							{/* Tabs */}
							<div className="shrink-0">
								<NavigationMenu>
									<NavigationMenuList className="gap-0.5 overflow-x-auto flex-nowrap no-scrollbar w-full">
										{visibleTabs.map(({ id, label, icon: Icon }) => (
											<NavigationMenuItem key={id}>
												<NavigationMenuLink
													asChild
													active={activeInfoTab === id}
												>
													<button
														type="button"
														onClick={() => setActiveInfoTab(id)}
														className={cn(
															"flex lg:flex-row w-full justify-between items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all relative cursor-pointer",
															activeInfoTab === id
																? "text-primary"
																: "text-foreground/50 hover:text-foreground"
														)}
													>
														<Icon size={14} />
														<span>{label}</span>
														{activeInfoTab === id && (
															<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
														)}
													</button>
												</NavigationMenuLink>
											</NavigationMenuItem>
										))}
									</NavigationMenuList>
								</NavigationMenu>
							</div>

							{/* Tab content — scrollable */}
							<div className="mt-6 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
								{activeInfoTab === "description" && (
									<MD>{equipment.description}</MD>
								)}
								{activeInfoTab === "specs" &&
									(specEntries.length > 0 ? (
										<dl className="divide-y divide-foreground/5">
											{specEntries.map(([key, val]) => (
												<div key={key} className="flex gap-4 py-3">
													<dt className="text-xs text-muted-foreground w-1/3 shrink-0 font-medium">
														{key}
													</dt>
													<dd className="text-sm font-bold">{val}</dd>
												</div>
											))}
										</dl>
									) : (
										<MD>{specDesc}</MD>
									))}
								{activeInfoTab === "reviews" && (
									<div className="py-12 text-center">
										<Video
											size={32}
											className="text-muted-foreground/20 mx-auto mb-3"
										/>
										<p className="text-sm font-medium text-muted-foreground">
											Видеообзоры появятся позже
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
				{/* ── Related items — full width below the grid ── */}
				{hasRelated && (
					<>
						<div className="flex items-center py-4">
							<h3 className="px-2 text-base text-muted-foreground font-black  tracking-tighter">
								Вместе с этим арендуют
							</h3>
						</div>
						<RelatedSlider ids={equipment.related_ids} />
					</>
				)}
			</div>

			{/* ━━ Quick book ━━ */}
			{isDesktop ? (
				<Sheet open={isQuickBookOpen} onOpenChange={setIsQuickBookOpen}>
					<SheetContent
						side="right"
						className="w-full sm:max-w-md overflow-y-auto flex flex-col gap-0 p-0"
						showCloseButton={false}
					>
						<SheetHeader className="px-6 pt-6 pb-4 border-b border-foreground/8 shrink-0">
							<SheetTitle className="flex items-center gap-2 text-xl font-black italic uppercase">
								<Zap size={20} className="text-primary" /> Быстрая бронь
							</SheetTitle>
						</SheetHeader>
						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
							{quickBookContent}
						</div>
						<div className="px-6 pb-6 pt-4 border-t border-foreground/5 space-y-4 shrink-0">
							{quickBookFooter}
						</div>
					</SheetContent>
				</Sheet>
			) : (
				<Dialog open={isQuickBookOpen} onOpenChange={setIsQuickBookOpen}>
					<DialogContent className="max-w-md p-6 sm:rounded-3xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2 text-xl font-black italic uppercase">
								<Zap size={20} className="text-primary" /> Быстрая бронь
							</DialogTitle>
						</DialogHeader>
						<div className="mt-4 space-y-3">{quickBookContent}</div>
						<div className="mt-6 pt-6 border-t border-foreground/5 space-y-4">
							{quickBookFooter}
						</div>
					</DialogContent>
				</Dialog>
			)}

			<AuthModal open={showAuth} onOpenChange={setShowAuth} />
		</>
	);
}
