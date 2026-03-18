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
import {
	SUPPORT_PHONE_DEFAULT,
	SUPPORT_TELEGRAM_DEFAULT,
} from "@/constants/support";
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
	action?: StatusAction;
}

export const VERIFICATION_CONFIG: Record<ApplicationStatus, StatusConfig> = {
	LOADING: {
		label: "Загрузка данных",
		description: "Получаем статус анкеты...",
		Icon: Clock,
		color: "text-muted-foreground",
		bgColor: "bg-muted/20",
		borderColor: "border-muted/30",
		glowColor: "shadow-muted/20",
	},
	NO_APPLICATION: {
		label: "Нет анкеты",
		description: "Заполните анкету чтобы арендовать технику без залога",
		Icon: Search,
		color: "text-foreground/50",
		bgColor: "bg-foreground/5",
		borderColor: "border-foreground/10",
		glowColor: "shadow-foreground/10",
		action: { href: "/dashboard/profile", label: "Заполнить анкету" },
	},
	DRAFT: {
		label: "Анкета в процессе заполнения",
		description:
			"Завершите заполнение анкеты. Обноаление статуса произойдет автоматически",
		Icon: Search,
		color: "text-foreground/50",
		bgColor: "bg-foreground/5",
		borderColor: "border-foreground/10",
		glowColor: "shadow-foreground/10",
		action: {
			href: "/dashboard/profile",
			label: "Завершить заполнение анкеты",
		},
	},
	PENDING: {
		label: "Анкета отправлена",
		description: "Ожидает начала проверки модератором",
		Icon: SendHorizontal,
		color: "text-pink-400",
		bgColor: "bg-pink-400/10",
		borderColor: "border-pink-400/20",
		glowColor: "shadow-pink-400/20",
		action: { href: "/dashboard/profile", label: "Открыть профиль" },
	},
	REVIEWING: {
		label: "На проверке",
		description: "Модератор изучает вашу анкету",
		Icon: FileSearch2,
		color: "text-blue-400",
		bgColor: "bg-blue-400/10",
		borderColor: "border-blue-400/20",
		glowColor: "shadow-blue-400/20",
		action: { href: "/dashboard/profile", label: "Открыть профиль" },
	},
	CLARIFICATION: {
		label: "Требуются уточнения",
		description:
			"Пожалуйста ответьте на вопрос модератора, эти данные помогут завершить проверку анкеты.",
		Icon: MessageSquareWarning,
		color: "text-orange-400",
		bgColor: "bg-orange-400/10",
		borderColor: "border-orange-400/20",
		glowColor: "shadow-orange-400/20",
		action: { href: "/dashboard/profile", label: "Уточнить данные" },
	},
	STANDARD: {
		label: "Стандартные условия",
		description:
			"На данный момент вам доступна аренда под залог. Позднее условия аренды могут быть пересмотрены.",
		Icon: CheckCircle2,
		color: "text-emerald-400",
		bgColor: "bg-emerald-400/10",
		borderColor: "border-emerald-400/20",
		glowColor: "shadow-emerald-400/20",
		action: { href: "/dashboard/profile", label: "Подать заявку" },
	},
	APPROVED: {
		label: "Профиль верифицирован",
		description:
			"Ваша анкета успешно проверена. Вам доступна аренда без залога. Благодарим за доверие!",
		Icon: ShieldCheck,
		color: "text-green-400",
		bgColor: "bg-green-400/10",
		borderColor: "border-green-400/20",
		glowColor: "shadow-green-400/30",
		action: { href: "/equipment", label: "Перейти в каталог" },
	},
	REJECTED: {
		label: "Запрос отклонён",
		description: `К сожалению ваша анкета не прошла проверку. Если у вас возникли вопросы пожалуйста свяжитесь с нами по телфону ${SUPPORT_PHONE_DEFAULT} либо в telegram`,
		Icon: AlertCircle,
		color: "text-red-400",
		bgColor: "bg-red-400/10",
		borderColor: "border-red-400/20",
		glowColor: "shadow-red-400/20",
		action: {
			href: `${SUPPORT_TELEGRAM_DEFAULT}`,
			label: "Написать в telegram",
		},
	},
	BLOCKED: {
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
