"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitClientApplicationAction } from "@/app/actions/client-form.action";
import { UniversalClientForm } from "@/components/forms/client-forms/client-types/UniversalClientForm";
import { SelectTypeClient } from "@/components/forms/client-forms/shared/SelectTypeClient";
import { Card } from "@/components/ui/card";
import { type ClientFormValues, clientFormSchema } from "@/schemas";
import { useApplicationStore } from "@/store";

export const ClientForm = () => {
	const submitSuccess = useApplicationStore((state) => state.submitSuccess);
	const [step, setStep] = useState(1);

	const methods = useForm<ClientFormValues>({
		resolver: zodResolver(clientFormSchema),
		mode: "onBlur",
		defaultValues: {},
	});

	const { handleSubmit, watch, setValue, setError } = methods;
	const clientType = watch("clientType");

	const onSubmit = async (values: ClientFormValues) => {
		try {
			const result = await submitClientApplicationAction(values);

			if (!result.success) {
				if (result.errors) {
					Object.entries(result.errors).forEach(([path, messages]) => {
						setError(path as keyof ClientFormValues, {
							message: messages[0] ?? "",
						});
					});
				}
				toast.error(result.message || "Произошла ошибка");
				return;
			}
			toast.success(result.message);
			submitSuccess(values);
		} catch {
			toast.error("Критическая ошибка соединения");
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
					{step === 1 && (
						<SelectTypeClient
							selectedType={clientType}
							onSelect={(type) => {
								setValue("clientType", type);
								setStep(2);
							}}
							showPartnerOption={false}
						/>
					)}

					{step === 2 && (
						<Card className=" rounded-[32px]">
							<UniversalClientForm />
						</Card>
					)}
				</form>
			</FormProvider>

			<Link
				href="/dashboard"
				className="flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors w-fit"
			>
				<ArrowLeft size={16} />
				<span className="text-sm">Вернуться в дашборд</span>
			</Link>
		</div>
	);
};
