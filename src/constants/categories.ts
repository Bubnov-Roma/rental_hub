import { Camera, Disc, Layers, Lightbulb, Mic2, Wind } from "lucide-react";

export const CATEGORIES = [
	{ id: "all", name: "Все товары", icon: Layers },
	{ id: "cameras", name: "Камеры", icon: Camera },
	{ id: "lenses", name: "Объективы", icon: Disc },
	{ id: "adapters_filters", name: "Переходники / Фильтры", icon: Wind },
	{ id: "constant_light", name: "Постоянный свет", icon: Lightbulb },
	{ id: "impulse_light", name: "Импульсный свет", icon: Lightbulb },
	{ id: "synchronizers", name: "Синхронизаторы", icon: Wind },
	{ id: "light_attachments", name: "Световые насадки", icon: Lightbulb },
	{ id: "audio", name: "Звук", icon: Mic2 },
	{ id: "stands_grip", name: "Стойки / Крепления", icon: Wind },
	{ id: "tripods_steadicams", name: "Штативы / Стэдикамы", icon: Wind },
	{ id: "studio", name: "Студия", icon: Lightbulb },
	{ id: "other", name: "Прочее", icon: Layers },
] as const;
