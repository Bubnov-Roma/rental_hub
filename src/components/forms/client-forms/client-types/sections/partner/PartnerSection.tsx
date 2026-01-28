import { Handshake } from "lucide-react";
import { Label } from "@/components/ui/label";

interface PartnerSectionProps {
	partnerAgreement: boolean;
	onAgreementChange: (checked: boolean) => void;
	onCancel?: () => void;
	showCancel: boolean;
}

export const PartnerSection: React.FC<PartnerSectionProps> = ({
	partnerAgreement,
	onAgreementChange,
	onCancel,
	showCancel,
}) => {
	return (
		<div
			id="partner-section"
			className="bg-white rounded-lg shadow p-6 border-2 border-blue-200"
		>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<Handshake className="h-6 w-6 text-blue-600" />
					Партнерская программа
				</h2>
				{showCancel && onCancel && (
					<button
						type="button"
						onClick={onCancel}
						className="text-sm text-gray-600 hover:text-gray-900"
					>
						Отменить
					</button>
				)}
			</div>

			<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
				<p className="text-sm text-amber-900 font-semibold mb-2">
					Основные условия:
				</p>
				<ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
					<li>Комиссия сервиса — 30% от стоимости аренды</li>
					<li>Минимальная оценочная стоимость техники — 10 000₽</li>
					<li>Полное страхование на время аренды</li>
				</ul>
			</div>

			<div className="flex items-start gap-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50 mb-4">
				<input
					type="checkbox"
					checked={partnerAgreement}
					onChange={(e) => onAgreementChange(e.target.checked)}
					className="mt-1"
				/>
				<Label className="text-sm font-medium">
					Я ознакомлен и согласен с условиями партнерского сотрудничества *
				</Label>
			</div>

			<p className="text-sm text-gray-600">
				💡 Добавьте информацию о технике после отправки анкеты в личном кабинете
			</p>
		</div>
	);
};
