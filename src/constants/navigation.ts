// ─── ADMIN NAV ────────────────────────────────────────────────────────────────

import {
	CameraIcon,
	ChartBarIcon,
	ChatsIcon,
	CubeFocusIcon,
	GearIcon,
	HeartIcon,
	HouseLineIcon,
	type Icon,
	LayoutIcon,
	ShoppingCartSimpleIcon,
	SquaresFourIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { CalendarIcon } from "@phosphor-icons/react/dist/ssr";

export type NavItem = {
	title: string;
	href: string;
	icon: Icon;
	badge?: string | number;
};

export const ADMIN_NAV: NavItem[] = [
	{
		title: "Админ-панель",
		href: "/admin",
		icon: LayoutIcon,
	},
	{
		title: "Оборудование",
		href: "/admin/equipment",
		icon: CameraIcon,
		badge: "42",
	},
	{
		title: "Бронирования",
		href: "/admin/bookings",
		icon: CubeFocusIcon,
		badge: "18",
	},
	{
		title: "Сводка",
		href: "/admin/summary",
		icon: CalendarIcon,
		badge: "18",
	},
	{
		title: "Клиенты",
		href: "/admin/users",
		icon: UsersIcon,
		badge: "156",
	},
	{
		title: "Отзывы",
		href: "/admin/reviews",
		icon: ChatsIcon,
		badge: "23",
	},
	{
		title: "Аналитика",
		href: "/admin/analytics",
		icon: ChartBarIcon,
	},
	{
		title: "Настройки",
		href: "/admin/settings",
		icon: GearIcon,
	},
];

export const MOBILE_NAV: NavItem[] = [
	{
		title: "Главная",
		href: "/",
		icon: HouseLineIcon,
	},
	{
		title: "Избранное",
		href: "/favorites",
		icon: HeartIcon,
	},
	{
		title: "Каталог",
		href: "/equipment",
		icon: SquaresFourIcon,
	},
	{
		title: "Корзина",
		href: "/checkout",
		icon: ShoppingCartSimpleIcon,
	},
];
