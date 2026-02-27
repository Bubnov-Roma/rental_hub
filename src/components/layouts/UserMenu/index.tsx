"use client";

import {
	ArrowUpRightFromSquare,
	ChevronsUpDown,
	Circle,
	Heart,
	LayoutDashboard,
	LogIn,
	Moon,
	Package,
	Sun,
	User as UserIcon,
	WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/shared/SignOutButton";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function UserMenu() {
	const { user, profile, isLoading } = useAuth();
	const { theme, setTheme } = useTheme();
	const { state, isMobile } = useSidebar();
	const router = useRouter();
	const [isOnline, setIsOnline] = useState(true);

	const isCollapsed = state === "collapsed" && !isMobile;

	useEffect(() => {
		setIsOnline(navigator.onLine);
		const goOnline = () => setIsOnline(true);
		const goOffline = () => setIsOnline(false);
		window.addEventListener("online", goOnline);
		window.addEventListener("offline", goOffline);
		return () => {
			window.removeEventListener("online", goOnline);
			window.removeEventListener("offline", goOffline);
		};
	}, []);

	if (isLoading)
		return (
			<div className="h-12 w-full animate-pulse bg-foreground/5 rounded-xl" />
		);

	if (!user) {
		// Collapsed: icon-only button
		if (isCollapsed) {
			return (
				<button
					type="button"
					onClick={() => router.push("/auth?view=register")}
					title="Войти"
					className={cn(
						"h-12 w-12 flex items-center justify-center rounded-xl mx-auto",
						"bg-muted-foreground/10 text-foreground/80 hover:bg-primary hover:text-primary-foreground",
						"transition-all duration-200 active:scale-95"
					)}
				>
					<LogIn size={20} />
				</button>
			);
		}
		// Expanded: full-width button styled like nav items but in primary color
		return (
			<button
				type="button"
				onClick={() => router.push("/auth?view=register")}
				className={cn(
					"h-14 w-full flex items-center gap-3 rounded-xl px-4",
					"bg-muted-foreground/10 text-foreground/80 hover:bg-primary hover:text-primary-foreground",
					"transition-all duration-200 active:scale-95 group/auth"
				)}
			>
				<LogIn
					size={22}
					className="shrink-0 transition-transform duration-200 group-hover/auth:translate-x-0.5"
				/>
				<span className="font-bold text-base">Войти</span>
			</button>
		);
	}

	const name =
		profile?.name || user?.user_metadata?.name || user.email?.split("@")[0];
	const avatarUrl = user.user_metadata?.avatar_url;
	const isAdmin = profile?.role === "admin" || profile?.role === "manager";
	const isOffline = !isOnline;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={cn(
						"h-14 w-full justify-start gap-3 rounded-xl px-2 hover:bg-foreground/10 transition-all",
						isCollapsed && "h-12 w-12 justify-center px-0"
					)}
				>
					{/* Avatar with live indicator */}
					<div className="relative shrink-0">
						<div className="h-9 w-9 rounded-lg overflow-hidden border border-foreground/10 bg-foreground/5">
							{avatarUrl ? (
								<Image
									src={avatarUrl}
									alt={name ?? ""}
									width={36}
									height={36}
									className="object-cover"
								/>
							) : (
								<div
									className={cn(
										"flex h-full w-full items-center justify-center font-bold",
										isOffline
											? "bg-yellow-500 text-white"
											: "bg-primary text-primary-foreground"
									)}
								>
									{name?.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						{/* Online / offline dot */}
						<div
							className={cn(
								"absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background transition-colors",
								isOnline ? "bg-green-500" : "bg-yellow-500"
							)}
						/>
					</div>

					{!isCollapsed && (
						<>
							<div className="flex flex-col items-start flex-1 text-left min-w-0 leading-tight">
								<span className="text-sm font-semibold truncate w-full">
									{name}
								</span>
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
									{!isOnline && (
										<WifiOff size={9} className="text-yellow-500" />
									)}
								</div>
							</div>
							<ChevronsUpDown className="ml-auto size-4 text-muted-foreground/50" />
						</>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl bg-background/90 backdrop-blur-xl border-foreground/10 shadow-2xl pb-2"
				side={isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={8}
			>
				{/* Status header — compact, no duplicate name/email at bottom */}
				<DropdownMenuLabel className="pb-3">
					<div className="flex items-center gap-2.5">
						<div className="relative shrink-0">
							<div className="h-9 w-9 rounded-lg overflow-hidden bg-foreground/10">
								{avatarUrl ? (
									<Image
										src={avatarUrl}
										alt={name ?? ""}
										width={36}
										height={36}
										className="object-cover"
									/>
								) : (
									<div
										className={cn(
											"flex h-full w-full items-center justify-center font-bold text-sm",
											isOffline
												? "bg-yellow-500 text-white"
												: "bg-primary text-primary-foreground"
										)}
									>
										{name?.charAt(0).toUpperCase()}
									</div>
								)}
							</div>
							<div
								className={cn(
									"absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
									isOnline ? "bg-green-500" : "bg-yellow-500"
								)}
							/>
						</div>
						<div className="flex flex-col min-w-0">
							<div className="flex items-center gap-1.5">
								<p className="text-sm font-bold truncate max-w-32.5">{name}</p>
								{isAdmin && (
									<span className="px-1.5 py-0 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
										Admin
									</span>
								)}
							</div>
							<div className="flex items-center gap-1.5 mt-0.5">
								<div
									className={cn(
										"h-1.5 w-1.5 rounded-full",
										isOnline ? "bg-green-500" : "bg-yellow-500"
									)}
								/>
								<p className="text-[11px] text-muted-foreground">
									{isOnline ? "Онлайн" : "Офлайн · нет сети"}
								</p>
							</div>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => router.push("/dashboard")}>
						<LayoutDashboard className="mr-2 h-4 w-4" />
						<span>Дашборд</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/dashboard/bookings")}>
						<Package className="mr-2 h-4 w-4" />
						<span>Бронирования</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/favorites")}>
						<Heart className="mr-2 h-4 w-4" />
						<span>Избранное</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
						<UserIcon className="mr-2 h-4 w-4" />
						<span>Профиль</span>
					</DropdownMenuItem>

					{/* Theme toggle */}
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							setTheme(theme === "dark" ? "light" : "dark");
							if (navigator.vibrate) navigator.vibrate(5);
						}}
						className="flex items-center justify-between cursor-pointer"
					>
						<div className="flex items-center gap-2">
							<ThemeToggleIcon
								theme={theme ?? "system"}
								className="mr-2 h-4 w-4"
							/>
							<span>{theme === "dark" ? "Тёмная" : "Светлая"} тема</span>
						</div>
						<div
							className={cn(
								"w-8 h-4 rounded-full relative transition-colors",
								theme === "dark" ? "bg-primary/40" : "bg-foreground/10"
							)}
						>
							<div
								className={cn(
									"absolute top-1 left-1 w-2 h-2 rounded-full bg-foreground transition-all",
									theme === "dark" && "translate-x-4 bg-primary"
								)}
							/>
						</div>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				{/* Admin: open site in new tab (clean client view) */}
				{isAdmin && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => window.open("/?client=true", "_blank")}
								className="text-muted-foreground"
							>
								<ArrowUpRightFromSquare className="mr-2 h-4 w-4" />
								<span>Открыть сайт</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</>
				)}
				<DropdownMenuSeparator />
				<SignOutButton className="w-full" />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ThemeToggleIcon({
	theme,
	className,
}: {
	theme?: string;
	className?: string;
}) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return <Circle className={className} />;
	return theme === "dark" ? (
		<Moon className={className} />
	) : (
		<Sun className={className} />
	);
}
