import {
	Aperture,
	Camera,
	Headphones,
	Layers,
	Lightbulb,
	Mic2,
	Wind,
} from "lucide-react";

const SUB_CAMERAS = [
	{
		id: "canon",
		slug: "canon",
		name: "Canon",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "nikon",
		slug: "nikon",
		name: "Nikon",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "sony",
		slug: "sony",
		name: "Sony",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "fuji",
		slug: "fuji",
		name: "Fujifilm",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "panasonic",
		slug: "panasonic",
		name: "Panasonic",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "action",
		slug: "action",
		name: "Action",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "polaroid",
		slug: "polaroid",
		name: "Polaroid",
		icon: Camera,
		subcategories: null,
	},
] as const;

const SUB_LENSES = [
	{
		id: "canon",
		slug: "canon",
		name: "Canon",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "nikon",
		slug: "nikon",
		name: "Nikon",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "sony",
		slug: "sony",
		name: "Sony",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "fuji",
		slug: "fuji",
		name: "Fujifilm",
		icon: Camera,
		subcategories: null,
	},
	{
		id: "panasonic",
		slug: "panasonic",
		name: "Panasonic",
		icon: Camera,
		subcategories: null,
	},
];

const SUB_LIGHT = [
	{
		id: "light_constant",
		slug: "constant-light",
		name: "Постоянный свет",
		icon: Lightbulb,
		subcategories: null,
	},
	{
		id: "light_impulse",
		slug: "impulse-light",
		name: "Импульсный свет",
		icon: Lightbulb,
		subcategories: null,
	},
];

const SUB_AUDIO = [
	{
		id: "radio",
		slug: "radio",
		name: "Радио-системы",
		icon: Mic2,
		subcategories: null,
	},
	{
		id: "mic",
		slug: "mic",
		name: "Микрофоны",
		icon: Mic2,
		subcategories: null,
	},
	{
		id: "recorder",
		slug: "recorder",
		name: "Рекордеры",
		icon: Mic2,
		subcategories: null,
	},
	{
		id: "headphones",
		slug: "phone",
		name: "Наушники",
		icon: Headphones,
		subcategories: null,
	},
];

const SUB_WIND = [
	{
		id: "tripods",
		slug: "tripods",
		name: "Штативы",
		icon: Wind,
		subcategories: [],
	},
	{
		id: "steadicam",
		slug: "steadicam",
		name: "Стэдикамы",
		icon: Wind,
		subcategories: [],
	},
];

export const CATEGORIES = [
	{
		id: "all",
		slug: "all",
		name: "Все категории",
		icon: Layers,
		subcategories: [],
	},
	{
		id: "cameras",
		slug: "cameras",
		name: "Камеры",
		icon: Camera,
		subcategories: SUB_CAMERAS,
	},
	{
		id: "lenses",
		slug: "lenses",
		name: "Объективы",
		icon: Aperture,
		subcategories: SUB_LENSES,
	},
	{
		id: "stands",
		slug: "stands",
		name: "Стойки / Крепления",
		icon: Wind,
		subcategories: [],
	},
	{
		id: "light",
		slug: "light",
		name: "Свет",
		icon: Lightbulb,
		subcategories: SUB_LIGHT,
	},
	{
		id: "audio",
		slug: "audio",
		name: "Звук",
		icon: Mic2,
		subcategories: SUB_AUDIO,
	},
	{
		id: "tripods",
		slug: "tripods",
		name: "Стабилизация",
		icon: Wind,
		subcategories: SUB_WIND,
	},
	{
		id: "other",
		slug: "other",
		name: "Прочее",
		icon: Layers,
		subcategories: null,
	},
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
