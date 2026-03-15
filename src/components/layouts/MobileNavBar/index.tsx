"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Heart,
	LayoutDashboard,
	Loader2,
	LogIn,
	Package,
	Search,
	User as UserIcon,
	X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/layouts/ThemeToggle";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { type DbCategory, MOBILE_NAV } from "@/constants/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { MobileSearch, type MobileSearchHandle } from "./MobileSearch";

// ─── Inline User Dropdown ─────────────────────────────────────────────────────

function MobileUserDropdown({
	isOpen,
	onClose,
	anchorRef,
}: {
	isOpen: boolean;
	onClose: () => void;
	anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
	const { user, profile } = useAuth();
	const router = useRouter();
	const [isOnline, setIsOnline] = useState(true);
	const dropRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsOnline(navigator.onLine);
		const on = () => setIsOnline(true);
		const off = () => setIsOnline(false);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const handler = (e: MouseEvent | TouchEvent) => {
			if (
				dropRef.current &&
				!dropRef.current.contains(e.target as Node) &&
				anchorRef.current &&
				!anchorRef.current.contains(e.target as Node)
			)
				onClose();
		};
		document.addEventListener("mousedown", handler);
		document.addEventListener("touchstart", handler);
		return () => {
			document.removeEventListener("mousedown", handler);
			document.removeEventListener("touchstart", handler);
		};
	}, [isOpen, onClose, anchorRef]);

	if (!user) return null;

	const name =
		profile?.name || user?.user_metadata?.name || user.email?.split("@")[0];
	const avatarUrl = user.user_metadata?.avatar_url;
	const isAdmin = profile?.role === "admin" || profile?.role === "manager";

	const navigate = (href: string) => {
		router.push(href);
		onClose();
	};

	const MenuItem = ({
		icon: Icon,
		label,
		onClick,
	}: {
		icon: React.ElementType;
		label: string;
		onClick: () => void;
	}) => (
		<button
			type="button"
			onClick={onClick}
			className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 transition-colors text-sm font-medium text-left rounded-xl"
		>
			<Icon size={18} className="text-muted-foreground shrink-0" />
			<span>{label}</span>
		</button>
	);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					ref={dropRef}
					initial={{ opacity: 0, y: 12, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 12, scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					// Позиционируем над панелью навигации
					className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.5rem)] left-4 z-71 w-72 rounded-2xl bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-2xl overflow-hidden"
				>
					{/* User info */}
					<div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5">
						<div className="relative shrink-0">
							<div className="h-10 w-10 rounded-xl overflow-hidden bg-foreground/10">
								{avatarUrl ? (
									<Image
										src={avatarUrl}
										alt={name ?? ""}
										width={40}
										height={40}
										className="object-cover"
									/>
								) : (
									<div
										className={cn(
											"flex h-full w-full items-center justify-center font-bold text-base",
											isOnline
												? "bg-primary text-primary-foreground"
												: "bg-yellow-500 text-white"
										)}
									>
										{name?.charAt(0).toUpperCase()}
									</div>
								)}
							</div>
							<div
								className={cn(
									"absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background",
									isOnline ? "bg-green-500" : "bg-yellow-500"
								)}
							/>
						</div>
						<div className="flex-1 min-w-0">
							<div className="font-semibold text-sm truncate">{name}</div>
							<div className="flex items-center gap-1.5 mt-0.5">
								<div
									className={cn(
										"h-1.5 w-1.5 rounded-full",
										isOnline ? "bg-green-500" : "bg-yellow-500"
									)}
								/>
								<span className="text-xs text-muted-foreground">
									{isOnline ? "Онлайн" : "Офлайн"}
								</span>
								{isAdmin && (
									<span className="ml-1 px-1.5 py-0 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
										Admin
									</span>
								)}
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="p-1.5 hover:bg-foreground/10 rounded-lg transition-colors"
						>
							<X size={14} className="text-muted-foreground" />
						</button>
					</div>

					<div className="p-2">
						<MenuItem
							icon={LayoutDashboard}
							label="Дашборд"
							onClick={() => navigate("/dashboard")}
						/>
						<MenuItem
							icon={Package}
							label="Бронирования"
							onClick={() => navigate("/dashboard/bookings")}
						/>
						<MenuItem
							icon={Heart}
							label="Избранное"
							onClick={() => navigate("/favorites")}
						/>
						<MenuItem
							icon={UserIcon}
							label="Профиль"
							onClick={() => navigate("/dashboard/profile")}
						/>
						<div className="px-4 py-1 hover:bg-foreground/5 rounded-xl">
							<ThemeToggle className="w-full py-2" />
						</div>
						{isAdmin && (
							<>
								<div className="h-px bg-foreground/5 my-1" />
								<button
									type="button"
									onClick={() => {
										window.open("/?client=true", "_blank");
										onClose();
									}}
									className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 transition-colors rounded-xl"
								>
									<UserIcon
										size={18}
										className="text-muted-foreground shrink-0"
									/>
									<span className="text-sm font-medium">Открыть сайт</span>
								</button>
							</>
						)}
						<div className="h-px bg-foreground/5 my-1" />
						<div className="px-2">
							<SignOutButton className="w-full h-9 text-sm rounded-xl" />
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ─── TabBtn — базовая кнопка таба ────────────────────────────────────────────

