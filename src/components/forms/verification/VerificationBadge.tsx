"use client";

import { ValidatedTextarea } from "@/components/forms/shared";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { VERIFICATION_CONFIG as config } from "@/constants";
import { useApplicationStore } from "@/store";
import { cn } from "@/utils";

interface Props {
	isClientPartner?: boolean;
}

export const VerificationBadge: React.FC<Props> = ({
	isClientPartner = false,
}) => {
	const status = useApplicationStore((state) => state.status);

	const current = config[status] || config.pending;

	const IconComponent = current.icon;
	return (
		<Dialog>
			<form>
				<DialogTrigger asChild>
					<div
						className={cn(
							"flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500",
							current.bg,
							current.border
						)}
					>
						<current.icon className={cn("w-4 h-4", current.color)} />
						<span
							className={cn(
								"text-[10px] font-bold uppercase tracking-widest",
								current.color
							)}
						>
							{isClientPartner ? "Partner" : current.title}
						</span>
					</div>
				</DialogTrigger>
				<DialogContent
					className={cn(
						"glass items-center justify-center text-center flex-col transition-all rounded-2xl sm:max-w-106.25 backdrop-blur-xl",
						current.border,
						current.bg
					)}
				>
					<DialogHeader
						className={cn("flex items-center justify-center text-center")}
					>
						<DialogTitle>{current.title}</DialogTitle>
						<DialogDescription
							className={cn("flex items-center justify-center text-center")}
						>
							{current.desc}
						</DialogDescription>
					</DialogHeader>
					<div className={cn("flex-col items-center justify-center w-full")}>
						<div
							className={cn(
								"z-10 flex items-center justify-center",
								status === "loading" ? "" : current.glow,
								current.color
							)}
							style={{ willChange: "filter" }}
						>
							<IconComponent className={cn("w-20 h-20", current.color)} />
						</div>
						{status === "clarification" && (
							<>
								<ValidatedTextarea label="Поле для ответа" />
								<DialogFooter className={cn("flex justify-between w-full")}>
									{status === "clarification" && (
										<Button size="xs" type="submit">
											Отправить
										</Button>
									)}
								</DialogFooter>
							</>
						)}
					</div>
				</DialogContent>
			</form>
		</Dialog>
	);
};
