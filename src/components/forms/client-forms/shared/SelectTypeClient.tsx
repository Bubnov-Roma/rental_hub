import { Handshake, ShieldCheck, Smile, Zap } from "lucide-react";
import type { FC } from "react";
import { ClientTypeCard } from "@/components/forms/shared";
import { BenefitCard } from "@/components/forms/shared/BenefitCard";
import type { ClientVariants } from "@/types";

interface SelectTypeClientProps {
	selectedType: string | undefined;
	onSelect: (type: ClientVariants) => void;
	showPartnerOption?: boolean;
}

export const SelectTypeClient: FC<SelectTypeClientProps> = ({
	selectedType,
	onSelect,
	showPartnerOption = false,
}) => {
	return (
		<div className="space-y-8">
			<div className="text-center">
				<h1 className="text-3xl font-bold mb-2">Анкета клиента</h1>
				<p className="text-foreground/40 my-2">
					Заполните данные один раз, чтобы получить доступ к аренде без залога
					{showPartnerOption && " и стать нашим партнером"}
				</p>
				<p className="text-gray-600">Выберите тип регистрации</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<ClientTypeCard
					type="individual"
					isSelected={
						selectedType === "individual" ||
						selectedType === "individual_partner"
					}
					onSelect={() =>
						onSelect(showPartnerOption ? "individual_partner" : "individual")
					}
				/>
				<ClientTypeCard
					type="legal"
					isSelected={
						selectedType === "legal" || selectedType === "legal_partner"
					}
					onSelect={() =>
						onSelect(showPartnerOption ? "legal_partner" : "legal")
					}
				/>
			</div>

			{showPartnerOption && (
				<div className="bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
					<div className="flex items-start gap-4">
						<Handshake className="w-12 h-12 text-blue-400 shrink-0" />
						<div>
							<h3 className="text-lg font-bold text-white mb-2">
								Партнерская программа
							</h3>
							<p className="text-sm text-white/60">
								Сдавайте свою технику в аренду и получайте пассивный доход
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Информационные карточки (Бенефиты) */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
				<BenefitCard
					icon={<Zap className="text-yellow-500" />}
					title="Быстро"
					desc="Заполнение займет 5 минут"
					bgColor="bg-yellow-50"
				/>
				<BenefitCard
					icon={<ShieldCheck className="text-green-500" />}
					title="Безопасно"
					desc="Данные зашифрованы"
					bgColor="bg-green-50"
				/>
				<BenefitCard
					icon={<Smile className="text-purple-500" />}
					title="Удобно"
					desc="Подсказки на каждом шаге"
					bgColor="bg-purple-50"
				/>
			</div>
		</div>
	);
};