function TabBtn({
	isActive,
	onClick,
	icon: Icon,
	label,
	children,
	className,
}: {
	isActive: boolean;
	onClick?: () => void;
	icon?: React.ElementType;
	label: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative flex flex-col items-center justify-center gap-0.5 transition-colors group shrink-0",
				className
			)}
		>
			{isActive && (
				<span className="absolute inset-x-1 top-1 bottom-1 bg-primary/10 rounded-xl" />
			)}
			<div className="relative z-10">
				{children ??
					(Icon && (
						<Icon
							size={24}
							strokeWidth={isActive ? 2.5 : 2}
							className={cn(
								"transition-all duration-200",
								isActive
									? "text-primary scale-105"
									: "text-muted-foreground group-active:scale-90"
							)}
						/>
					))}
			</div>
			<span
				className={cn(
					"relative z-10 text-[9px] font-semibold tracking-wide transition-colors leading-none",
					isActive ? "text-primary" : "text-muted-foreground"
				)}
			>
				{label}
			</span>
		</button>
	);
}

// ─── MobileNavBar ─────────────────────────────────────────────────────────────

interface MobileNavBarProps {
	categories: DbCategory[];
}

export function MobileNavBar({ categories }: MobileNavBarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [searchOpen, setSearchOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);

	const [mounted, setMounted] = useState(false);

	const searchRef = useRef<MobileSearchHandle>(null);
	const { user, profile, isLoading } = useAuth();
	const userBtnRef = useRef<HTMLButtonElement>(null);

	const avatarUrl = user?.user_metadata?.avatar_url;
	const name =
		profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0];

	useEffect(() => {
		setMounted(true);
		setSearchOpen(false);
	}, []);

	return (
		<>
			{/* MobileSearch — выезжает сверху */}
			<MobileSearch
				ref={searchRef}
				isOpen={searchOpen}
				onClose={() => setSearchOpen(false)}
				categories={categories}
			/>

			{/* Дропдаун пользователя */}
			<MobileUserDropdown
				isOpen={userMenuOpen}
				onClose={() => setUserMenuOpen(false)}
				anchorRef={userBtnRef}
			/>

			{/* ── Таб-панель ── */}
			<nav className="md:hidden fixed bottom-0 inset-x-0 z-50">
				<div
					className="flex items-stretch mx-0 border-t border-foreground/8 bg-background/55 backdrop-blur-2xl"
					style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
				>
					{/* ── Закреплённый левый элемент: User / Войти / Loading ── */}
					<div className="shrink-0 w-14 flex items-center justify-center border-r border-foreground/5">
						{!mounted || isLoading ? (
							<Loader2 size={20} className="animate-spin text-primary" />
						) : user ? (
							<button
								ref={userBtnRef}
								type="button"
								onClick={() => setUserMenuOpen((v) => !v)}
								className="relative w-9 h-9 rounded-xl overflow-hidden border transition-all active:scale-90"
								style={{
									borderColor: userMenuOpen
										? "hsl(var(--primary) / 0.7)"
										: "hsl(var(--foreground) / 0.12)",
								}}
							>
								{avatarUrl ? (
									<Image
										src={avatarUrl}
										alt={name ?? ""}
										width={36}
										height={36}
										className="object-cover w-full h-full"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-primary/10 text-foreground text-sm font-bold">
										{name?.charAt(0).toUpperCase()}
									</div>
								)}
								{/* Online dot */}
								<span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
							</button>
						) : (
							<button
								type="button"
								onClick={() => router.push("/auth?view=register")}
								className="flex flex-col items-center gap-1 group"
							>
								<LogIn
									size={22}
									strokeWidth={2}
									className="text-muted-foreground group-active:scale-90 transition-transform"
								/>
								<span className="text-[9px] font-semibold text-muted-foreground leading-none">
									Войти
								</span>
							</button>
						)}
					</div>

					{/* ── Прокручиваемые пункты навигации ── */}
					<div className="flex-1 flex items-center h-14 overflow-x-auto no-scrollbar snap-x snap-mandatory">
						<div className="flex items-stretch h-full px-1 gap-1 min-w-full">
							{MOBILE_NAV.map((item) => {
								const { href, title, icon: Icon } = item;
								const isActive =
									href === "/" ? pathname === "/" : pathname.startsWith(href);
								return (
									<TabBtn
										key={href}
										isActive={isActive}
										icon={Icon}
										label={title}
										onClick={() => router.push(href)}
										className="min-w-15 h-full snap-center px-1"
									/>
								);
							})}
						</div>
					</div>

					<div className="shrink-0 w-14 flex items-center justify-center border-l border-foreground/5">
						<button
							type="button"
							onClick={() => {
								const nextState = !searchOpen;
								setSearchOpen(nextState);

								if (nextState) {
									searchRef.current?.focus();
								}
							}}
							className="flex flex-col h-full items-center justify-center gap-1 group active:scale-90 transition-transform"
							aria-label={searchOpen ? "Закрыть поиск" : "Открыть поиск"}
						>
							{/* Анимация: Search ↔ X через AnimatePresence */}
							<div className="relative w-5.5 h-5.5">
								<AnimatePresence mode="wait" initial={false}>
									{searchOpen ? (
										<motion.div
											key="close"
											initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
											animate={{ opacity: 1, rotate: 0, scale: 1 }}
											exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
											transition={{ duration: 0.15, ease: "easeOut" }}
											className="absolute inset-0 flex items-center justify-center"
										>
											<X size={24} strokeWidth={2.5} className="text-primary" />
										</motion.div>
									) : (
										<motion.div
											key="search"
											initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
											animate={{ opacity: 1, rotate: 0, scale: 1 }}
											exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
											transition={{ duration: 0.15, ease: "easeOut" }}
											className="absolute inset-0 flex items-center justify-center"
										>
											<Search
												size={24}
												strokeWidth={2}
												className="text-muted-foreground"
											/>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
							<span
								className={cn(
									"text-[9px] font-semibold leading-none transition-colors",
									searchOpen ? "text-primary" : "text-muted-foreground"
								)}
							>
								{searchOpen ? "Закрыть" : "Поиск"}
							</span>
						</button>
					</div>
				</div>
			</nav>
		</>
	);
}
