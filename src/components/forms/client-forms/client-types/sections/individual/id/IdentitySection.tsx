"use client";

import { FioInput } from "@/components/forms/client-forms/client-types/sections/individual/id/FioInput";
import {
	SectionColumn,
	SectionWrapper,
} from "@/components/forms/client-forms/shared";
import { FormInput, FormRadioGroup } from "@/components/forms/shared";
import { DateInput } from "@/components/forms/shared/DateInput";
import { FormTextarea } from "@/components/forms/shared/FormTextarea";
import { PassportInput } from "@/components/forms/shared/PassportInput";
import { PhoneInput } from "@/components/forms/shared/PhoneInput";

export const IdentitySection = () => {
	return (
		<SectionWrapper className="lg:grid-cols-2">
			<SectionColumn title="Личные данные" indicatorColor="bg-blue-500">
				<FioInput
					required
					name="applicationData.personalData.name"
					label="ФИО полностью"
				/>
				<div className="grid grid-cols-2 gap-3">
					<DateInput
						required
						name="applicationData.personalData.birth"
						label="Дата рождения"
					/>
					<PhoneInput
						required
						name="applicationData.personalData.phone"
						label="Телефон"
					/>
				</div>

				<FormInput
					required
					name="applicationData.personalData.email"
					label="Email"
					type="email"
					placeholder="example@mail.com"
				/>
			</SectionColumn>

			{/* Правая колонка: Паспорт */}
			<SectionColumn
				title="Паспортные данные"
				indicatorColor="bg-cyan-400"
				isLast
			>
				<div className="grid grid-cols-2 gap-3">
					<PassportInput
						required
						name="applicationData.passport.seriesAndNumber"
						label="Серия и номер"
					/>
					<DateInput
						required
						name="applicationData.passport.issueDate"
						label="Дата выдачи"
					/>
				</div>
				<FormTextarea
					required
					name="applicationData.passport.issuedBy"
					label="Кем выдан"
					placeholder="Наименование органа выдавшего документ"
					rows={3}
					className="min-h-25"
				/>
				<FormRadioGroup
					required
					name="applicationData.personalData.maritalStatus"
					label="Семейное положение"
					options={[
						{ id: "single", label: "Холост / Не замужем", color: "#60a5fa" },
						{ id: "married", label: "Женат / Замужем", color: "#f472b6" },
					]}
				/>
			</SectionColumn>
		</SectionWrapper>
	);
};
