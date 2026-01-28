import type { FC, JSX } from "react";

interface BenefitCardProps {
	icon: JSX.Element;
	title: string;
	desc: string;
	bgColor: string;
}

export const BenefitCard: FC<BenefitCardProps> = ({
	icon,
	title,
	desc,
	bgColor,
}) => (
	<div
		className={`${bgColor} p-4 rounded-xl flex flex-col items-center text-center space-y-2`}
	>
		<div className="p-2 bg-white rounded-full shadow-sm">{icon}</div>
		<h4 className="font-bold text-sm">{title}</h4>
		<p className="text-xs text-gray-500">{desc}</p>
	</div>
);
