import { Building2, User } from "lucide-react";
import type { FC } from "react";
import { cn } from "@/utils";
import styles from "../../../styles/components/ClientTypeCard.module.css";

interface ClientTypeCardProps {
	type: "individual" | "legal";
	isSelected: boolean;
	onSelect: () => void;
}

export const ClientTypeCard: FC<ClientTypeCardProps> = ({
	type,
	isSelected,
	onSelect,
}) => {
	const config = {
		individual: {
			icon: User,
			title: "Физическое лицо",
			description: "Зарегистрироваться как частный клиент",
			brand: "oklch(0.6 0.18 250)",
			circlePos: "-bottom-24 -right-24",
		},
		legal: {
			icon: Building2,
			title: "Юридическое лицо",
			description: "Зарегистрироваться как организация",
			color: "#059669",
			brand: "oklch(0.6 0.2 150)",
			circlePos: "-top-24 -left-24",
		},
	};

	const theme = config[type];
	const Icon = theme.icon;

	return (
		<button
			type="button"
			onClick={onSelect}
			style={
				{
					"--brand-color": theme.brand,
					"--brand-bg-hover": theme.brand.replace(")", " / 0.08)"),
				} as React.CSSProperties
			}
			className={cn(
				styles.card,
				isSelected && styles.selected,
				"p-8 rounded-[2.5rem] flex flex-col items-center text-center group"
			)}
		>
			<div
				className={`${styles.circle} ${theme.circlePos} pointer-events-none`}
			/>

			<div className={`p-5 rounded-3xl mb-6 ${styles.iconWrapper}`}>
				<Icon className="h-10 w-10" />
			</div>

			<h3 className="text-2xl font-black mb-3 bg-clip-text text-foreground transition-colors">
				{theme.title}
			</h3>
			<p className="text-sm font-medium text-muted-foreground mb-8 max-w-45">
				{theme.description}
			</p>
		</button>
	);
};
