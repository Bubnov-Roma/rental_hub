"use client";

import {
	Bell,
	Calendar,
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	Package,
	Settings,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/utils";

const navItems = [
	{ name: "Обзор", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Мои бронирования", href: "/dashboard/bookings", icon: Package },
	{ name: "Календарь", href: "/dashboard/calendar", icon: Calendar },
	{
		name: "Уведомления",
		href: "/dashboard/notifications",
		icon: Bell,
		badge: 3,
	},
	{ name: "Профиль", href: "/dashboard/profile", icon: UserIcon },
	{ name: "Настройки", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
	const { user } = useAuth();
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);

	const isVerified = user?.user_metadata?.verified || false;

	return (
		<aside
			className={cn(
				"sticky top-0 h-screen border-r bg-white transition-all duration-300",
				collapsed ? "w-16" : "w-64"
			)}
		>
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-end p-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setCollapsed(!collapsed)}
						className="h-8 w-8"
					>
						{collapsed ? (
							<ChevronRight className="h-4 w-4" />
						) : (
							<ChevronLeft className="h-4 w-4" />
						)}
					</Button>
				</div>

				<nav className="flex-1 space-y-1 p-4">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== "/dashboard" && pathname.startsWith(item.href));

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
									isActive
										? "bg-blue-50 text-blue-700"
										: "text-gray-700 hover:bg-gray-100"
								)}
							>
								<item.icon
									className={cn(
										"h-5 w-5 shrink-0",
										isActive && "text-blue-700"
									)}
								/>
								{!collapsed && <span className="flex-1">{item.name}</span>}
								{item.badge && !collapsed && (
									<span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
										{item.badge}
									</span>
								)}
							</Link>
						);
					})}
				</nav>

				{!collapsed && (
					<div className="border-t p-4">
						<div className="rounded-lg bg-blue-50 p-3">
							<p className="text-[10px] uppercase tracking-wider font-bold text-blue-700">
								Статус
							</p>
							<p className="mt-1 text-sm font-semibold text-blue-900">
								{isVerified ? "Проверенный профиль" : "Базовый уровень"}
							</p>
							<div className="mt-2 flex items-center gap-2">
								<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-200">
									<div className="h-full w-3/4 rounded-full bg-blue-600"></div>
								</div>
								<span className="text-xs text-blue-700 font-medium">75%</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
