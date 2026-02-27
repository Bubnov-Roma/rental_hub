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
import { CLIENT_NAV } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { MobileSearch } from "./MobileSearch";

// ─── Inline UserMenu Dropdown ─────────────────────────────────────────────────

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
					className="fixed bottom-19 left-4 z-71 w-72 rounded-2xl bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-2xl overflow-hidden"
					style={{ marginBottom: "env(safe-area-inset-bottom)" }}
				>
					{/* User info header */}
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

					{/* Menu items */}
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

						{/* ThemeToggle переиспользуем */}
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

// ─── Nav Button ───────────────────────────────────────────────────────────────

function NavBtn({
	isActive,
	onClick,
	icon: Icon,
	label,
	children,
	className,
}: {
	isActive: boolean;
	onClick?: () => void;
	icon: React.ElementType;
	label: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative flex flex-col items-center justify-center h-full gap-1 transition-colors group",
				className
			)}
		>
			{isActive && (
				<span className="absolute inset-x-2 top-2 bottom-2 bg-primary/10 rounded-xl animate-in fade-in zoom-in-95" />
			)}
			<div className="relative">
				{children ?? (
					<Icon
						size={24}
						strokeWidth={isActive ? 2.5 : 2}
						className={cn(
							"relative z-10 transition-all duration-200",
							isActive
								? "text-primary scale-105"
								: "text-muted-foreground group-active:scale-90"
						)}
					/>
				)}
			</div>
			<span
				className={cn(
					"relative z-10 text-[10px] font-semibold tracking-wide transition-colors leading-none",
					isActive ? "text-primary" : "text-muted-foreground"
				)}
			>
				{label}
			</span>
		</button>
	);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function MobileNavBar() {
	const pathname = usePathname();
	const router = useRouter();
	const [searchOpen, setSearchOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const { user, profile, isLoading } = useAuth();
	const userBtnRef = useRef<HTMLButtonElement>(null);

	const avatarUrl = user?.user_metadata?.avatar_url;
	const name =
		profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0];

	// Берём из CLIENT_NAV только обычные и auth-элементы (не theme — он в UserMenu dropdown)
	// Для nav bar показываем: Главная, Каталог, Избранное, Календарь
	// special="theme" пропускаем — он есть в дропдауне юзер меню
	const navItems = CLIENT_NAV.filter(
		(item) => item.special !== "theme" && item.special !== "auth"
	);

	return (
		<>
			<MobileSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
			<MobileUserDropdown
				isOpen={userMenuOpen}
				onClose={() => setUserMenuOpen(false)}
				anchorRef={userBtnRef}
			/>

			<nav className="md:hidden fixed bottom-0 inset-x-0 z-50">
				<div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none z-[-1] bg-linear-to-t from-background/80 via-background/60 to-transparent" />

				<div className="mx-3 mb-2 flex items-center gap-2">
					{/* User button / Войти / Loading */}
					{!isLoading ? (
						user ? (
							<button
								ref={userBtnRef}
								type="button"
								onClick={() => setUserMenuOpen((v) => !v)}
								className="h-14 w-14 flex items-center justify-center rounded-2xl border border-foreground/20 bg-muted-foreground/10 backdrop-blur-2xl shadow-xl active:scale-95 transition-transform"
							>
								<div
									className={cn(
										"relative z-10 w-full h-full rounded-2xl overflow-hidden border transition-all duration-200",
										userMenuOpen
											? "border-primary scale-105"
											: "border-foreground/20"
									)}
								>
									{avatarUrl ? (
										<Image
											src={avatarUrl}
											alt={name ?? ""}
											width={64}
											height={64}
											className="object-cover w-full h-full"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center bg-primary/10 text-foreground text-md font-bold">
											{name?.charAt(0).toUpperCase()}
										</div>
									)}
								</div>
							</button>
						) : (
							<NavBtn
								isActive={false}
								icon={LogIn}
								label="Войти"
								className="h-14 w-14 flex items-center justify-center rounded-2xl border border-foreground/20 bg-muted-foreground/10 backdrop-blur-2xl shadow-xl active:scale-95 transition-transform"
								onClick={() => router.push("/auth?view=register")}
							/>
						)
					) : (
						<NavBtn
							isActive={false}
							icon={Loader2}
							label=""
							className="h-14 w-14 flex items-center justify-center rounded-2xl border border-foreground/20 bg-muted-foreground/10 backdrop-blur-2xl shadow-xl active:scale-95 transition-transform snap-center cursor-not-allowed animate-spin text-primary"
						/>
					)}

					{/* Main scrollable nav bar */}
					<div
						className="flex-1 flex items-center h-14 rounded-2xl border border-foreground/20 bg-muted-foreground/10 backdrop-blur-2xl shadow-xl overflow-x-auto no-scrollbar snap-x"
						style={{ marginBottom: "env(safe-area-inset-bottom)" }}
					>
						<div className="flex items-center px-2 min-w-full">
							{navItems.map(({ title, href, icon: Icon }) => {
								const isActive =
									href === "/" ? pathname === "/" : pathname.startsWith(href);
								return (
									<NavBtn
										key={href}
										isActive={isActive}
										icon={Icon}
										label={title}
										onClick={() => router.push(href)}
										className="min-w-18 snap-center"
									/>
								);
							})}
						</div>
					</div>

					{/* Search button */}
					<motion.button
						layoutId="search-box"
						type="button"
						onClick={() => setSearchOpen(true)}
						className="h-14 w-14 flex items-center justify-center rounded-2xl border border-foreground/20 bg-muted-foreground/10 backdrop-blur-2xl shadow-xl active:scale-95 transition-transform shrink-0"
						style={{ marginBottom: "env(safe-area-inset-bottom)" }}
					>
						<Search size={26} />
					</motion.button>
				</div>
			</nav>
		</>
	);
}
