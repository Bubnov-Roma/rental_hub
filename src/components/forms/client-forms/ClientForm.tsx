"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitClientApplicationAction } from "@/app/actions/client-form.action";
import { UniversalClientForm } from "@/components/forms/client-forms/client-types/UniversalClientForm";
import { Card } from "@/components/ui/card";
import { type ClientFormValues, clientFormSchema } from "@/schemas";
import { useApplicationStore } from "@/store";

export const ClientForm = () => {
	const submitSuccess = useApplicationStore((state) => state.submitSuccess);
	const formDraft = useApplicationStore((state) => state.formDraft);
	const setFormDraft = useApplicationStore((state) => state.setFormDraft);
	const clearFormDraft = useApplicationStore((state) => state.clearFormDraft);

	// Шаг формы сохраняется в URL (?step=0) — переживает F5, не ломает Back
	// nuqs синхронизирует его с Next.js router автоматически
	const [step, setStep] = useQueryState("step", {
		defaultValue: 0,
		parse: (v) => parseInt(v, 10) || 0,
		serialize: String,
		shallow: true, // не тригерит серверный ре-рендер
	});

	const methods = useForm<ClientFormValues>({
		resolver: zodResolver(clientFormSchema),
		mode: "onBlur",
		defaultValues: {
			// Восстанавливаем черновик из zustand persist, или используем дефолт
			...(formDraft as ClientFormValues | undefined),
			clientType: "individual", // всегда захардкожено
		},
	});

	const { handleSubmit, setError, watch } = methods;

	// Сохраняем черновик в zustand при каждом изменении формы (debounce не нужен —
	// zustand persist пишет в localStorage синхронно, это быстро)
	useEffect(() => {
		const subscription = watch((values) => {
			setFormDraft(values as Partial<ClientFormValues>);
		});
		return () => subscription.unsubscribe();
	}, [watch, setFormDraft]);

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
			clearFormDraft(); // удаляем черновик после успешной отправки
			submitSuccess(values);
		} catch {
			toast.error("Критическая ошибка соединения");
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			<FormProvider {...methods}>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-8 w-full py-6 px-2 md:px-4"
				>
					<Card className="rounded-[32px]">
						<UniversalClientForm currentStep={step} onStepChange={setStep} />
					</Card>
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

// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { ArrowLeft } from "lucide-react";
// import Link from "next/link";
// import { FormProvider, useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { submitClientApplicationAction } from "@/app/actions/client-form.action";
// import { UniversalClientForm } from "@/components/forms/client-forms/client-types/UniversalClientForm";
// import { Card } from "@/components/ui/card";
// import { type ClientFormValues, clientFormSchema } from "@/schemas";
// import { useApplicationStore } from "@/store";

// export const ClientForm = () => {
// 	const submitSuccess = useApplicationStore((state) => state.submitSuccess);

// 	const methods = useForm<ClientFormValues>({
// 		resolver: zodResolver(clientFormSchema),
// 		mode: "onBlur",
// 		defaultValues: {
// 			// TODO: вернуть SelectTypeClient когда понадобится выбор типа (individual / legal / partner)
// 			clientType: "individual",
// 		},
// 	});

// 	const { handleSubmit, setError } = methods;

// 	const onSubmit = async (values: ClientFormValues) => {
// 		try {
// 			const result = await submitClientApplicationAction(values);

// 			if (!result.success) {
// 				if (result.errors) {
// 					Object.entries(result.errors).forEach(([path, messages]) => {
// 						setError(path as keyof ClientFormValues, {
// 							message: messages[0] ?? "",
// 						});
// 					});
// 				}
// 				toast.error(result.message || "Произошла ошибка");
// 				return;
// 			}
// 			toast.success(result.message);
// 			submitSuccess(values);
// 		} catch {
// 			toast.error("Критическая ошибка соединения");
// 		}
// 	};

// 	return (
// 		<div className="max-w-4xl mx-auto space-y-8">
// 			<FormProvider {...methods}>
// 				<form
// 					onSubmit={handleSubmit(onSubmit)}
// 					className="space-y-8 w-full py-6"
// 				>
// 					<Card>
// 						{/* SelectTypeClient убран — clientType = "individual" по умолчанию */}
// 						{/* TODO: вернуть шаг выбора типа клиента:
// 						<SelectTypeClient
// 							selectedType={clientType}
// 							onSelect={(type) => setValue("clientType", type)}
// 							showPartnerOption={false}
// 						/>
// 						*/}
// 						<UniversalClientForm />
// 					</Card>
// 				</form>
// 			</FormProvider>

// 			<Link
// 				href="/dashboard"
// 				className="flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors w-fit"
// 			>
// 				<ArrowLeft size={16} />
// 				<span className="text-sm">Вернуться в дашборд</span>
// 			</Link>
// 		</div>
// 	);
// };
