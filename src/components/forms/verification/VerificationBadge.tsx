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
	Tooltip,
	TooltipContent,
	TooltipTrigger,
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

	return (
		<Dialog>
			<form>
				<Tooltip key={current.title}>
					<TooltipTrigger asChild>
						<DialogTrigger asChild>
							<Button className={cn(current.bg, current.border)}>
								<current.icon
									className={cn("w-4 h-4 md:hidden", current.color)}
								/>
								<span
									className={cn(
										"hidden md:inline-block text-[10px] font-bold uppercase tracking-widest",
										current.color
									)}
								>
									{isClientPartner ? "Partner" : current.title}
								</span>
							</Button>
						</DialogTrigger>
					</TooltipTrigger>
					<TooltipContent className="md:hidden">{current.title}</TooltipContent>
				</Tooltip>
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
							className={cn(
								"flex items-center justify-center text-center whitespace-pre-line"
							)}
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
							<current.icon className={cn("w-20 h-20", current.color)} />
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
