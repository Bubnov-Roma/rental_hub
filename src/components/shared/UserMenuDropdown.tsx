"use client";

import {
	ArrowUpRightFromSquare,
	Heart,
	LayoutDashboard,
	Package,
	User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layouts/ThemeToggle";
import { SignOutButton } from "@/components/shared/SignOutButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

interface UserMenuDropdownProps {
	children: React.ReactNode;
	align?: "start" | "center" | "end";
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
}

export function UserMenuDropdown({
	children,
	align = "end",
	side = "top",
	sideOffset = 8,
}: UserMenuDropdownProps) {
	const { profile } = useAuth();
	const router = useRouter();

	const isAdmin = profile?.role === "ADMIN" || profile?.role === "MANAGER";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

			<DropdownMenuContent
				className="w-72 rounded-2xl bg-background/90 backdrop-blur-xl border-foreground/10 shadow-2xl p-2"
				align={align}
				side={side}
				sideOffset={sideOffset}
			>
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => router.push("/dashboard")}
						className="p-3 cursor-pointer rounded-xl"
					>
						<LayoutDashboard className="mr-3 h-5 w-5 text-muted-foreground" />
						<span className="font-medium">Личный кабинет</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.push("/dashboard/bookings")}
						className="p-3 cursor-pointer rounded-xl"
					>
						<Package className="mr-3 h-5 w-5 text-muted-foreground" />
						<span className="font-medium">Бронирования</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.push("/favorites")}
						className="p-3 cursor-pointer rounded-xl"
					>
						<Heart className="mr-3 h-5 w-5 text-muted-foreground" />
						<span className="font-medium">Избранное</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.push("/dashboard/profile")}
						className="p-3 cursor-pointer rounded-xl"
					>
						<UserIcon className="mr-3 h-5 w-5 text-muted-foreground" />
						<span className="font-medium">Профиль</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<div className="px-2 py-2 mt-1 bg-foreground/5 rounded-xl">
					<ThemeToggle className="w-full" />
				</div>

				{isAdmin && (
					<>
						<DropdownMenuSeparator className="my-2" />
						<DropdownMenuItem
							onClick={() => window.open("/?client=true", "_blank")}
							className="p-3 cursor-pointer rounded-xl text-muted-foreground"
						>
							<ArrowUpRightFromSquare className="mr-3 h-5 w-5" />
							<span className="font-medium">Открыть сайт</span>
						</DropdownMenuItem>
					</>
				)}

				<DropdownMenuSeparator className="my-2" />
				<div className="px-1 pb-1">
					<SignOutButton className="w-full h-10 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20" />
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
