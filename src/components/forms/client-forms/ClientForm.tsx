"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitClientApplicationAction } from "@/app/actions/client-form.action";
import {
	loadDraftAction,
	saveDraftAction,
} from "@/app/actions/save-draft-action";
import { UniversalClientForm } from "@/components/forms/client-forms/client-types/UniversalClientForm";
import { Card } from "@/components/ui/card";
import { type ClientFormValues, clientFormSchema } from "@/schemas";
import { useApplicationStore } from "@/store";

/**
 * Draft save strategy:
 * - On mount: load from server (cross-device, all fields including passport)
 * - On change (debounced 2s): autosave to server via saveDraftAction
 * - On submit: full submit via submitClientApplicationAction
 *
 * Sensitive data (passport) stays on server — never in localStorage.
 * Server row protected by RLS (user sees only their own row).
 */
export const ClientForm = () => {
	const submitSuccess = useApplicationStore((s) => s.submitSuccess);
	const clearFormDraft = useApplicationStore((s) => s.clearFormDraft);

	const [step, setStep] = useQueryState("step", {
		defaultValue: 0,
		parse: (v) => parseInt(v, 10) || 0,
		serialize: String,
		shallow: true,
	});

	const methods = useForm<ClientFormValues>({
		resolver: zodResolver(clientFormSchema),
		mode: "onBlur",
		defaultValues: { clientType: "individual" },
	});

	const { handleSubmit, setError, watch, reset } = methods;

	// Load server draft on mount
	useEffect(() => {
		loadDraftAction().then(({ data, status }) => {
			if (data && status === "draft") {
				reset({ ...data, clientType: "individual" } as ClientFormValues, {
					keepDefaultValues: false,
				});
			}
		});
	}, [reset]);

	// Autosave debounced 2s
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const triggerAutosave = useCallback((values: Partial<ClientFormValues>) => {
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => {
			saveDraftAction(values);
		}, 2000);
	}, []);

	useEffect(() => {
		const sub = watch((v) => triggerAutosave(v as Partial<ClientFormValues>));
		return () => {
			sub.unsubscribe();
			if (saveTimer.current) clearTimeout(saveTimer.current);
		};
	}, [watch, triggerAutosave]);

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
			clearFormDraft();
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
				className="flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors w-fit py-6"
			>
				<ArrowLeft size={16} />
				<span className="text-sm">Вернуться в дашборд</span>
			</Link>
		</div>
	);
};
