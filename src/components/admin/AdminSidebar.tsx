"use client";

import {
	BarChart3,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Home,
	LayoutDashboard,
	MessageSquare,
	Package,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const navItems = [
	{
		name: "Дашборд",
		href: "/admin",
		icon: LayoutDashboard,
	},
	{
		name: "Оборудование",
		href: "/admin/equipment",
		icon: Package,
		badge: 42,
	},
	{
		name: "Бронирования",
		href: "/admin/bookings",
		icon: Calendar,
		badge: 18,
	},
	{
		name: "Пользователи",
		href: "/admin/users",
		icon: Users,
		badge: 156,
	},
	{
		name: "Отзывы",
		href: "/admin/reviews",
		icon: MessageSquare,
		badge: 23,
	},
	{
		name: "Аналитика",
		href: "/admin/analytics",
		icon: BarChart3,
	},
	{
		name: "Настройки",
		href: "/admin/settings",
		icon: Settings,
	},
];

export function AdminSidebar() {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);

	return (
		<aside
			className={cn(
				"sticky top-0 h-screen border-r bg-white transition-all flex flex-col",
				collapsed ? "w-16" : "w-64"
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between border-b p-4">
				{!collapsed && (
					<div className="flex items-center gap-2">
						<Shield className="h-6 w-6 text-blue-600" />
						<span className="text-lg font-bold">Админ-панель</span>
					</div>
				)}
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

			{/* Navigation */}
			<nav className="flex-1 space-y-1 p-4">
				{navItems.map((item) => {
					const isActive = pathname === item.href;
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
							<item.icon className="h-5 w-5 shrink-0" />
							{!collapsed && <span className="flex-1">{item.name}</span>}
							{item.badge && !collapsed && (
								<span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
									{item.badge}
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Action buttons */}
			<div className="border-t p-4 space-y-2">
				{!collapsed && (
					<Button variant="outline" className="w-full justify-start" asChild>
						<Link href="/">
							<Home className="mr-2 h-4 w-4" />
							На сайт
						</Link>
					</Button>
				)}

				<div className="border-t p-4">
					<SignOutButton
						className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
						showText={!collapsed}
					/>
				</div>

				{!collapsed && (
					<div className="pt-4 border-t">
						<div className="flex items-center gap-3">
							<div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500"></div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">Администратор</p>
								<p className="text-xs text-gray-500 truncate">Полный доступ</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
