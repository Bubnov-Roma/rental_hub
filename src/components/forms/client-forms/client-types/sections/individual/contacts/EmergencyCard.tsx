import { motion } from "framer-motion";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormFieldWrapper } from "@/components/forms/shared/FormFieldWrapper";
import { PhoneInput } from "@/components/forms/shared/PhoneInput";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	InputGroup,
	InputGroupButton,
	InputGroupItem,
	type InputGroupOrientation,
	InputGroupWrapper,
} from "@/components/ui/input-group";
import { RELATION_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";
import type { ClientFormValues } from "@/schemas";

interface EmergencyCardProps {
	index: number;
	orientation?: InputGroupOrientation;
}

export const EmergencyCard = ({
	index,
	orientation = "horizontal",
}: EmergencyCardProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const { register, setValue, control, formState } =
		useFormContext<ClientFormValues>();

	const prefix = `applicationData.contacts.emergency`;

	const nameError = control.getFieldState(
		`${prefix}.${index}.name`,
		formState
	).error;

	const phoneError = control.getFieldState(
		`${prefix}.${index}.phone`,
		formState
	).error;

	const relationId = useWatch({
		control,
		name: `${prefix}.${index}.relation`,
	});

	const selectedRelation =
		RELATION_OPTIONS.find((o) => o.id === relationId) || RELATION_OPTIONS[0];

	const Icon = selectedRelation.icon;
	const accentColor = selectedRelation.color;

	const { ref: nameRef, ...nameRegister } = register(`${prefix}.${index}.name`);

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			className="relative group/em"
		>
			<div
				className={cn(
					"relative overflow-hidden shadow-accent-2xl transition-all duration-500",
					`bg-${accentColor} backdrop-blur-xl rounded-xl p-4`
				)}
			>
				<div
					className={cn("absolute w-full h-full right-0 top-0")}
					style={{ boxShadow: `0 8px 32px 0 ${accentColor}`, opacity: 0.5 }}
				/>
				<div className="space-y-4">
					<FormFieldWrapper
						label="Контактная информация"
						error={nameError?.message || phoneError?.message || ""}
						required
					>
						<InputGroup orientation={orientation}>
							<InputGroupWrapper orientation="horizontal">
								<DropdownMenu onOpenChange={setIsMenuOpen}>
									<DropdownMenuTrigger asChild>
										<InputGroupButton
											type="button"
											corners={{ tl: true, tr: false, bl: false, br: false }}
											className={cn(
												"px-3 cursor-pointer active:drop-shadow-md hover:bg-white/10 hover:shadow-md transition-colors flex items-center justify-center",
												nameError && "border-red-400/50"
											)}
										>
											<Icon
												className="w-5 h-5 transition-opacity"
												style={{
													color: accentColor,
													opacity: isMenuOpen ? 1 : 0.8,
												}}
											/>
										</InputGroupButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										side="right"
										align="start"
										className="backdrop-blur-md border-border/10 text-foreground rounded-xl p-1"
									>
										{RELATION_OPTIONS.map((opt) => (
											<DropdownMenuItem
												key={opt.id}
												onClick={() =>
													setValue(
														`applicationData.contacts.emergency.${index}.relation`,
														opt.id
													)
												}
												className="flex items-center gap-3 focus:bg-foreground/10 cursor-pointer rounded-lg px-3 py-2"
											>
												<opt.icon
													className="w-4 h-4"
													style={{ color: opt.color }}
												/>
												<span className="text-xs uppercase font-medium">
													{opt.label}
												</span>
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
								{/* Имя */}
								<InputGroupItem
									{...nameRegister}
									ref={nameRef}
									position="top"
									corners={{ tl: false, tr: true, bl: false, br: false }}
									placeholder="Иван Петров"
									onChange={(e) => {
										setValue(
											`applicationData.contacts.emergency.${index}.name`,
											e.target.value,
											{ shouldValidate: true }
										);
									}}
									className={cn(nameError && "border-red-400/50")}
								/>
							</InputGroupWrapper>
							<PhoneInput
								name={`applicationData.contacts.emergency.${index}.phone`}
								standalone={false}
								corners={{ tl: false, tr: false, bl: true, br: true }}
							/>
						</InputGroup>
					</FormFieldWrapper>
				</div>
			</div>
		</motion.div>
	);
};
