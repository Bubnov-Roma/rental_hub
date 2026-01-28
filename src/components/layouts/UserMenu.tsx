"use client";

import { Package, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared";
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

export function UserMenu() {
	const { user } = useAuth();
	const router = useRouter();

	if (!user) {
		return (
			<Button
				variant="default"
				onClick={() => router.push("/auth?view=contact")}
			>
				Войти
			</Button>
		);
	}

	const name = user.user_metadata?.name || user.email;
	const avatar = user.user_metadata?.avatar_url;

	return (
		<div className="flex items-center gap-3">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="relative h-10 w-10 rounded-full p-2"
					>
						{avatar ? (
							<Image
								src={avatar}
								alt="Avatar"
								fill
								className="rounded-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-white">
								{name?.charAt(0).toUpperCase()}
							</div>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="z-65 w-56 shadow-glass glass-card bg-background/60 backdrop-blur-2xl rounded-2xl border-white/20 mx-2"
					align="end"
				>
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium">{name}</p>
							<p className="text-xs text-muted-foreground">{user.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => router.push("/dashboard")}>
							<Package className="mr-2 h-4 w-4" />
							<span>Бронирования</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
							<UserIcon className="mr-2 h-4 w-4" />
							<span>Профиль</span>
						</DropdownMenuItem>

						<DropdownMenuItem>
							<ThemeToggle className="w-full" />
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<SignOutButton className="w-full h-8 text-sm" />
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
