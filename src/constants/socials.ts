import {
	FacebookIcon,
	Instagram,
	type LucideIcon,
	MessageCircle,
	Send,
	Share2,
	X,
} from "lucide-react";
import type { SocialPlatform } from "@/schemas";

interface SocialOption {
	id: SocialPlatform;
	label: string;
	icon: LucideIcon;
	color: string;
	placeholder: string;
}

export const SOCIAL_OPTIONS: readonly SocialOption[] = [
	{
		id: "Telegram",
		label: "Telegram",
		icon: Send,
		color: "#22D3EE",
		placeholder: "@username",
	},
	{
		id: "VK",
		label: "Вконтакте",
		icon: Share2,
		color: "#60A5FA",
		placeholder: "vk.com/id...",
	},
	{
		id: "Instagram",
		label: "Instagram",
		icon: Instagram,
		color: "#F472B6",
		placeholder: "@username",
	},
	{
		id: "Whatsapp",
		label: "Whatsapp",
		icon: MessageCircle,
		color: "#4ADE80",
		placeholder: "+7...",
	},
	{
		id: "Facebook",
		label: "Facebook",
		icon: FacebookIcon,
		color: "#3B82F6",
		placeholder: "facebook.com/...",
	},
	{
		id: "Max",
		label: "X (Twitter)",
		icon: X,
		color: "#FFFFFF",
		placeholder: "@username",
	},
] as const;

export const MAX_LINKS_PER_PLATFORM = 5;
