"use client";

import { motion } from "framer-motion";
import {
	AlertTriangle,
	Check,
	MessageSquare,
	Search,
	Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApplicationStatus } from "@/types";
import { cn } from "@/utils";

interface RadarAnimationProps {
	status: ApplicationStatus;
}

type ConfigValue = {
	color: string;
	bg: string;
	border: string;
	glow?: string;
	icon: React.ReactNode;
	title: string;
	desc: string;
};

export function RadarAnimation({ status = "pending" }: RadarAnimationProps) {
	const config: Record<ApplicationStatus, ConfigValue> = {
		pending: {
			color: "text-blue-400",
			bg: "bg-blue-500/10",
			border: "border-blue-500",
			icon: <Shield className="w-10 h-10" />,
			title: "Анкета отправлена",
			desc: "Ожидает начала проверки",
		},
		reviewing: {
			color: "text-purple-400",
			bg: "bg-purple-500/10",
			border: "border-purple-500/30",
			icon: <Search className="w-10 h-10" />,
			title: "Идет проверка",
			desc: "Администратор изучает вашу анкету",
		},
		clarification: {
			color: "text-yellow-400",
			bg: "bg-yellow-500/10",
			border: "border-yellow-500/30",
			icon: <MessageSquare className="w-10 h-10" />,
			title: "Требуются уточнения",
			desc: "Пожалуйста, ответьте на вопро администратора ниже",
		},
		standard: {
			color: "text-orange-400",
			bg: "bg-orange-500/10",
			border: "border-orange-500/30",
			icon: <AlertTriangle className="w-10 h-10" />,
			title: "Стандартные условия",
			desc: "Проверка пройдена, но лимит пока 0 ₽. Работаем под залог",
		},
		approved: {
			color: "text-green-400",
			bg: "bg-green-500/10",
			border: "border-green-500/30",
			icon: <Check className="w-10 h-10" />,
			title: "Проверка успешно завершена",
			desc: "Вам одобрен беззалоговый лимит!",
		},
		loading: {
			color: "text-gray-400",
			bg: "bg-gray-500/10",
			border: "border-gray-500/30",
			icon: <Shield className="w-10 h-10 animate-spin" />,
			title: "Загрузка...",
			desc: "Пожалуйста, подождите.",
		},
		no_application: {
			color: "text-gray-400",
			bg: "bg-gray-500/10",
			border: "border-gray-500/30",
			icon: <Shield className="w-10 h-10" />,
			title: "Нет заявки",
			desc: "Вы еще не отправили заявку на проверку.",
		},
	};

	const current = config[status] || config.pending;

	return (
		<div className="flex flex-col items-center justify-center p-8 space-y-8 text-center transition-all duration-700">
			<div className="relative">
				<div className="relative w-32 h-32 flex items-center justify-center">
					<div
						className={cn(
							"relative z-10 w-20 h-20 rounded-3xl border flex items-center justify-center transition-all duration-700",
							current.bg,
							current.border,
							status === "loading" ? "" : current.glow,
							current.color
						)}
						style={{ willChange: "filter" }}
					>
						{current?.icon}
					</div>
				</div>
			</div>

			<div className="space-y-3 max-w-sm">
				<h2 className={`text-2xl font-bold tracking-tight ${current?.color}`}>
					{current?.title}
				</h2>
				<p className="text-md">{current?.desc}</p>
			</div>

			{status === "clarification" && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-md glass-card p-4 mt-4"
				>
					{/* Здесь будет поле ввода для ответа */}
					<p className="text-xs text-white/40 mb-2">
						Вопрос от менеджера: "Уточните адрес регистрации"
					</p>
					<textarea
						className="glass-input-neumorphic w-full p-2 rounded-lg text-sm mb-2"
						rows={2}
					/>
					<Button className="text-xs text-blue-400 hover:text-blue-300">
						Отправить ответ
					</Button>
				</motion.div>
			)}
		</div>
	);
}
