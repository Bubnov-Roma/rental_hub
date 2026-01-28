"use client";

import { motion } from "framer-motion";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { FormFieldWrapper } from "@/components/forms/shared/FormFieldWrapper";

interface CheckboxOption {
	id: string;
	label: string;
	color?: string;
}

interface FormCheckboxGroupProps {
	name: string;
	options: readonly CheckboxOption[];
	label: string;
	gridClassName?: string;
	required?: boolean;
	externalError?: string;
}

export const FormCheckboxGroup = ({
	name,
	options,
	label,
	externalError,
	required = false,
}: FormCheckboxGroupProps) => {
	const { setValue, control } = useFormContext();
	const selectedValues = useWatch({ control, name, defaultValue: [] }) || [];
	const { fieldState } = useController({ name, control });
	const displayError = externalError || fieldState.error?.message;

	const handleChange = (id: string, checked: boolean) => {
		const nextValue = checked
			? [...selectedValues, id]
			: selectedValues.filter((v: string) => v !== id);
		setValue(name, nextValue, { shouldValidate: true });
	};

	return (
		<div className="space-y-2">
			<FormFieldWrapper
				required={required}
				label={label}
				error={displayError ?? ""}
				topErrorPosition={true}
			>
				<div className="flex flex-wrap gap-2 justify-center">
					{options.map((item) => {
						const isChecked = selectedValues.includes(item.id);
						const brandColor = item.color || "#60a5fa";

						return (
							<motion.label
								key={item.id}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className={`
                relative group/box cursor-pointer px-4 py-2.5 rounded-2xl border transition-all duration-300
                flex items-center gap-3 overflow-hidden hover:border-border/20 shadow-xs hover:shadow-md
                ${
									isChecked
										? "bg-white/20 border-border drop-shadow-2xl shadow-md"
										: "bg-transparent/50 border-border/10"
								}
              `}
							>
								{/* Фоновый цветной блик при наведении или выборе */}
								<div
									className="absolute inset-0 opacity-5 group-hover/box:opacity-5 group-active/box:opacity-20 transition-opacity duration-200"
									style={{ backgroundColor: brandColor }}
								/>

								{/* Индикатор-точка с неоновым свечением */}
								<div
									className={`w-2 h-2 rounded-full transition-all duration-500 ${
										isChecked ? "scale-125" : "scale-100 opacity-30"
									}`}
									style={{
										backgroundColor: brandColor,
										boxShadow: isChecked
											? `0 0 10px ${brandColor}, 0 0 30px #0e0e0e`
											: "none",
									}}
								/>

								<input
									type="checkbox"
									className="hidden"
									checked={isChecked}
									onChange={(e) => handleChange(item.id, e.target.checked)}
								/>

								<span
									className={`text-[11px] font-bold uppercase tracking-widest transition-colors group-hover/box:text-foreground ${
										isChecked ? "text-foreground" : "text-foreground/50"
									}`}
								>
									{item.label}
								</span>

								{/* Маленький "световой импульс" при выборе */}
								{isChecked && (
									<motion.div
										layoutId={`glow-${item.id}`}
										className="absolute bottom-0 left-0 right-0 h-0.5"
										style={{ backgroundColor: brandColor }}
									/>
								)}
							</motion.label>
						);
					})}
				</div>
			</FormFieldWrapper>
		</div>
	);
};
