"use client";

import {
	ArrowUpRightFromSquare,
	ChevronsUpDown,
	Heart,
	LayoutDashboard,
	LogIn,
	Package,
	User as UserIcon,
	WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layouts/ThemeToggle";
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
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useApplicationStore } from "@/store";
import { getClientDisplayData } from "@/utils/client-data.utils";

function useDisplayName() {
	const { user } = useAuth();
	const applicationData = useApplicationStore((s) => s.applicationData);
	const nickname = user?.user_metadata?.nickname as string | undefined;
	const appName = getClientDisplayData(applicationData)?.name ?? null;
	const metaName = user?.user_metadata?.name as string | undefined;
	const emailPrefix = user?.email?.split("@")[0];
	return nickname ?? appName ?? metaName ?? emailPrefix ?? "?";
}

export function UserMenu() {
	const { user, profile, isLoading } = useAuth();
	const { theme, setTheme } = useTheme();
	const { state, isMobile } = useSidebar();
	const router = useRouter();

	const [mounted, setMounted] = useState(false);
	const [isOnline, setIsOnline] = useState(true);
	const isCollapsed = state === "collapsed" && !isMobile;
	const displayName = useDisplayName();

	useEffect(() => {
		setMounted(true);
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

	if (!mounted || isLoading)
		return (
			<div className="h-12 w-full animate-pulse bg-foreground/5 rounded-xl" />
		);

	if (!user) {
		if (isCollapsed) {
			return (
				<button
					type="button"
					onClick={() => router.push("/auth?view=register")}
					title="Войти"
					className="h-12 w-12 flex items-center justify-center rounded-xl mx-auto bg-muted-foreground/10 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-95"
				>
					<LogIn size={20} />
				</button>
			);
		}
		return (
			<button
				type="button"
				onClick={() => router.push("/auth?view=register")}
				className="h-14 w-full flex items-center gap-3 rounded-xl px-4 bg-muted-foreground/10 text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-95 group/auth"
			>
				<LogIn
					size={22}
					className="shrink-0 transition-transform duration-200 group-hover/auth:translate-x-0.5"
				/>
				<span className="font-bold text-base">Войти</span>
			</button>
		);
	}

	// Используем user_metadata из SessionProvider
	const avatarUrl = user.user_metadata?.avatar_url || user.image;
	const isAdmin =
		profile?.role === "admin" ||
		profile?.role === "manager" ||
		profile?.role === "ADMIN" ||
		profile?.role === "MANAGER";
	const isOffline = !isOnline;
	const initial = displayName.charAt(0).toUpperCase();

	const Avatar = ({ size = 36 }: { size?: number }) => (
		<div className="relative shrink-0" style={{ width: size, height: size }}>
			<div className="rounded-lg overflow-hidden border border-foreground/10 bg-foreground/5 w-full h-full">
				{avatarUrl ? (
					<Image
						key={avatarUrl}
						src={avatarUrl}
						alt={displayName}
						width={size}
						height={size}
						className="object-cover w-full h-full"
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
						{initial}
					</div>
				)}
			</div>
			<div
				className={cn(
					"absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background transition-colors",
					isOnline ? "bg-green-500" : "bg-yellow-500"
				)}
			/>
		</div>
	);

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
					<Avatar size={36} />
					{!isCollapsed && (
						<>
							<div className="flex flex-col items-start flex-1 text-left min-w-0 leading-tight">
								<span className="text-sm font-semibold truncate w-full">
									{displayName}
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
				<DropdownMenuLabel className="pb-3">
					<div className="flex items-center gap-2.5">
						<Avatar size={36} />
						<div className="flex flex-col min-w-0">
							<div className="flex items-center gap-1.5">
								<p className="text-sm font-bold truncate max-w-32">
									{displayName}
								</p>
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
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault();
							setTheme(theme === "dark" ? "light" : "dark");
							if (navigator.vibrate) navigator.vibrate(5);
						}}
						className="cursor-pointer"
					>
						<ThemeToggle className="mr-2 h-4 w-full" />
					</DropdownMenuItem>
				</DropdownMenuGroup>

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
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
