"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowDown,
	ArrowUp,
	ChevronRight,
	LayoutGrid,
	type LucideIcon,
	Package,
	PanelLeft,
	RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { Logo } from "@/components/icons/Logo";
import {
	Button,
	Card,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	Skeleton,
} from "@/components/ui";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { ADMIN_NAV, CLIENT_NAV, GUEST_NAV } from "@/constants";
import { CATEGORIES } from "@/constants/categories";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

const menuBtnClass = (isActive: boolean, isCollapsed: boolean) =>
	cn(
		"h-14 rounded-xl transition-all duration-300 group/btn w-full relative",
		isCollapsed ? "justify-center px-0" : "pl-4",
		isActive
			? "bg-primary/1 text-primary font-bold shadow-sm"
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
			"group-hover/btn:-translate-y-0.5",
			"group-hover/btn:scale-110",
			"group-hover/btn:ease-[cubic-bezier(0.34,1.96,0.84,1)]",
			"group-active/btn:scale-90",
			isActive
				? "text-primary opacity-100"
				: "opacity-70 group-hover/btn:opacity-100 text-muted-foreground group-hover/btn:text-foreground"
		)}
		strokeWidth={isActive ? 2.5 : 2}
	/>
);

type NavItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	badge?: string | number;
};

export function AppSidebar() {
	const pathname = usePathname();
	const { state, isMobile, toggleSidebar } = useSidebar();
	const { profile, user, isLoading } = useAuth();
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

	let navItems: NavItem[] = GUEST_NAV;
	let isAdmin = false;

	if (user && profile) {
		isAdmin = profile.role === "admin" || profile.role === "manager";
		navItems = isAdmin
			? showAdminNav
				? ADMIN_NAV
				: CLIENT_NAV
			: (CLIENT_NAV as NavItem[]);
	}

	const NavSkeleton = () => (
		<div className="space-y-2 p-2">
			{[...Array(8)].map((k, i) => (
				<Skeleton
					key={`${k}` + `${i}`}
					className="h-14 w-full rounded-lg bg-background shadow-sm"
				/>
			))}
		</div>
	);

	return (
		<Sidebar
			collapsible="icon"
			className="border-r-0 bg-background/60 backdrop-blur-2xl"
		>
			{/* HEADER */}
			<SidebarHeader
				className={cn(
					"h-16 flex items-center justify-between relative",
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
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
								<Logo className="h-6 w-auto text-white shadow-lg shadow-primary/20" />
							</div>
						) : (
							<>
								<div className="transition-all duration-500 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
									<Logo className="h-6 w-auto text-white shadow-lg shadow-primary/20" />
								</div>
								<span className="font-black tracking-tighter text-xl truncate">
									LINZA
								</span>
							</>
						)}
					</Link>
					{/* Кнопка toggle ВЫНЕСЕНА за пределы Link — иначе клик вызывал навигацию на / */}
					{!isCollapsed && (
						<Button
							variant="ghost"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								toggleSidebar();
							}}
							className="ml-auto hidden md:flex h-8 w-8 shrink-0 rounded-lg text-primary transition-all duration-300 hover:scale-110"
						>
							<PanelLeft size={16} className="transition-transform" />
						</Button>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent className="px-2 custom-scrollbar">
				{/* MAIN MENU */}
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
						{isLoading ? (
							<NavSkeleton />
						) : (
							navItems.map((item) => {
								const isActive = pathname === item.href;
								const isCatalogItem = item.href === "/equipment";
								const isCatalogActive = pathname.startsWith("/equipment");

								if (isCatalogItem) {
									//**  --- CATALOG: Hover menu in collapsed mode --- */
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
														className={menuBtnClass(
															isCatalogActive,
															isCollapsed
														)}
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

												{/* Hover Menu - renders UNDER sidebar (z-40) */}
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
																			className="text-primary"
																		/>
																		{item.title}
																	</h3>
																</div>
																<div
																	className="p-2 overflow-y-auto custom-scrollbar"
																	style={{
																		maxHeight: "calc(100vh - 10rem)",
																	}}
																>
																	{/* "Вся техника" link */}
																	<Link
																		href="/equipment"
																		className={cn(
																			"flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1",
																			pathname === "/equipment" &&
																				!pathname.includes("category=")
																				? "bg-primary/10 text-primary font-semibold"
																				: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																		)}
																	>
																		<LayoutGrid size={16} />
																		<span className="text-sm font-medium">
																			Вся техника
																		</span>
																	</Link>

																	{/* Categories with collapsible subcategories */}
																	{CATEGORIES.filter((c) => c.id !== "all").map(
																		(category) => {
																			const categoryQuery = `category=${category.slug}`;
																			const isCatInPath =
																				pathname.includes(categoryQuery);
																			const hasSubcategoryInPath =
																				pathname.includes("subcategory=");
																			const isCatActive =
																				isCatInPath && !hasSubcategoryInPath;

																			const hasSub =
																				category.subcategories &&
																				category.subcategories.length > 0;

																			if (hasSub) {
																				return (
																					<Collapsible
																						key={category.id}
																						defaultOpen={isCatInPath}
																						className="group/cat"
																					>
																						<div className="mb-1">
																							<CollapsibleTrigger
																								className={cn(
																									"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors w-full text-left hover:bg-foreground/10",
																									isCatInPath
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
																									{/* "Все позиции" */}
																									<Link
																										href={`/equipment?category=${category.slug}`}
																										className={cn(
																											"flex items-center px-2 py-1.5 rounded-lg transition-colors text-xs",
																											isCatActive
																												? "bg-primary/10 text-primary font-semibold"
																												: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																										)}
																									>
																										Все позиции
																									</Link>

																									{/* Subcategories */}
																									{category.subcategories.map(
																										(sub) => {
																											const isSubActive =
																												pathname.includes(
																													`subcategory=${sub.slug}`
																												);
																											return (
																												<Link
																													key={sub.id}
																													href={`/equipment?category=${category.slug}&subcategory=${sub.slug}`}
																													className={cn(
																														"flex items-center px-2 py-1.5 rounded-lg transition-colors text-xs",
																														isSubActive
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

																			// Category without subcategories
																			return (
																				<Link
																					key={category.id}
																					href={`/equipment?category=${category.slug}`}
																					className={cn(
																						"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-1",
																						isCatActive
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

									//** --- CATALOG: Expanded mode (collapsible) --- */
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
																className={cn(
																	"h-10 rounded-xl pl-4 text-sm font-medium transition-colors",
																	pathname === "/equipment" &&
																		!pathname.includes("category=")
																		? "bg-primary/10 text-primary"
																		: "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
																)}
															>
																<Link href="/equipment">
																	<LayoutGrid size={14} className="shrink-0" />
																	<span>Вся техника</span>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>

														{/* Categories */}
														{CATEGORIES.filter((c) => c.id !== "all").map(
															(category) => {
																const categoryQuery = `category=${category.slug}`;
																const isCatInPath =
																	pathname.includes(categoryQuery);
																const hasSubcategoryInPath =
																	pathname.includes("subcategory=");
																const isCatActive =
																	isCatInPath && !hasSubcategoryInPath;

																const hasSub =
																	category.subcategories &&
																	category.subcategories.length > 0;

																if (hasSub) {
																	return (
																		<Collapsible
																			key={category.id}
																			asChild
																			defaultOpen={isCatInPath}
																			className="group/subcollapsible"
																		>
																			<SidebarMenuSubItem>
																				<CollapsibleTrigger asChild>
																					<SidebarMenuSubButton
																						isActive={false}
																						className={cn(
																							"h-10 rounded-xl pl-4 text-sm cursor-pointer transition-colors",
																							isCatInPath
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
																							className="ml-auto shrink-0 transition-transform duration-300 ease-in-out group-data-[state=open]/subcollapsible:rotate-90 text-muted-foreground/50"
																						/>
																					</SidebarMenuSubButton>
																				</CollapsibleTrigger>

																				<CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
																					<SidebarMenuSub className="mr-0 pr-0 border-l border-foreground/10 ml-4 mt-1">
																						{/* "Все позиции" link */}
																						<SidebarMenuSubItem>
																							<SidebarMenuSubButton
																								asChild
																								isActive={isCatActive}
																								className={cn(
																									"h-9 rounded-xl pl-3 text-xs transition-colors",
																									isCatActive
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

																						{/* Subcategories */}
																						{category.subcategories.map(
																							(sub) => {
																								const isSubActive =
																									pathname.includes(
																										`subcategory=${sub.slug}`
																									);

																								return (
																									<SidebarMenuSubItem
																										key={sub.id}
																									>
																										<SidebarMenuSubButton
																											asChild
																											isActive={isSubActive}
																											className={cn(
																												"h-9 rounded-xl pl-3 text-xs transition-colors",
																												isSubActive
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

																// Category without subcategories
																return (
																	<SidebarMenuSubItem key={category.id}>
																		<SidebarMenuSubButton
																			asChild
																			isActive={isCatActive}
																			className={cn(
																				"h-10 rounded-xl pl-4 text-sm transition-colors",
																				isCatActive
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

								//** --- REGULAR MENU ITEM --- */
								return (
									<SidebarMenuItem key={item.href}>
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
																? "ml-auto bg-primary/10 text-primary px-2"
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
							})
						)}
					</SidebarMenu>
				</SidebarGroup>

				{/* QUICK ACTIONS FOR ADMIN */}
				{isAdmin && !isLoading && (
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

							{/* Admin/Client Mode Toggle */}
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
											icon={showAdminNav ? ArrowUp : ArrowDown}
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

			<SidebarFooter className="p-4">
				<UserMenu />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
