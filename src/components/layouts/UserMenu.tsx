"use client";

import { Bell, LogOut, Package, Settings, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser, signOut } from "@/lib/auth";
import type { CurrentUser } from "@/types/user.type";

export function UserMenu() {
	const router = useRouter();
	const [user, setUser] = useState<CurrentUser>(null);
	const [isLoading, setIsLoading] = useState(true);

	const initializeUser = useCallback(async () => {
		setIsLoading(true);
		try {
			const currentUser = await getCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error("Error loading user:", error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useState(() => {
		initializeUser();
	});

	const handleSignOut = async () => {
		try {
			await signOut();
			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	if (isLoading) {
		return (
			<Button variant="ghost" size="icon" disabled>
				<User className="h-5 w-5" />
			</Button>
		);
	}

	if (!user) {
		return (
			<div className="flex gap-2">
				<Button variant="ghost" onClick={() => router.push("/auth/login")}>
					Войти
				</Button>
				<Button onClick={() => router.push("/auth/register")}>Регистрация</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-4">
			<Button
				variant="ghost"
				size="icon"
				className="relative"
				onClick={() => router.push("/dashboard/notifications")}
			>
				<Bell className="h-5 w-5" />
				<span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white">
					3
				</span>
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-10 w-10 rounded-full">
						{user.profile?.avatar_url ? (
							<Image
								src={user.profile.avatar_url}
								alt={user.profile.name}
								className="h-full w-full rounded-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-white">
								{user.profile?.name?.charAt(0) || "U"}
							</div>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end">
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium">{user.profile?.name}</p>
							<p className="text-xs text-gray-500">{user.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => router.push("/dashboard")}>
							<Package className="mr-2 h-4 w-4" />
							<span>Мои бронирования</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
							<User className="mr-2 h-4 w-4" />
							<span>Профиль</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
							<Settings className="mr-2 h-4 w-4" />
							<span>Настройки</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleSignOut} className="text-red-600">
						<LogOut className="mr-2 h-4 w-4" />
						<span>Выйти</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
