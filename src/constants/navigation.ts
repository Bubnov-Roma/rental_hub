import {
	BarChart3,
	Calendar,
	Calendar1,
	Camera,
	CircleHelp,
	Heart,
	Home,
	LayoutDashboard,
	LayoutGrid,
	type LucideIcon,
	MessageSquare,
	Package,
	Settings,
	Users,
} from "lucide-react";

export type NavItemSpecial = "theme" | "auth";

export type NavItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	badge?: string | number;
	special?: NavItemSpecial;
};

export const CLIENT_NAV: NavItem[] = [
	{
		title: "Главная",
		href: "/",
		icon: Home,
	},
	{
		title: "Каталог",
		href: "/equipment",
		icon: LayoutGrid,
	},
	{
		title: "Календарь",
		href: "/calendar",
		icon: Calendar1,
	},
	{
		title: "Избранное",
		href: "/favorites",
		icon: Heart,
	},
	{
		title: "Дашборд",
		href: "/dashboard",
		icon: LayoutDashboard,
		special: "auth",
	},
];

// Fallback для неавторизованного состояния элемента special="auth"
export const GUEST_AUTH_ITEM: NavItem = {
	title: "Как стать клиентом",
	href: "/how-it-works",
	icon: CircleHelp,
};

// ─── ADMIN NAV ────────────────────────────────────────────────────────────────

export const ADMIN_NAV: NavItem[] = [
	{
		title: "Админ-панель",
		href: "/admin",
		icon: LayoutDashboard,
	},
	{
		title: "Оборудование",
		href: "/admin/equipment",
		icon: Camera,
		badge: "42",
	},
	{
		title: "Бронирования",
		href: "/admin/bookings",
		icon: Package,
		badge: "18",
	},
	{
		title: "Сводка",
		href: "/admin/summary",
		icon: Calendar,
		badge: "18",
	},
	{
		title: "Пользователи",
		href: "/admin/users",
		icon: Users,
		badge: "156",
	},
	{
		title: "Отзывы",
		href: "/admin/reviews",
		icon: MessageSquare,
		badge: "23",
	},
	{
		title: "Аналитика",
		href: "/admin/analytics",
		icon: BarChart3,
	},
	{
		title: "Настройки",
		href: "/admin/settings",
		icon: Settings,
	},
];
