"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AddressFieldsGroup } from "@/components/forms/client-forms/client-types/sections/individual/address/AddressFieldsGroup";
import {
	SectionColumn,
	SectionWrapper,
} from "@/components/forms/client-forms/shared";
import { FormCheckbox } from "@/components/forms/shared";
import { useIsMobile } from "@/hooks";
import type { ClientFormValues } from "@/schemas";

export const AddressesSection = () => {
	const { control, setValue } = useFormContext<ClientFormValues>();
	const isMobile = useIsMobile();

	const isSame = useWatch({
		control,
		name: "applicationData.addresses.isSame",
	});
	const registrationAddress = useWatch({
		control,
		name: "applicationData.addresses.registration",
	});

	useEffect(() => {
		if (isSame) {
			setValue("applicationData.addresses.actual", registrationAddress, {
				shouldValidate: true,
			});
		} else {
			setValue(
				"applicationData.addresses.actual",
				{ address: "", index: "", country: "", region: "", city: "" },
				{ shouldValidate: false }
			);
		}
	}, [isSame, registrationAddress, setValue]);

	const sharedTransition: Transition = {
		type: "spring",
		stiffness: 300,
		damping: 90,
		opacity: { duration: 0.1 },
	};

	const syncCheckbox = (
		<FormCheckbox
			name="applicationData.addresses.isSame"
			label={
				isMobile ? "Совпадает с фактическим адресом" : "Совпадает с фактическим"
			}
		/>
	);

	return (
		<SectionWrapper
			layout
			className={!isSame ? "lg:grid-cols-2" : "lg:grid-cols-1"}
		>
			<SectionColumn
				title="Адрес регистрации"
				indicatorColor="bg-emerald-400"
				headerRight={!isMobile ? syncCheckbox : undefined}
			>
				<AddressFieldsGroup prefix="applicationData.addresses.registration" />
				{isMobile && <div className="pt-1">{syncCheckbox}</div>}
			</SectionColumn>
			<AnimatePresence mode="popLayout">
				{!isSame && (
					<motion.div
						key="actual-address"
						layout
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						transition={sharedTransition}
					>
						<SectionColumn
							title="Фактическое проживание"
							indicatorColor="bg-purple-400"
							isLast
						>
							<AddressFieldsGroup prefix="applicationData.addresses.actual" />
						</SectionColumn>
					</motion.div>
				)}
			</AnimatePresence>
		</SectionWrapper>
	);
};
