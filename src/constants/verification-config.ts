import {
	AlertCircle,
	CheckCircle2,
	Clock,
	FileSearch2,
	MessageSquareWarning,
	Search,
	SendHorizontal,
	ShieldCheck,
	XCircle,
} from "lucide-react";
import type { ApplicationStatus } from "@/types";

export interface StatusAction {
	href: string;
	label: string;
}

export interface StatusConfig {
	label: string;
	description: string;
	Icon: React.ElementType;
	color: string;
	bgColor: string;
	borderColor: string;
	glowColor?: string;
	showBadge?: boolean;
	/**
	 * Опциональная ссылка-действие — хранится как данные (href + label),
	 * рендерится компонентом ActionLink в нужном месте.
	 * Это позволяет избежать:
	 * 1. JSX в конфиге (нет зависимостей от React.ReactNode)
	 * 2. Ошибок exactOptionalPropertyTypes при передаче onClose
	 */
	action?: StatusAction;
}

export const VERIFICATION_CONFIG: Record<ApplicationStatus, StatusConfig> = {
	loading: {
		label: "Загрузка данных",
		description: "Получаем статус анкеты...",
		Icon: Clock,
		color: "text-muted-foreground",
		bgColor: "bg-muted/20",
		borderColor: "border-muted/30",
		glowColor: "shadow-muted/20",
	},
	no_application: {
		label: "Нет анкеты",
		description: "Заполните анкету для аренды без залога",
		Icon: Search,
		color: "text-foreground/50",
		bgColor: "bg-foreground/5",
		borderColor: "border-foreground/10",
		glowColor: "shadow-foreground/10",
		action: { href: "/dashboard/profile", label: "Заполнить анкету" },
	},
	pending: {
		label: "Анкета отправлена",
		description: "Ожидает проверки модератором",
		Icon: SendHorizontal,
		color: "text-yellow-400",
		bgColor: "bg-yellow-400/10",
		borderColor: "border-yellow-400/20",
		glowColor: "shadow-yellow-400/20",
		action: { href: "/dashboard/profile", label: "Открыть профиль" },
	},
	reviewing: {
		label: "На проверке",
		description: "Модератор изучает вашу анкету",
		Icon: FileSearch2,
		color: "text-blue-400",
		bgColor: "bg-blue-400/10",
		borderColor: "border-blue-400/20",
		glowColor: "shadow-blue-400/20",
		action: { href: "/dashboard/profile", label: "Открыть профиль" },
	},
	clarification: {
		label: "Требуются уточнения",
		description: "Нужны дополнительные данные",
		Icon: MessageSquareWarning,
		color: "text-orange-400",
		bgColor: "bg-orange-400/10",
		borderColor: "border-orange-400/20",
		glowColor: "shadow-orange-400/20",
		action: { href: "/dashboard/profile", label: "Уточнить данные" },
	},
	standard: {
		label: "Стандартные условия",
		description:
			"Аренда с полным залогом. Попробуйте запросить повторную проверку анкеты позднее",
		Icon: CheckCircle2,
		color: "text-emerald-400",
		bgColor: "bg-emerald-400/10",
		borderColor: "border-emerald-400/20",
		glowColor: "shadow-emerald-400/20",
		action: { href: "/dashboard/profile", label: "Подать заявку" },
	},
	approved: {
		label: "Профиль верифицирован",
		description: "Аренда с беззалоговым лимитом доступна",
		Icon: ShieldCheck,
		color: "text-green-400",
		bgColor: "bg-green-400/10",
		borderColor: "border-green-400/20",
		glowColor: "shadow-green-400/30",
		action: { href: "/equipment", label: "Перейти в каталог" },
	},
	rejected: {
		label: "Запрос отклонён",
		description: "Анкета не прошла проверку",
		Icon: AlertCircle,
		color: "text-red-400",
		bgColor: "bg-red-400/10",
		borderColor: "border-red-400/20",
		glowColor: "shadow-red-400/20",
		action: { href: "/dashboard/profile", label: "Подать повторно" },
	},
	blocked: {
		label: "Профиль заблокирован",
		description:
			"Ваш профиль был заблокирован по требованию службы безопасности",
		Icon: XCircle,
		color: "text-red-400",
		bgColor: "bg-red-400/10",
		borderColor: "border-red-400/20",
		glowColor: "shadow-red-400/20",
	},
};
