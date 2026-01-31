"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
	FormConsentInfo,
	FormNavigation,
} from "@/components/forms/client-forms/shared";
import { getStepsForClientType } from "@/constants/form-steps.config";
import type { ClientFormValues } from "@/schemas";

export const UniversalClientForm = () => {
	const [currentSubStep, setCurrentSubStep] = useState(0);
	const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

	const {
		trigger,
		control,
		formState: { isSubmitting, isValid },
	} = useFormContext<ClientFormValues>();

	const clientType = useWatch({ control, name: "clientType" });

	const steps = useMemo(() => getStepsForClientType(clientType), [clientType]);

	useEffect(() => {
		if (clientType) {
			document.documentElement.setAttribute("data-client-type", clientType);
		}
	}, [clientType]);

	const handleStepClick = async (stepIndex: number) => {
		if (stepIndex === currentSubStep) return;

		setVisitedSteps((prev) => new Set(prev).add(currentSubStep));

		const currentFields = steps[currentSubStep]?.fields;
		await trigger(currentFields);

		setCurrentSubStep(stepIndex);
		setVisitedSteps((prev) => new Set(prev).add(stepIndex));
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const next = async () => {
		const isValidStep = await trigger(steps[currentSubStep]?.fields);
		if (isValidStep) {
			const nextIndex = currentSubStep + 1;
			setVisitedSteps((prev) => new Set(prev).add(nextIndex));
			setCurrentSubStep(nextIndex);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const prev = () => {
		if (currentSubStep > 0) setCurrentSubStep((s) => s - 1);
	};

	const ActiveComponent = steps[currentSubStep]?.component;
	const canSubmit = isValid;

	return (
		<motion.div className="relative px-0 md:px-6 py-10 rounded-2xl flex-1 flex flex-col justify-between min-h-150">
			<AnimatePresence mode="wait">
				<motion.div
					key={currentSubStep}
					initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
					transition={{ duration: 0.3, ease: "backOut" }}
					className="min-h-100"
				>
					<h2 className="text-2xl font-black mt-1">
						{steps[currentSubStep]?.title}
					</h2>
					{ActiveComponent && <ActiveComponent />}
				</motion.div>
			</AnimatePresence>
			<FormNavigation
				prev={prev}
				next={next}
				currentStep={currentSubStep}
				isLastStep={currentSubStep === steps.length - 1}
				isSubmitting={isSubmitting}
				canSubmit={canSubmit}
				onStepClick={handleStepClick}
				visitedSteps={visitedSteps}
			/>
			<FormConsentInfo canSubmit={canSubmit} />
		</motion.div>
	);
};
