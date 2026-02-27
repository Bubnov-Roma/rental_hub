import {
	BarChart3,
	Calendar,
	Calendar1,
	Camera,
	CircleHelp,
	Heart,
	Home,
	LayoutDashboard,
	type LucideIcon,
	MessageSquare,
	Package,
	Settings,
	SunMoon,
	Users,
} from "lucide-react";

// ─── Специальные маркеры для элементов с нестандартным поведением ─────────────
// "theme"  → рендерить ThemeToggle вместо ссылки
// "auth"   → рендерить динамически: LayoutDashboard/LogIn в зависимости от auth
export type NavItemSpecial = "theme" | "auth";

export type NavItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	// icon: React.ElementType;
	badge?: string | number;
	special?: NavItemSpecial;
};

// ─── CLIENT NAV ───────────────────────────────────────────────────────────────
// Используется как для авторизованных, так и для гостей.
// Элемент с special="auth" рендерится динамически на клиенте.

export const CLIENT_NAV: NavItem[] = [
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
	{
		title: "Тема",
		href: "#",
		icon: SunMoon,
		special: "theme", // → <ThemeToggle>
	},
];

// Fallback для неавторизованного состояния элемента special="auth"
export const GUEST_AUTH_ITEM: NavItem = {
	title: "Как стать клиентом",
	href: "/auth?view=register",
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
