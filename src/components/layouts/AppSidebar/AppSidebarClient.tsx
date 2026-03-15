"use client";

import {
	ApertureIcon,
	ArrowsClockwiseIcon,
	CameraIcon,
	CaretDownIcon,
	CaretUpIcon,
	CubeIcon,
	type Icon,
	type IconProps,
	LightbulbIcon,
} from "@phosphor-icons/react";
import {
	MicrophoneIcon,
	MicrophoneStageIcon,
	SidebarSimpleIcon,
	SquaresFourIcon,
	StackIcon,
	VideoCameraIcon,
} from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ForwardRefExoticComponent, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { Logo } from "@/components/icons/Logo";
import {
	Button,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui";
import { ADMIN_NAV, type DbCategory } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, ForwardRefExoticComponent<IconProps>> = {
	Camera: CameraIcon,
	Aperture: ApertureIcon,
	VideoCameraIcon,
	VideoCamera: VideoCameraIcon,
	FilmSlate: VideoCameraIcon,
	Lightbulb: LightbulbIcon,
	SpeakerHifi: MicrophoneStageIcon,
	MicrophoneStageIcon,
	Microphone: MicrophoneIcon,
	MicrophoneIcon,
	Drone: StackIcon,
	Spinner: StackIcon,
	ArrowsOutLineVertical: StackIcon,
	Package: CubeIcon,
	CubeIcon,
};

// ─── Phosphor icons (npm i @phosphor-icons/react) ──────────────
// Mapping icon_name (string from db) → React component.
// Add new icons
// All icons Phosphor: https://phosphoricons.com

function getCategoryIcon(iconName: string): Icon {
	return ICON_MAP[iconName] ?? CubeIcon;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const menuBtnClass = (isActive: boolean, isCollapsed: boolean) =>
	cn(
		"h-14 rounded-xl transition-all duration-300 group/btn w-full relative",
		isCollapsed ? "justify-center px-0" : "pl-4",
		isActive
			? "bg-primary/5 text-foreground font-bold shadow-sm"
			: "text-muted-foreground/60 hover:bg-muted-foreground/5 hover:text-foreground/80"
	);

const RenderIcon = ({
	icon: Icon,
	isActive,
}: {
	icon: Icon;
	isActive: boolean;
}) => (
	<Icon
		className={cn(
			"duration-300 transition-all ease-out size-6!",
			"group-hover/btn:-translate-y-0.5 group-hover/btn:scale-110",
			"group-hover/btn:ease-[cubic-bezier(0.34,1.96,0.84,1)]",
			"group-active/btn:scale-90",
			isActive
				? "text-foreground opacity-100"
				: "opacity-70 group-hover/btn:opacity-100 text-muted-foreground group-hover/btn:text-foreground"
		)}
		weight={isActive ? "fill" : "fill"}
		strokeWidth={isActive ? 2.5 : 2}
	/>
);

// ─── M3-style hover flyout (свёрнутый сайдбар) ───────────────────────────────
// Вдохновлён Material Design 3 Navigation Drawer:
// https://m3.material.io/components/navigation-drawer

interface CategoryFlyoutProps {
	category: DbCategory;
	isOpen: boolean;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	pathname: string;
}

function CategoryFlyout({
	category,
	isOpen,
	onMouseEnter,
	onMouseLeave,
	pathname,
}: CategoryFlyoutProps) {
	const Icon = getCategoryIcon(category.icon_name);
	const inCat = pathname.includes(`category=${category.slug}`);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					initial={{ opacity: 0, x: -12, scale: 0.97 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					exit={{
						opacity: 0,
						x: -8,
						scale: 0.97,
						transition: { duration: 0.18 },
					}}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					className={cn(
						"fixed left-20 top-0 bottom-0 w-72 z-40",
						"bg-sidebar/90",
						"border-r border-foreground/8",
						"flex flex-col",
						"shadow-2xl shadow-black/10"
					)}
				>
					<div className="flex items-center gap-4 px-6 pt-8 pb-6 backdrop-blur-2xl">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
							<Icon
								className="text-primary"
								size={24}
								strokeWidth={inCat ? 2.5 : 2}
							/>
						</div>
						<div className="flex flex-col">
							<Link
								href={`/equipment?category=${category.slug}`}
								className="font-black text-xl tracking-tight leading-none hover:text-primary transition-colors"
							>
								{category.name}
							</Link>
						</div>
					</div>

					{/* M3 Divider */}
					<div className="mx-6 h-px bg-foreground mb-3" />

					{/* M3 Nav items: крупные, с хорошими tap-targets */}
					<div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6 space-y-0.5 backdrop-blur-2xl">
						{/* Вся техника этой категории */}
						<M3NavItem
							href={`/equipment?category=${category.slug}`}
							isActive={inCat && !pathname.includes("subcategory=")}
							label="Все позиции"
							icon={SquaresFourIcon}
						/>

						{/* Подкатегории */}
						{category.subcategories.map((sub) => {
							const subActive = pathname.includes(`subcategory=${sub.slug}`);
							return (
								<M3NavItem
									key={sub.id}
									href={`/equipment?category=${category.slug}&subcategory=${sub.slug}`}
									isActive={subActive}
									label={sub.name}
								/>
							);
						})}
					</div>

					{/* M3 Footer hint */}
					<div className="px-6 py-4 border-t border-foreground/8">
						<Link
							href="/equipment"
							className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors font-medium"
						>
							← Весь каталог
						</Link>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

function M3NavItem({
	href,
	isActive,
	label,
	icon: Icon,
}: {
	href: string;
	isActive: boolean;
	label: string;
	icon?: Icon;
}) {
	return (
		<Link
			href={href}
			className={cn(
				// M3 list item: h-14 min, rounded-full (pill), крупный шрифт
				"flex items-center gap-4 px-4 rounded-2xl h-14 transition-all duration-200 group/m3",
				isActive
					? "bg-primary/10 text-primary font-bold"
					: "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
			)}
		>
			{Icon ? (
				<Icon
					size={20}
					className={cn(
						"shrink-0 transition-transform duration-200",
						"group-hover/m3:scale-110",
						isActive ? "text-primary" : "text-muted-foreground/60"
					)}
				/>
			) : (
				// Dot indicator вместо иконки для подкатегорий
				<span
					className={cn(
						"h-1.5 w-1.5 rounded-full shrink-0 ml-1",
						isActive ? "bg-primary" : "bg-muted-foreground/30"
					)}
				/>
			)}
			<span className="text-base font-medium truncate">{label}</span>
			{isActive && (
				<div className="ml-auto h-5 w-1 rounded-full bg-primary shrink-0" />
			)}
		</Link>
	);
}

// ─── CategoryNavItem: один пункт меню (развёрнутый сайдбар) ──────────────────
// Клик на иконку/название → навигация на /equipment?category=slug
// Клик на chevron → раскрыть/скрыть подкатегории

interface CategoryNavItemProps {
	category: DbCategory;
	isCollapsed: boolean;
	isMobile: boolean;
	pathname: string;
}

function CategoryNavItem({
	category,
	isCollapsed,
	pathname,
}: CategoryNavItemProps) {
	const Icon = getCategoryIcon(category.icon_name);
	const inCat = pathname.includes(`category=${category.slug}`);
	const catHref = `/equipment?category=${category.slug}`;
	const hasSub = category.subcategories.length > 0;
	const [hoveredCat, setHoveredCat] = useState<string | null>(null);
	const debouncedHide = useDebounceCallback(() => setHoveredCat(null), 250);

	// ── COLLAPSED: только иконка + flyout на hover ─────────────────────────
	if (isCollapsed) {
		return (
			<fieldset
				className="relative"
				onMouseEnter={() => {
					debouncedHide.cancel();
					setHoveredCat(category.id);
				}}
				onMouseLeave={debouncedHide}
			>
				<SidebarMenuItem>
					<SidebarMenuButton
						asChild
						isActive={inCat}
						className={menuBtnClass(inCat, true)}
						tooltip=""
					>
						<Link href={catHref}>
							<div className="flex items-center justify-center shrink-0 w-full relative">
								<RenderIcon icon={Icon} isActive={inCat} />
							</div>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<CategoryFlyout
					category={category}
					isOpen={hoveredCat === category.id}
					onMouseEnter={() => {
						debouncedHide.cancel();
						setHoveredCat(category.id);
					}}
					onMouseLeave={debouncedHide}
					pathname={pathname}
				/>
			</fieldset>
		);
	}

	// ── EXPANDED: кнопка с иконкой навигирует, chevron — раскрывает ────────
	if (hasSub) {
		return (
			<Collapsible defaultOpen={inCat} className="group/collapsible" asChild>
				<SidebarMenuItem>
					{/* Строка: [иконка + название → navigate] [chevron → toggle] */}
					<div className="flex items-center w-full">
						{/* Левая часть — навигация */}
						<SidebarMenuButton
							asChild
							isActive={inCat}
							className={cn(menuBtnClass(inCat, false), "flex-1 pr-2")}
						>
							<Link href={catHref}>
								<div className="flex items-center justify-center shrink-0 w-6">
									<RenderIcon icon={Icon} isActive={inCat} />
								</div>
								<span className="font-medium text-base truncate ml-3 flex-1 text-left">
									{category.name}
								</span>
							</Link>
						</SidebarMenuButton>

						{/* Правая часть — toggle подкатегорий */}
						<CollapsibleTrigger asChild>
							<button
								type="button"
								className={cn(
									"h-14 w-10 flex items-center justify-center rounded-xl shrink-0",
									"transition-colors hover:bg-foreground/5",
									"text-muted-foreground/40 hover:text-foreground/60"
								)}
								onClick={(e) => e.stopPropagation()}
							>
								<ChevronRight
									size={16}
									className="transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90"
								/>
							</button>
						</CollapsibleTrigger>
					</div>

					<CollapsibleContent>
						<SidebarMenuSub className="mr-0 pr-0 mt-1">
							{/* Все позиции категории */}
							<SidebarMenuSubItem>
								<SidebarMenuSubButton
									asChild
									isActive={inCat && !pathname.includes("subcategory=")}
									className={cn(
										"h-10 rounded-xl pl-4 text-sm transition-colors",
										inCat && !pathname.includes("subcategory=")
											? "bg-primary/10 text-primary font-semibold"
											: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
									)}
								></SidebarMenuSubButton>
							</SidebarMenuSubItem>

							{/* Подкатегории */}
							{category.subcategories.map((sub) => {
								const subActive = pathname.includes(`subcategory=${sub.slug}`);
								return (
									<SidebarMenuSubItem key={sub.id}>
										<SidebarMenuSubButton
											asChild
											isActive={subActive}
											className={cn(
												"h-10 rounded-xl pl-4 text-sm transition-colors",
												subActive
													? "bg-primary/10 text-primary font-semibold"
													: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
											)}
										>
											<Link
												href={`/equipment?category=${category.slug}&subcategory=${sub.slug}`}
											>
												<span>{sub.name}</span>
											</Link>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								);
							})}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		);
	}

	// ── Без подкатегорий: простая кнопка ──────────────────────────────────
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={inCat}
				className={menuBtnClass(inCat, false)}
			>
				<Link href={catHref}>
					<div className="flex items-center justify-center shrink-0 w-6">
						<RenderIcon icon={Icon} isActive={inCat} />
					</div>
					<span className="font-medium text-base truncate ml-3 flex-1 text-left">
						{category.name}
					</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

// ─── Mobile category list (внутри мобильного Drawer сайдбара) ────────────────

function MobileCategoryItem({
	category,
	pathname,
}: {
	category: DbCategory;
	pathname: string;
}) {
	const Icon = getCategoryIcon(category.icon_name);
	const inCat = pathname.includes(`category=${category.slug}`);
	const hasSub = category.subcategories.length > 0;

	const itemClass = (active: boolean) =>
		cn(
			"h-14 rounded-xl transition-all duration-300 group/btn w-full relative pl-4",
			active
				? "bg-primary/5 text-foreground font-bold shadow-sm"
				: "text-muted-foreground/60 hover:bg-muted-foreground/5 hover:text-foreground/80"
		);

	if (!hasSub) {
		return (
			<Link
				href={`/equipment?category=${category.slug}`}
				className={itemClass(inCat)}
			>
				<div className="flex items-center h-full gap-3">
					<Icon size={20} className="shrink-0 opacity-70" />
					<span className="font-medium text-base">{category.name}</span>
				</div>
			</Link>
		);
	}

	return (
		<Collapsible defaultOpen={inCat} className="group/subcat">
			<CollapsibleTrigger asChild>
				<button
					type="button"
					className={cn(itemClass(inCat), "w-full text-left")}
				>
					<div className="flex items-center h-full pl-0 gap-3">
						<Icon size={20} className="shrink-0 opacity-70" />
						<span className="font-medium text-base flex-1">
							{category.name}
						</span>
						<ChevronRight
							size={16}
							className="mr-4 transition-transform duration-300 group-data-[state=open]/subcat:rotate-90 text-muted-foreground/50"
						/>
					</div>
				</button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="ml-6 border-l border-foreground/10 pl-2 space-y-0.5">
					<Link
						href={`/equipment?category=${category.slug}`}
						className={cn(
							"flex items-center h-14 px-3 rounded-xl transition-all",
							inCat && !pathname.includes("subcategory=")
								? "bg-primary/10 text-primary font-bold"
								: "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
						)}
					>
						<span className="font-medium text-base">Все позиции</span>
					</Link>
					{category.subcategories.map((sub) => {
						const subActive = pathname.includes(`subcategory=${sub.slug}`);
						return (
							<Link
								key={sub.id}
								href={`/equipment?category=${category.slug}&subcategory=${sub.slug}`}
								className={cn(
									"flex items-center h-14 px-3 rounded-xl transition-all",
									subActive
										? "bg-primary/10 text-primary font-bold"
										: "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
								)}
							>
								<span className="font-medium text-base">{sub.name}</span>
							</Link>
						);
					})}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

// ─── Main client component ────────────────────────────────────────────────────

interface Props {
	isAdmin: boolean;
	categories: DbCategory[];
}

export function AppSidebarClient({ isAdmin, categories }: Props) {
	const pathname = usePathname();
	const { state, isMobile, toggleSidebar } = useSidebar();
	const isCollapsed = state === "collapsed" && !isMobile;

	const [showAdminNav, setShowAdminNav] = useState(true);

	return (
		<>
			{/* ── HEADER ── */}
			<SidebarHeader
				className={cn(
					"h-16 flex items-center justify-between relative border-b border-foreground/5",
					isCollapsed ? "mx-auto" : "px-4"
				)}
			>
				<div className="flex items-center w-full h-full gap-2 overflow-hidden">
					<Link
						href="/"
						className={cn(
							"flex items-center gap-3 transition-all duration-300",
							isCollapsed ? "w-10 justify-center relative" : "flex-1 min-w-0"
						)}
					>
						{isCollapsed ? (
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
								<Logo className="h-6 w-auto text-primary-foreground shadow-lg shadow-primary pl-1" />
							</div>
						) : (
							<>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
									<Logo className="h-6 w-auto text-primary-foreground shadow-lg shadow-primary/20 pl-1" />
								</div>
								<span className="font-black tracking-tighter text-xl truncate">
									LINZA
								</span>
							</>
						)}
					</Link>
					{!isCollapsed && (
						<Button
							variant="ghost"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								toggleSidebar();
							}}
							className="ml-auto hidden md:flex h-8 w-8 shrink-0 rounded-lg text-foreground transition-all duration-300 hover:scale-110"
						>
							<SidebarSimpleIcon size={16} />
						</Button>
					)}
				</div>
			</SidebarHeader>

			{/* ── CONTENT ── */}
			<SidebarContent className="px-2 custom-scrollbar">
				{/* ── Каталог (категории как корневые пункты) ── */}
				{(!isAdmin || !showAdminNav) && (
					<SidebarGroup className={cn("mt-4", isCollapsed && "mt-12")}>
						<SidebarGroupLabel
							className={cn(
								"px-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 transition-opacity",
								isCollapsed
									? "opacity-0 h-0 mb-0 overflow-hidden"
									: "opacity-100"
							)}
						>
							Каталог
						</SidebarGroupLabel>

						<SidebarMenu>
							{/* ── Вся техника ── */}
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={
										pathname === "/equipment" && !pathname.includes("category=")
									}
									className={menuBtnClass(
										pathname === "/equipment" &&
											!pathname.includes("category="),
										isCollapsed
									)}
									tooltip={isCollapsed ? "Вся техника" : ""}
								>
									<Link href="/equipment">
										<div
											className={cn(
												"flex items-center justify-center shrink-0",
												isCollapsed ? "w-full relative" : "w-6"
											)}
										>
											<RenderIcon
												icon={SquaresFourIcon}
												isActive={
													pathname === "/equipment" &&
													!pathname.includes("category=")
												}
											/>
										</div>
										{!isCollapsed && (
											<span className="font-medium text-base truncate ml-3 flex-1 text-left">
												Вся техника
											</span>
										)}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							{/* ── Категории из БД ── */}
							{isMobile
								? categories.map((cat) => (
										<MobileCategoryItem
											key={cat.id}
											category={cat}
											pathname={pathname}
										/>
									))
								: categories.map((cat) => (
										<CategoryNavItem
											key={cat.id}
											category={cat}
											isCollapsed={isCollapsed}
											isMobile={isMobile}
											pathname={pathname}
										/>
									))}
						</SidebarMenu>
					</SidebarGroup>
				)}

				{/* ── Меню администратора ── */}
				{isAdmin && showAdminNav && (
					<SidebarGroup className={cn("mt-4", isCollapsed && "mt-12")}>
						<SidebarGroupLabel
							className={cn(
								"px-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 transition-opacity",
								isCollapsed
									? "opacity-0 h-0 mb-0 overflow-hidden"
									: "opacity-100"
							)}
						>
							Меню
						</SidebarGroupLabel>
						<SidebarMenu>
							{ADMIN_NAV.map((item) => {
								const isActive =
									item.href === "/admin"
										? pathname === "/admin"
										: pathname.startsWith(item.href);
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={menuBtnClass(isActive, isCollapsed)}
											tooltip={isCollapsed ? item.title : ""}
										>
											<Link href={item.href}>
												<div
													className={cn(
														"flex items-center justify-center shrink-0",
														isCollapsed ? "w-full relative" : "w-6"
													)}
												>
													<RenderIcon icon={item.icon} isActive={isActive} />
												</div>
												{!isCollapsed && (
													<span className="font-medium text-base truncate ml-3 flex-1 text-left">
														{item.title}
													</span>
												)}
												{item.badge && !isCollapsed && (
													<span className="ml-auto flex h-5 min-w-3 items-center justify-center rounded-full text-[10px] font-bold bg-primary-foreground/3 text-primary-accent/60 border border-primary-foreground/30 px-2 shadow-xs">
														{item.badge}
													</span>
												)}
												{item.badge && isCollapsed && (
													<span className="absolute top-2 right-2 h-2 w-2 p-0 rounded-full bg-primary" />
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroup>
				)}

				{/* ── Быстрые действия (только для admin) ── */}
				{isAdmin && (
					<SidebarGroup className={cn("mt-4", isCollapsed && "mt-2")}>
						<SidebarGroupLabel
							className={cn(
								"px-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 transition-opacity",
								isCollapsed
									? "opacity-0 h-0 mb-0 overflow-hidden"
									: "opacity-100"
							)}
						>
							Быстрые действия
						</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={pathname === "/admin/equipment/new"}
									className={menuBtnClass(
										pathname === "/admin/equipment/new",
										isCollapsed
									)}
									tooltip={isCollapsed ? "Добавить технику" : ""}
								>
									<Link href="/admin/equipment/new">
										<div
											className={cn(
												"flex items-center justify-center shrink-0",
												isCollapsed ? "w-full relative" : "w-6"
											)}
										>
											<RenderIcon
												icon={CubeIcon}
												isActive={pathname === "/admin/equipment/new"}
											/>
										</div>
										{!isCollapsed && (
											<span className="font-medium text-base truncate ml-3 flex-1 text-left">
												Добавить технику
											</span>
										)}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={() => setShowAdminNav(!showAdminNav)}
									isActive={false}
									className={cn(
										menuBtnClass(false, isCollapsed),
										"cursor-pointer"
									)}
									tooltip={
										isCollapsed ? (showAdminNav ? "На сайт" : "В админку") : ""
									}
								>
									<div
										className={cn(
											"flex items-center justify-center shrink-0",
											isCollapsed ? "w-full relative" : "w-6"
										)}
									>
										<RenderIcon
											icon={showAdminNav ? CaretDownIcon : CaretUpIcon}
											isActive={false}
										/>
									</div>
									{!isCollapsed && (
										<>
											<span className="font-medium text-base truncate ml-3 flex-1 text-left">
												{showAdminNav ? "На сайт" : "В админку"}
											</span>
											<ArrowsClockwiseIcon
												size={14}
												className="ml-auto opacity-50 transition-transform hover:rotate-180 duration-500"
											/>
										</>
									)}
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				)}
			</SidebarContent>
		</>
	);
}
