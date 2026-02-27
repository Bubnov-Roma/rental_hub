"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowDown,
	ArrowUp,
	ChevronRight,
	LayoutGrid,
	type LucideIcon,
	Moon,
	Package,
	PanelLeft,
	RefreshCcw,
	Sun,
	SunMoon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { Logo } from "@/components/icons/Logo";
import {
	Button,
	Card,
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
import {
	ADMIN_NAV,
	CATEGORIES,
	CLIENT_NAV,
	GUEST_AUTH_ITEM,
	type NavItem,
} from "@/constants";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const menuBtnClass = (isActive: boolean, isCollapsed: boolean) =>
	cn(
		"h-14 rounded-xl transition-all duration-300 group/btn w-full relative",
		isCollapsed ? "justify-center px-0" : "pl-4",
		isActive
			? "bg-primary/5 text-foreground font-bold shadow-sm"
			: "text-muted-foreground/60 hover:bg-muted-foreground/5 hover:text-foreground/80"
	);

const mobileCatalogSubBtnClass = (isActive: boolean) =>
	cn(
		"h-14 rounded-xl transition-all duration-300 group/btn w-full relative pl-4",
		isActive
			? "bg-primary/5 text-foreground font-bold shadow-sm"
			: "text-muted-foreground/60 hover:bg-muted-foreground/5 hover:text-foreground/80"
	);

const RenderIcon = ({
	icon: Icon,
	isActive,
}: {
	icon: LucideIcon;
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
		strokeWidth={isActive ? 2.5 : 2}
	/>
);

// ─── Theme nav item — full-area clickable, same style as other items ─────────

function ThemeNavItem({
	title,
	isCollapsed,
}: {
	title: string;
	isCollapsed: boolean;
}) {
	// Cycle through: light → dark → system → light…
	const { theme, resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const cycle = () => {
		const next =
			theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
		setTheme(next);
		if (typeof navigator !== "undefined" && navigator.vibrate)
			navigator.vibrate(5);
	};

	// Icon: resolved theme for visual feedback; SunMoon before hydration or when system
	const isSystem = theme === "system";
	const ThemeIcon =
		!mounted || isSystem ? SunMoon : resolvedTheme === "dark" ? Moon : Sun;

	// Label suffix so user knows the current mode
	const suffix = !mounted
		? ""
		: theme === "dark"
			? " · Тёмная"
			: theme === "light"
				? " · Светлая"
				: " · Системная";

	return (
		<SidebarMenuItem key="theme">
			<SidebarMenuButton
				asChild={false}
				isActive={false}
				className={cn(menuBtnClass(false, isCollapsed), "cursor-pointer")}
				tooltip={isCollapsed ? title : ""}
				onClick={cycle}
			>
				{/* Identical structure to regular nav item */}
				<div
					className={cn(
						"flex items-center justify-center shrink-0",
						isCollapsed ? "w-full relative" : "w-6"
					)}
				>
					{/* Use exact same classes as RenderIcon */}
					<ThemeIcon
						className={cn(
							"duration-300 transition-all ease-out size-6!",
							"group-hover/btn:-translate-y-0.5 group-hover/btn:scale-110",
							"group-hover/btn:ease-[cubic-bezier(0.34,1.96,0.84,1)]",
							"group-active/btn:scale-90",
							"opacity-70 group-hover/btn:opacity-100 text-muted-foreground group-hover/btn:text-foreground"
						)}
						strokeWidth={2}
					/>
				</div>
				{!isCollapsed && (
					<span className="font-medium text-base truncate ml-3 flex-1 text-left">
						{title}
						{mounted && (
							<span className="text-xs text-muted-foreground/50 font-normal ml-1">
								{suffix}
							</span>
						)}
					</span>
				)}
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

// ─── Main client component ────────────────────────────────────────────────────

interface Props {
	isAdmin: boolean;
	isLoggedIn: boolean;
}

export function AppSidebarClient({ isAdmin, isLoggedIn }: Props) {
	const pathname = usePathname();
	const { state, isMobile, toggleSidebar } = useSidebar();
	const isCollapsed = state === "collapsed" && !isMobile;

	const [showAdminNav, setShowAdminNav] = useState(true);
	const [showCatalogHover, setShowCatalogHover] = useState(false);

	const debouncedHide = useDebounceCallback(
		() => setShowCatalogHover(false),
		300
	);
	const handleMouseEnter = () => {
		debouncedHide.cancel();
		setShowCatalogHover(true);
	};

	// ── Resolve nav items ──────────────────────────────────────────────────────
	// CLIENT_NAV используется для всех — специальные элементы (theme/auth) рендерятся отдельно
	const baseNav: NavItem[] = isAdmin
		? showAdminNav
			? ADMIN_NAV
			: CLIENT_NAV
		: CLIENT_NAV;

	// Фильтруем auth-элемент — он переехал в SidebarFooter (UserMenu)
	const navItems: NavItem[] = baseNav
		.filter((item) => item.special !== "theme")
		.map((item) =>
			item.special === "auth" && !isLoggedIn ? GUEST_AUTH_ITEM : item
		);

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
							<PanelLeft size={16} />
						</Button>
					)}
				</div>
			</SidebarHeader>

			{/* ── CONTENT ── */}
			<SidebarContent className="px-2 custom-scrollbar">
				<SidebarGroup className={cn("mt-4", isCollapsed && "mt-12")}>
					<SidebarGroupLabel
						className={cn(
							"px-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 transition-opacity",
							isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"
						)}
					>
						Меню
					</SidebarGroupLabel>

					<SidebarMenu>
						{navItems.map((item) => {
							const isActive =
								item.href === "/"
									? pathname === "/"
									: pathname.startsWith(item.href);
							const isCatalogItem = item.href === "/equipment";
							const isCatalogActive = pathname.startsWith("/equipment");

							// ── Special: theme toggle ──────────────────────────────────────
							if (item.special === "theme") {
								return (
									<ThemeNavItem
										key="theme"
										title={item.title}
										isCollapsed={isCollapsed}
									/>
								);
							}

							// ── Catalog item with expandable subcategories ─────────────────
							if (isCatalogItem) {
								// Collapsed desktop: hover flyout
								if (isCollapsed) {
									return (
										<fieldset
											key={item.href}
											className="relative duration-300 transition-all"
											onMouseLeave={debouncedHide}
											onMouseEnter={handleMouseEnter}
										>
											<SidebarMenuItem>
												<SidebarMenuButton
													asChild
													isActive={isCatalogActive}
													className={menuBtnClass(isCatalogActive, isCollapsed)}
												>
													<Link href={item.href}>
														<div className="flex items-center justify-center shrink-0 w-full relative">
															<RenderIcon
																icon={item.icon}
																isActive={isCatalogActive}
															/>
														</div>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>

											<AnimatePresence>
												{showCatalogHover && (
													<motion.div
														onMouseEnter={handleMouseEnter}
														initial={{ opacity: 0, x: -40, scale: 0.9 }}
														animate={{ opacity: 1, x: 0, scale: 1 }}
														exit={{
															opacity: 0,
															x: -10,
															scale: 0.9,
															transition: { duration: 0.3 },
														}}
														transition={{
															type: "spring",
															stiffness: 300,
															damping: 25,
														}}
														className="fixed left-20 top-16 w-72 border border-foreground/10 rounded-xl shadow-2xl z-40 bg-background/80 backdrop-blur-2xl"
														style={{ maxHeight: "calc(100vh - 5rem)" }}
													>
														<Card>
															<div className="p-4 border-b border-foreground/10">
																<h3 className="font-bold text-lg flex items-center gap-2">
																	<item.icon
																		size={20}
																		className="text-foreground"
																	/>
																	{item.title}
																</h3>
															</div>
															<div
																className="p-2 overflow-y-auto custom-scrollbar"
																style={{ maxHeight: "calc(100vh - 10rem)" }}
															>
																<Link
																	href="/equipment"
																	className={cn(
																		"flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1",
																		pathname === "/equipment" &&
																			!pathname.includes("category=")
																			? "bg-muted-foreground/20 text-foreground font-semibold"
																			: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																	)}
																>
																	<LayoutGrid size={16} />
																	<span className="text-sm font-medium">
																		Вся техника
																	</span>
																</Link>
																{CATEGORIES.filter((c) => c.id !== "all").map(
																	(category) => {
																		const q = `category=${category.slug}`;
																		const inPath = pathname.includes(q);
																		const catActive =
																			inPath &&
																			!pathname.includes("subcategory=");
																		const hasSub =
																			(category.subcategories?.length ?? 0) > 0;

																		if (hasSub) {
																			return (
																				<Collapsible
																					key={category.id}
																					defaultOpen={inPath}
																					className="group/cat"
																				>
																					<div className="mb-1">
																						<CollapsibleTrigger
																							className={cn(
																								"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors w-full text-left hover:bg-foreground/10",
																								inPath
																									? "text-foreground"
																									: "text-muted-foreground hover:text-foreground"
																							)}
																						>
																							<category.icon size={16} />
																							<span className="text-sm font-medium flex-1">
																								{category.name}
																							</span>
																							<ChevronRight
																								size={14}
																								className="transition-transform duration-300 group-data-[state=open]/cat:rotate-90 text-muted-foreground/50"
																							/>
																						</CollapsibleTrigger>
																						<CollapsibleContent className="mt-1">
																							<div className="ml-6 space-y-0.5 border-l border-foreground/10 pl-3">
																								<Link
																									href={`/equipment?category=${category.slug}`}
																									className={cn(
																										"flex items-center px-2 py-1.5 rounded-lg transition-colors text-xs",
																										catActive
																											? "bg-primary/10 text-primary font-semibold"
																											: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																									)}
																								>
																									Все позиции
																								</Link>
																								{category.subcategories?.map(
																									(sub) => {
																										const subActive =
																											pathname.includes(
																												`subcategory=${sub.slug}`
																											);
																										return (
																											<Link
																												key={sub.id}
																												href={`/equipment?category=${category.slug}&subcategory=${sub.slug}`}
																												className={cn(
																													"flex items-center px-2 py-1.5 rounded-lg transition-colors text-xs",
																													subActive
																														? "bg-primary/10 text-primary font-semibold"
																														: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																												)}
																											>
																												{sub.name}
																											</Link>
																										);
																									}
																								)}
																							</div>
																						</CollapsibleContent>
																					</div>
																				</Collapsible>
																			);
																		}
																		return (
																			<Link
																				key={category.id}
																				href={`/equipment?category=${category.slug}`}
																				className={cn(
																					"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-1",
																					catActive
																						? "bg-primary/10 text-primary font-semibold"
																						: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																				)}
																			>
																				<category.icon size={16} />
																				<span className="text-sm font-medium">
																					{category.name}
																				</span>
																			</Link>
																		);
																	}
																)}
															</div>
														</Card>
													</motion.div>
												)}
											</AnimatePresence>
										</fieldset>
									);
								}

								// Desktop expanded: collapsible submenu
								if (!isMobile) {
									return (
										<Collapsible
											key={item.href}
											asChild
											defaultOpen={isCatalogActive}
											className="group/collapsible"
										>
											<SidebarMenuItem>
												<CollapsibleTrigger asChild>
													<SidebarMenuButton
														isActive={isCatalogActive}
														className={menuBtnClass(
															isCatalogActive,
															isCollapsed
														)}
														tooltip={isCollapsed ? item.title : ""}
													>
														<div
															className={cn(
																"flex items-center justify-center shrink-0",
																isCollapsed ? "w-full relative" : "w-6"
															)}
														>
															<RenderIcon
																icon={item.icon}
																isActive={isCatalogActive}
															/>
														</div>
														{!isCollapsed && (
															<>
																<span className="font-medium text-base truncate ml-3 flex-1 text-left">
																	{item.title}
																</span>
																<ChevronRight className="ml-auto shrink-0 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground/50" />
															</>
														)}
													</SidebarMenuButton>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub className="mr-0 pr-0 mt-2">
														<SidebarMenuSubItem>
															<SidebarMenuSubButton
																asChild
																isActive={
																	pathname === "/equipment" &&
																	!pathname.includes("category=")
																}
																className="h-10 rounded-xl pl-4 text-sm"
															>
																<Link href="/equipment">
																	<LayoutGrid size={14} className="shrink-0" />
																	<span>Вся техника</span>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
														{CATEGORIES.filter((c) => c.id !== "all").map(
															(category) => {
																const q = `category=${category.slug}`;
																const inPath = pathname.includes(q);
																const catActive =
																	inPath && !pathname.includes("subcategory=");
																const hasSub =
																	(category.subcategories?.length ?? 0) > 0;

																if (hasSub) {
																	return (
																		<Collapsible
																			key={category.id}
																			asChild
																			defaultOpen={inPath}
																			className="group/subcollapsible"
																		>
																			<SidebarMenuSubItem>
																				<CollapsibleTrigger asChild>
																					<SidebarMenuSubButton
																						isActive={false}
																						className={cn(
																							"h-10 rounded-xl pl-4 text-sm cursor-pointer transition-colors",
																							inPath
																								? "text-foreground hover:bg-foreground/10"
																								: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																						)}
																					>
																						<category.icon
																							size={14}
																							className="shrink-0"
																						/>
																						<span className="flex-1 text-left">
																							{category.name}
																						</span>
																						<ChevronRight
																							size={13}
																							className="ml-auto shrink-0 transition-transform duration-300 group-data-[state=open]/subcollapsible:rotate-90 text-muted-foreground/50"
																						/>
																					</SidebarMenuSubButton>
																				</CollapsibleTrigger>
																				<CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
																					<SidebarMenuSub className="mr-0 pr-0 border-l border-foreground/10 ml-4 mt-1">
																						<SidebarMenuSubItem>
																							<SidebarMenuSubButton
																								asChild
																								isActive={catActive}
																								className={cn(
																									"h-9 rounded-xl pl-3 text-xs transition-colors",
																									catActive
																										? "bg-primary/10 text-primary font-semibold"
																										: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																								)}
																							>
																								<Link
																									href={`/equipment?category=${category.slug}`}
																								>
																									<span>Все позиции</span>
																								</Link>
																							</SidebarMenuSubButton>
																						</SidebarMenuSubItem>
																						{category.subcategories?.map(
																							(sub) => {
																								const subActive =
																									pathname.includes(
																										`subcategory=${sub.slug}`
																									);
																								return (
																									<SidebarMenuSubItem
																										key={sub.id}
																									>
																										<SidebarMenuSubButton
																											asChild
																											isActive={subActive}
																											className={cn(
																												"h-9 rounded-xl pl-3 text-xs transition-colors",
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
																							}
																						)}
																					</SidebarMenuSub>
																				</CollapsibleContent>
																			</SidebarMenuSubItem>
																		</Collapsible>
																	);
																}
																return (
																	<SidebarMenuSubItem key={category.id}>
																		<SidebarMenuSubButton
																			asChild
																			isActive={catActive}
																			className={cn(
																				"h-10 rounded-xl pl-4 text-sm transition-colors",
																				catActive
																					? "bg-primary/10 text-primary font-semibold"
																					: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																			)}
																		>
																			<Link
																				href={`/equipment?category=${category.slug}`}
																			>
																				<category.icon
																					size={14}
																					className="shrink-0"
																				/>
																				<span>{category.name}</span>
																			</Link>
																		</SidebarMenuSubButton>
																	</SidebarMenuSubItem>
																);
															}
														)}
													</SidebarMenuSub>
												</CollapsibleContent>
											</SidebarMenuItem>
										</Collapsible>
									);
								}

								// Mobile: full-size collapsible
								return (
									<Collapsible
										key={item.href}
										asChild
										defaultOpen={isCatalogActive}
										className="group/collapsible"
									>
										<SidebarMenuItem>
											<CollapsibleTrigger asChild>
												<SidebarMenuButton
													isActive={isCatalogActive}
													className={menuBtnClass(isCatalogActive, false)}
												>
													<div className="flex items-center justify-center shrink-0 w-6">
														<RenderIcon
															icon={item.icon}
															isActive={isCatalogActive}
														/>
													</div>
													<span className="font-medium text-base truncate ml-3 flex-1 text-left">
														{item.title}
													</span>
													<ChevronRight className="ml-auto shrink-0 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground/50" />
												</SidebarMenuButton>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<div className="mt-1 ml-2 space-y-0.5">
													<Link
														href="/equipment"
														className={mobileCatalogSubBtnClass(
															pathname === "/equipment" &&
																!pathname.includes("category=")
														)}
													>
														<div className="flex items-center h-full pl-4 gap-3">
															<LayoutGrid
																size={20}
																className="shrink-0 opacity-70"
															/>
															<span className="font-medium text-base">
																Вся техника
															</span>
														</div>
													</Link>
													{CATEGORIES.filter((c) => c.id !== "all").map(
														(category) => {
															const q = `category=${category.slug}`;
															const inPath = pathname.includes(q);
															const catActive =
																inPath && !pathname.includes("subcategory=");
															const hasSub =
																(category.subcategories?.length ?? 0) > 0;

															if (hasSub) {
																return (
																	<Collapsible
																		key={category.id}
																		defaultOpen={inPath}
																		className="group/subcat"
																	>
																		<CollapsibleTrigger asChild>
																			<button
																				type="button"
																				className={cn(
																					mobileCatalogSubBtnClass(inPath),
																					"w-full text-left"
																				)}
																			>
																				<div className="flex items-center h-full pl-4 gap-3">
																					<category.icon
																						size={20}
																						className="shrink-0 opacity-70"
																					/>
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
																						catActive
																							? "bg-primary/10 text-primary font-bold"
																							: "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
																					)}
																				>
																					<span className="font-medium text-base">
																						Все позиции
																					</span>
																				</Link>
																				{category.subcategories?.map((sub) => {
																					const subActive = pathname.includes(
																						`subcategory=${sub.slug}`
																					);
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
																							<span className="font-medium text-base">
																								{sub.name}
																							</span>
																						</Link>
																					);
																				})}
																			</div>
																		</CollapsibleContent>
																	</Collapsible>
																);
															}
															return (
																<Link
																	key={category.id}
																	href={`/equipment?category=${category.slug}`}
																	className={mobileCatalogSubBtnClass(
																		catActive
																	)}
																>
																	<div className="flex items-center h-full pl-4 gap-3">
																		<category.icon
																			size={20}
																			className="shrink-0 opacity-70"
																		/>
																		<span className="font-medium text-base">
																			{category.name}
																		</span>
																	</div>
																</Link>
															);
														}
													)}
												</div>
											</CollapsibleContent>
										</SidebarMenuItem>
									</Collapsible>
								);
							}

							// ── Regular nav item ───────────────────────────────────────────
							return (
								<SidebarMenuItem key={`${item.href}-${item.special ?? ""}`}>
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
											{item.badge && (
												<span
													className={cn(
														"flex h-5 min-w-3 items-center justify-center rounded-full text-[10px] font-bold transition-all",
														!isCollapsed
															? "ml-auto bg-primary-foreground/3 group-hover/btn:bg-primary text-primary-accent/60 group-hover/btn:text-primary-foreground border border-primary-foreground/30 px-2 shadow-xs"
															: "absolute top-2 right-2 h-2 w-2 p-0 bg-primary text-transparent"
													)}
												>
													{!isCollapsed && item.badge}
												</span>
											)}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>

				{/* Quick actions for admin */}
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
												icon={Package}
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
											icon={showAdminNav ? ArrowDown : ArrowUp}
											isActive={false}
										/>
									</div>
									{!isCollapsed && (
										<>
											<span className="font-medium text-base truncate ml-3 flex-1 text-left">
												{showAdminNav ? "На сайт" : "В админку"}
											</span>
											<RefreshCcw
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
