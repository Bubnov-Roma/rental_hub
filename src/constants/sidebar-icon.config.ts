"use client";

import {
	ApertureIcon,
	CameraIcon,
	CubeIcon,
	type Icon,
	type IconProps,
	LightbulbIcon,
	MicrophoneIcon,
	MicrophoneStageIcon,
	StackIcon,
	VideoCameraIcon,
} from "@phosphor-icons/react";
import type { ForwardRefExoticComponent } from "react";

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

export const ICON_MAP: Record<string, ForwardRefExoticComponent<IconProps>> = {
	Camera: CameraIcon,
	Aperture: ApertureIcon,
	VideoCameraIcon,
	VideoCamera: VideoCameraIcon,
	FilmSlate: VideoCameraIcon,
	Lightbulb: LightbulbIcon,
	SpeakerHifi: MicrophoneStageIcon,
	MicrophoneStageIcon,
	Microphone: MicrophoneIcon,
	MicrophoneIcon,
	Drone: StackIcon,
	Spinner: StackIcon,
	ArrowsOutLineVertical: StackIcon,
	Package: CubeIcon,
	CubeIcon,
};

// ─── Phosphor icons (npm i @phosphor-icons/react) ──────────────
// Mapping icon_name (string from db) → React component.
// Add new icons
// All icons Phosphor: https://phosphoricons.com

export function getCategoryIcon(iconName: string): Icon {
	return ICON_MAP[iconName] ?? CubeIcon;
}
