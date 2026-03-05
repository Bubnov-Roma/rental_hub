"use client";

import { motion } from "framer-motion";
import { useFormContext, useWatch } from "react-hook-form";
import { FormInput } from "@/components/forms/shared/FormInput";
import { FormRadioGroup } from "@/components/forms/shared/FormRadioGroup";
import { REFERRAL_OPTIONS } from "@/constants";
import type { ClientFormValues } from "@/schemas";

export const FinalsSection = () => {
	const { control } = useFormContext<ClientFormValues>();

	const referralSource = useWatch({
		control,
		name: "applicationData.additional.referralSource",
	});

	const selectedOption = REFERRAL_OPTIONS.find(
		(opt) => opt.id === referralSource
	);

	const showExtraInput = !!selectedOption && selectedOption.placeholder !== "";
	const inputIsDisabled =
		referralSource !== "friends" &&
		referralSource !== "photo_school" &&
		referralSource !== "other";

	return (
		<div className="space-y-5">
			<FormRadioGroup
				name="applicationData.additional.referralSource"
				label="Как вы о нас узнали?"
				options={REFERRAL_OPTIONS}
				required
			/>
			{showExtraInput && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<FormInput
						name="applicationData.additional.recommendation"
						label={selectedOption.placeholder}
						placeholder=""
						disabled={inputIsDisabled}
					/>
				</motion.div>
			)}
			<FormInput
				name="agreements.promoCode"
				label="Промокод"
				placeholder="Введите промокод"
			/>
		</div>
	);
};
