import { Briefcase, GraduationCap, Heart, User } from "lucide-react";

export const RELATION_OPTIONS = [
	{
		id: "relative",
		label: "Родственник",
		icon: Heart,
		color: "#FB7185",
		placeholder: "Укажите имя родственника",
	},
	{
		id: "friend",
		label: "Друг",
		icon: User,
		color: "#818CF8",
		placeholder: "Укажите имя друга или подруги",
	},
	{
		id: "colleague",
		label: "Коллега",
		icon: Briefcase,
		color: "#FB923C",
		placeholder: "Укажите имя коллеги",
	},
	{
		id: "other",
		label: "Другое",
		icon: GraduationCap,
		color: "#94A3B8",
		placeholder: "Укажите имя и отчество",
	},
] as const;
