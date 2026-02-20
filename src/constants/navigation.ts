import {
	BarChart3,
	Bell,
	Calendar,
	Calendar1,
	Camera,
	Home,
	LayoutDashboard,
	LogIn,
	MessageSquare,
	Package,
	Settings,
	UserIcon,
	UserPlus,
	Users,
} from "lucide-react";

export const CLIENT_NAV = [
	{
		title: "Главная",
		href: "/",
		icon: Home,
	},
	{
		title: "Каталог",
		href: "/equipment",
		icon: Camera,
	},
	{
		title: "Дашборд",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Бронирования",
		href: "/dashboard/bookings",
		icon: Package,
		badge: "3",
	},
	{
		title: "Профиль",
		href: "/dashboard/profile",
		icon: UserIcon,
	},
	{ title: "Календарь", href: "/dashboard/calendar", icon: Calendar1 },
	{
		title: "Уведомления",
		href: "/dashboard/notifications",
		icon: Bell,
		badge: 3,
	},
	{
		title: "Настройки",
		href: "/dashboard/settings",
		icon: Settings,
	},
];

export const ADMIN_NAV = [
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
export const GUEST_NAV = [
	{
		title: "Главная",
		href: "/",
		icon: Home,
	},
	{
		title: "Каталог",
		href: "/equipment",
		icon: Camera,
	},
	{
		title: "Войти",
		href: "/auth?view=login",
		icon: LogIn,
	},
	{
		title: "Регистрация",
		href: "/auth?view=register",
		icon: UserPlus,
	},
];
