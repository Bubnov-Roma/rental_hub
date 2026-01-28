"use client";

import { Check, Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	type FieldErrors,
	useFieldArray,
	useFormContext,
} from "react-hook-form";
import { toast } from "sonner";
import { FormRadioGroup } from "@/components/forms/shared";
import { ValidatedInput } from "@/components/forms/shared/ValidatedInput";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAX_LINKS_PER_PLATFORM, SOCIAL_OPTIONS } from "@/constants";
import {
	type ClientFormValues,
	type IndividualClient,
	type SocialPlatform,
	socialMediaSchema,
} from "@/schemas";

type SocialsFormValues = ClientFormValues & {
	temp_platform_selector: string;
};

export const SocialsSection = () => {
	const {
		control,
		setValue,
		formState: { errors },
	} = useFormContext<SocialsFormValues>();

	const { fields, append, remove, update } = useFieldArray({
		control,
		name: "applicationData.contacts.socials",
	});

	const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | "">(
		""
	);
	const [inputValue, setInputValue] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const indErrors = errors as FieldErrors<IndividualClient>;
	const socialsError = indErrors.applicationData?.contacts?.socials;
	const arrayErrorMessage =
		typeof socialsError?.message === "string" ? socialsError.message : "";

	useEffect(() => {
		if (selectedPlatform && inputRef.current) {
			inputRef.current.focus();
		}
	}, [selectedPlatform]);

	const mappedOptions = useMemo(
		() =>
			SOCIAL_OPTIONS.map((opt) => ({
				...opt,
				badgeCount: fields.filter((f) => f.platform === opt.id).length,
			})),
		[fields]
	);

	const activeOption = useMemo(
		() => SOCIAL_OPTIONS.find((opt) => opt.id === selectedPlatform),
		[selectedPlatform]
	);

	const validateCurrentInput = (platform: string, value: string) => {
		const trimmedValue = value.trim();
		if (!trimmedValue) {
			setLocalError(null);
			return;
		}

		const result = socialMediaSchema.safeParse({ platform, url: trimmedValue });

		if (!result.success) {
			setLocalError(result.error.issues[0]?.message || "Некорректный формат");
		} else {
			setLocalError(null);
		}
	};

	const handleAddOrUpdate = async () => {
		const validation = socialMediaSchema.safeParse({
			platform: selectedPlatform,
			url: inputValue,
		});

		if (!validation.success) {
			setLocalError(
				validation.error.issues[0]?.message || "Некорректный формат"
			);
			return;
		}

		const currentPlatformLinks = fields.filter(
			(f) => f.platform === selectedPlatform
		);

		if (!selectedPlatform || inputValue.length < 2) return;
		if (
			editingIndex === null &&
			currentPlatformLinks.length >= MAX_LINKS_PER_PLATFORM
		) {
			toast.info(`Лимит достигнут`, {
				description: `Вы добавили максимольное колличество ссылок для ${activeOption?.label || selectedPlatform}`,
			});
			return;
		}

		if (editingIndex !== null) {
			update(editingIndex, { platform: selectedPlatform, url: inputValue });
			toast.success(`Ссылка ${inputValue} успешно обновлена`);
			setEditingIndex(null);
		} else {
			append(validation.data);
			toast.success(
				`Профиль ${activeOption?.label} - ${inputValue} успешно добавлен`
			);
		}
		setInputValue("");
		setLocalError(null);
	};

	return (
		<div
			ref={containerRef}
			className="space-y-6 h-full flex  justify-between flex-col"
		>
			<FormRadioGroup
				required={true}
				name="temp_platform_selector"
				options={mappedOptions}
				label="Ваши соцсети"
				onValueChange={(val) => {
					setSelectedPlatform(val as SocialPlatform);
					setEditingIndex(null);
					setInputValue("");
				}}
				externalError={arrayErrorMessage}
				renderExtra={(option, labelContent) => {
					const links = fields
						.map((f, idx) => ({ ...f, originalIndex: idx }))
						.filter((f) => f.platform === option.id);

					if (links.length === 0) return labelContent;

					return (
						<DropdownMenu
							onOpenChange={(open) => {
								if (open) {
									setSelectedPlatform(option.id as SocialPlatform);
									setValue("temp_platform_selector", option.id);
								}
							}}
						>
							<DropdownMenuTrigger asChild>
								<div className="outline-none">{labelContent}</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="w-full border-white/10 backdrop-blur-xl rounded-xl p-1 shadow-2xl"
							>
								{links.length < MAX_LINKS_PER_PLATFORM && (
									<>
										<DropdownMenuItem
											className="gap-2 focus:bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase cursor-pointer"
											disabled={links.length >= MAX_LINKS_PER_PLATFORM}
											onClick={() => {
												setSelectedPlatform(option.id as SocialPlatform);
												inputRef.current?.focus();
											}}
										>
											<Plus className="w-3 h-3" />
											Добавить профиль
										</DropdownMenuItem>
										<DropdownMenuSeparator className="bg-foreground/2" />
									</>
								)}
								{links.map((link) => (
									<DropdownMenuItem
										key={link.id}
										className="flex justify-between focus:bg-foreground/5 py-2"
									>
										<span className="text-xs text-foreground truncate mr-2">
											{link.url}
										</span>
										<div className="flex gap-1">
											<button
												type="button"
												onClick={() => {
													setEditingIndex(link.originalIndex);
													setInputValue(link.url);
													setSelectedPlatform(option.id as SocialPlatform);
												}}
												className="p-1 hover:text-sky-300 transition-colors"
											>
												<Edit3 className="w-3 h-3" />
											</button>
											<button
												type="button"
												onClick={() => {
													remove(link.originalIndex);
													toast.info(
														`Профиль ${link.platform} - ${link.url} успешно удален`
													);
												}}
												className="p-1 hover:text-red-400 transition-colors"
											>
												<Trash2 className="w-3 h-3" />
											</button>
										</div>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				}}
			/>

			<div className="flex gap-2 items-end h-auto">
				<div className="flex-1">
					<ValidatedInput
						ref={inputRef}
						label={
							selectedPlatform
								? `Ссылка: ${selectedPlatform}`
								: "Выберите соцсеть"
						}
						value={inputValue}
						error={localError ?? ""}
						onChange={(e) => {
							const val = e.target.value;
							setInputValue(val);
							if (selectedPlatform) validateCurrentInput(selectedPlatform, val);
						}}
						placeholder={activeOption?.placeholder || "Выберите платформу"}
						disabled={!selectedPlatform}
						onKeyDown={(e) => e.key === "Enter" && handleAddOrUpdate()}
					/>
				</div>
				<Button
					variant="neumorph"
					onClick={handleAddOrUpdate}
					disabled={!selectedPlatform || inputValue.length < 2}
					className={`w-11 h-11 mb-5 rounded-xl flex items-center justify-center transition-all`}
				>
					{editingIndex !== null ? <Check /> : <Plus />}
				</Button>
			</div>
		</div>
	);
};
