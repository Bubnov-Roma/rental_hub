import {
	Bell,
	Calendar,
	LayoutDashboard,
	Package,
	Settings,
	ShieldUser,
	UserIcon,
} from "lucide-react";

export const CLIENT_SIDEBAR_NAV_ITEMS = [
	{ name: "Дашборд", href: "/dashboard", icon: LayoutDashboard },
	{
		name: "Управление",
		href: "/admin",
		icon: ShieldUser,
		roles: ["admin", "manager"],
	},
	{ name: "Бронирования", href: "/dashboard/bookings", icon: Package },
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
