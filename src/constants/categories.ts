import { Camera, Disc, Layers, Lightbulb, Mic2, Wind } from "lucide-react";

export const CATEGORIES = [
	{ id: "all", slug: "all", name: "Всё оборудование", icon: Layers },
	{ id: "cameras", slug: "cameras", name: "Камеры", icon: Camera },
	{ id: "lenses", slug: "lenses", name: "Объективы", icon: Disc },
	{ id: "stands", slug: "stands", name: "Стойки / Крепления", icon: Wind },
	{
		id: "light_constant",
		slug: "constant-light",
		name: "Постоянный свет",
		icon: Lightbulb,
	},
	{
		id: "light_impulse",
		slug: "impulse-light",
		name: "Импульсный свет",
		icon: Lightbulb,
	},
	{ id: "audio", slug: "audio", name: "Звук", icon: Mic2 },
	{ id: "tripods", slug: "tripods", name: "Штативы / Стэдикамы", icon: Wind },
	{ id: "other", slug: "other", name: "Прочее", icon: Layers },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
