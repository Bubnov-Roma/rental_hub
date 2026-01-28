"use client";

import { type FieldErrors, useFormContext } from "react-hook-form";
import {
	SectionColumn,
	SectionWrapper,
} from "@/components/forms/client-forms/shared";
import { FormInput, FormRadioGroup } from "@/components/forms/shared";
import { FormCheckboxGroup } from "@/components/forms/shared/FormCheckboxGroup";
import { PhoneInput } from "@/components/forms/shared/PhoneInput";
import { BRAND_OPTIONS, EXPERIENCE_OPTIONS } from "@/constants";
import type { ClientFormValues, IndividualClient } from "@/schemas";

export const ExpertiseSection = () => {
	const {
		formState: { errors },
	} = useFormContext<ClientFormValues>();

	const indErrors = errors as FieldErrors<IndividualClient>;
	const equipmentError = indErrors.additional?.experience?.equipment;
	const arrayErrorMessage = equipmentError?.message;
	return (
		<SectionWrapper className="lg:grid-cols-12">
			<SectionColumn
				title="Занятость"
				indicatorColor="bg-amber-400"
				className="lg:col-span-5"
			>
				<FormInput
					required
					name="additional.work.workplace"
					label="Место работы и должность"
					placeholder="Компания или фриланс"
				/>
				{/* <FormInput
						name="additional.work.position"
						label="Должность"
						placeholder="Фотограф..."
					/> */}
				<div className="grid lg:grid-cols-18 gap-2">
					<div className="sm:col-span-6 lg:col-span-10">
						<PhoneInput
							name="additional.work.workPhone"
							label="Рабочий телефон"
						/>
					</div>
					<div className="sm:col-span-6 lg:col-span-8">
						<FormInput
							required
							name="additional.work.monthlyIncome"
							label="Доход в месяц"
							placeholder="50 000"
						/>
					</div>
				</div>
				<FormInput
					name="additional.work.companyWebsite"
					label="Портфолио / Сайт"
					placeholder="https://..."
				/>
			</SectionColumn>
			<SectionColumn
				title="Профессиональный опыт"
				indicatorColor="bg-purple-500"
				isLast
				className="lg:col-span-7"
			>
				<FormRadioGroup
					required={true}
					name="additional.experience.photographyExperience"
					label="Стаж съемки"
					options={EXPERIENCE_OPTIONS}
				/>
				<FormCheckboxGroup
					required={true}
					name="additional.experience.equipment"
					label="Бренды, с которыми работаете"
					options={BRAND_OPTIONS}
					gridClassName="grid grid-cols-auto-fit gap-4 minmax(250px, 1fr)"
					externalError={arrayErrorMessage ?? ""}
				/>
			</SectionColumn>
		</SectionWrapper>
	);
};
