"use client";

import {
	Circle,
	LayoutDashboard,
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
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function UserMenu() {
	const { user, profile, isLoading } = useAuth();
	const { theme, setTheme } = useTheme();
	const router = useRouter();

	const [isOnline, setIsOnline] = useState(true);

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

	if (isLoading) {
		return (
			<div className="h-10 w-10 rounded-full bg-primary/10 animate-pulse border border-white/10" />
		);
	}

	if (!user) {
		return (
			<Button
				variant="default"
				onClick={() => router.push("/auth?view=contact")}
				className="rounded-xl"
			>
				Войти
			</Button>
		);
	}

	const name = profile?.name || user?.user_metadata?.name || user?.email;
	const isOfflineMode = !isOnline || (!profile && !isLoading);

	return (
		<div className="flex items-center gap-3">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className={cn(
							"relative h-10 w-10 p-0 rounded-full ring-1 focus:ring-2 active:ring-2",
							isOfflineMode ? "ring-3 ring-yellow-500" : "ring-primary/50"
						)}
					>
						{/* Avatar */}
						<div className="relative">
							<div className="h-10 w-10 rounded-full overflow-hidden">
								{user.user_metadata?.avatar_url ? (
									<Image
										src={user.user_metadata.avatar_url}
										alt="Avatar"
										width={40}
										height={40}
										className="object-cover rounded-full"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-primary text-white">
										{name?.charAt(0).toUpperCase()}
									</div>
								)}
							</div>
						</div>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="z-65 w-56 shadow-glass glass-card bg-background/60 backdrop-blur-2xl rounded-2xl border-white/20 mx-2"
					align="end"
				>
					<DropdownMenuLabel className="pb-3">
						<div className="flex flex-col space-y-1">
							<div className="flex items-center gap-2">
								<p className="text-sm font-bold truncate max-w-37.5">{name}</p>
								{isOfflineMode && (
									<span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-[9px] text-yellow-500 uppercase font-black tracking-tighter border border-yellow-500/20">
										<WifiOff size={10} /> Offline
									</span>
								)}
							</div>
							<p className="text-[10px] text-muted-foreground truncate">
								{user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => router.push("/dashboard")}>
							<LayoutDashboard className="mr-2 h-4 w-4" />
							<span>Дашборд</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => router.push("/dashboard/bookings")}
						>
							<Package className="mr-2 h-4 w-4" />
							<span>Бронирования</span>
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
							className="flex items-center justify-between cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<ThemeToggleIcon
									theme={theme ?? "system"}
									className="mr-2 h-4 w-4 text-foreground/50"
								/>
								<span>{theme === "dark" ? "Темная" : "Светлая"} тема</span>
							</div>
							<div
								className={cn(
									"w-8 h-4 rounded-full bg-foreground/10 relative transition-colors",
									theme === "dark" && "bg-primary/40"
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
					<DropdownMenuSeparator />
					<SignOutButton className="w-full h-8 text-sm" />
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
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
