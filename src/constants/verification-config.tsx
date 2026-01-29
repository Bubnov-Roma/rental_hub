import {
	CircleCheck,
	CircleDollarSign,
	CircleX,
	Eye,
	type LucideIcon,
	MessageCircleQuestionMark,
	SendHorizontal,
} from "lucide-react";
import type { ApplicationStatus } from "@/types";

export interface StatusConfig {
	color: string;
	bg: string;
	border: string;
	icon: LucideIcon;
	title: string;
	desc: string;
	glow?: string;
	showBadge?: boolean;
}

export const VERIFICATION_CONFIG: Record<ApplicationStatus, StatusConfig> = {
	pending: {
		color: "text-blue-400",
		bg: "bg-blue-500/10",
		border: "border-blue-500/30",
		icon: SendHorizontal,
		title: "Анкета отправлена",
		desc: "Ваша анкета успешно отправлена\n Статус обновится как только начнется проверка",
	},
	reviewing: {
		color: "text-purple-400",
		bg: "bg-purple-500/10",
		border: "border-purple-500/30",
		icon: Eye,
		title: "Идет проверка",
		desc: "Служба безопасности проверяет анкету\n Мы сообщим вам о результатах",
	},
	clarification: {
		color: "text-yellow-400",
		bg: "bg-yellow-500/10",
		border: "border-yellow-500/30",
		icon: MessageCircleQuestionMark,
		title: "Уточняющий вопрос",
		desc: "Пожалуйста, ответьте на вопрос администратора\n Эта информация пригодится для проверки анкеты",
		showBadge: true,
	},
	standard: {
		color: "text-gray-400",
		bg: "bg-gray-500/10",
		border: "border-gray-500/30",
		icon: CircleDollarSign,
		title: "Стандартные условия",
		desc: "Ваша анкета прошла проверку но беззалоговый лимит пока 0 ₽\n Условия могут быть пересмотрены спустя некоторое время\n Пока работаем под залог",
	},
	approved: {
		color: "text-green-400",
		bg: "bg-green-500/10",
		border: "border-green-500/30",
		icon: CircleCheck,
		title: "Профиль верифицирован",
		desc: "Ваша анкета успешно прошла проверку\n Вам доступна аренда без залога",
	},
	loading: {
		color: "text-gray-400",
		bg: "bg-gray-500/10",
		border: "border-gray-500/30",
		icon: CircleX,
		title: "Загрузка...",
		desc: "Пожалуйста, подождите\n Данные загружаются",
	},
	no_application: {
		color: "text-foreground",
		bg: "bg-gray-500/10",
		border: "border-gray-500/30",
		icon: CircleX,
		title: "Нет заявки",
		desc: "Вы еще не отправили анкету",
	},
	rejected: {
		color: "text-red-500",
		bg: "bg-red-500/10",
		border: "border-red-500/30",
		icon: CircleX,
		title: "Профиль заблокирован",
		desc: "Ваш профиль был заблокирован по требованию службы безопасности",
	},
};
