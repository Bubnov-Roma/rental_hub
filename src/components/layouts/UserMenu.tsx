"use client";

import { Bell, Package, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SignOutButton } from "@/components/shared/SignOutButton";
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
import { useAuth } from "@/hooks/useAuth";
export function UserMenu() {
	const { user } = useAuth();
	const router = useRouter();

	if (!user) {
		return (
			<div className="flex gap-2">
				<Button variant="ghost" onClick={() => router.push("/auth/login")}>
					Войти
				</Button>
				<Button onClick={() => router.push("/auth/register")}>
					Регистрация
				</Button>
			</div>
		);
	}

	const name = user.user_metadata?.name || user.email;
	const avatar = user.user_metadata?.avatar_url;

	return (
		<div className="flex items-center gap-4">
			<Button
				variant="ghost"
				size="icon"
				className="relative"
				onClick={() => router.push("/dashboard/notifications")}
			>
				<Bell className="h-5 w-5" />
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-10 w-10 rounded-full">
						{avatar ? (
							<Image
								src={avatar}
								alt="Avatar"
								fill
								className="rounded-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-white">
								{name?.charAt(0).toUpperCase()}
							</div>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end">
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium">{name}</p>
							<p className="text-xs text-muted-foreground">{user.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => router.push("/dashboard")}>
							<Package className="mr-2 h-4 w-4" /> <span>Мои бронирования</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
							<UserIcon className="mr-2 h-4 w-4" /> <span>Профиль</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<div className="p-1">
						<SignOutButton variant="ghost" className="w-full h-8 text-sm" />
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
