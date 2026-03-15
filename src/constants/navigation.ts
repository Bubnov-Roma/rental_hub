import {
	BarChart3,
	Calendar,
	Camera,
	Heart,
	Home,
	LayoutDashboard,
	LayoutGrid,
	type LucideIcon,
	MessageSquare,
	Package,
	Settings,
	ShoppingCart,
	Users,
} from "lucide-react";

// ─── DB-driven category types ─────────────────────────────────────────────────
// Категории и подкатегории приходят из базы данных.
// Администратор/менеджер добавляет их через admin-панель → они автоматически
// появляются в меню навигации без деплоя.
//
// Таблица в БД (добавить миграцией):
//   categories: id, name, slug, icon_name, sort_order
//   subcategories: id, category_id, name, slug, sort_order

export type DbSubcategory = {
	id: string;
	name: string;
	slug: string;
	admin_notes?: string | undefined;
};

export type DbCategory = {
	id: string;
	name: string;
	slug: string;
	admin_notes?: string | undefined;
	is_modular: boolean;
	/** Имя иконки из Phosphor Icons (строка), маппится в компоненте */
	icon_name: string;
	subcategories: DbSubcategory[];
};

// ─── Icon name → иконки ───────────────────────────────────────────────────────
// Используем @phosphor-icons/react — 1400+ иконок, MIT лицензия.
// Для установки: npm i @phosphor-icons/react
//
// Почему Phosphor, а не Lucide?
//  • Намного богаче для фото/видео/света: Camera, VideoCamera, Aperture,
//    Lightbulb, FilmSlate, Microphone, Drone, Tripod, Projector, SpeakerHifi…
//  • Три веса: Regular / Bold / Fill — без сторонних пакетов
//  • Tree-shakeable, MIT, активно развивается
//
// Рекомендуемые icon_name для ваших категорий:
//   Камеры           → "Camera"
//   Объективы        → "Aperture"
//   Видео            → "VideoCamera"
//   Свет             → "Lightbulb"
//   Звук             → "SpeakerHifi" или "Microphone"
//   Стабилизаторы    → "Drone" или "Spinner"
//   Штативы/Стойки   → "ArrowsOutLineVertical"
//   Прочее           → "Package"
//
// Fallback если icon_name не найден → "Package" (Lucide, всегда есть)

// ─── ADMIN NAV ────────────────────────────────────────────────────────────────
// Статический список для админ-панели (не меняется без деплоя)

export type NavItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	badge?: string | number;
};

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
		title: "Клиенты",
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

export const MOBILE_NAV: NavItem[] = [
	{
		title: "Главная",
		href: "/",
		icon: Home,
	},
	{
		title: "Избранное",
		href: "/favorites",
		icon: Heart,
	},
	{
		title: "Каталог",
		href: "/equipment",
		icon: LayoutGrid,
	},
	{
		title: "Корзина",
		href: "/checkout",
		icon: ShoppingCart,
	},
];
