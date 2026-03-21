"use client";
import type { ApplicationStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateApplicationStatusAction } from "@/actions/client-application-actions";
import { Input } from "@/components/ui";
import { VERIFICATION_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";

const APP_STATUSES_CHANGEABLE = [
	"PENDING",
	"REVIEWING",
	"CLARIFICATION",
	"APPROVED",
	"STANDARD",
	"REJECTED",
] as const;

export function StatusChanger({
	applicationId,
	currentStatus,
	onUpdate,
}: {
	applicationId: string;
	currentStatus: string;
	onUpdate: (s: string) => void;
}) {
	const [rejectionReason, setRejectionReason] = useState("");
	const [isPending, startTransition] = useTransition();

	const handleChange = (newStatus: ApplicationStatus) => {
		startTransition(async () => {
			const result = await updateApplicationStatusAction(
				applicationId,
				newStatus,
				newStatus === "REJECTED" ? rejectionReason : undefined
			);
			if (!result.success) {
				toast.error(result.error);
			} else {
				toast.success(
					`Статус → ${VERIFICATION_CONFIG[newStatus]?.label ?? newStatus}`
				);
				onUpdate(newStatus);
			}
		});
	};

	return (
		<div className="space-y-2">
			<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
				Изменить статус
			</p>
			<div className="flex flex-wrap gap-1.5">
				{APP_STATUSES_CHANGEABLE.filter((s) => s !== currentStatus).map((s) => (
					<button
						key={s}
						type="button"
						disabled={isPending}
						onClick={() => handleChange(s)}
						className={cn(
							"text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-40 hover:opacity-80",
							VERIFICATION_CONFIG[s]?.color
						)}
					>
						{VERIFICATION_CONFIG[s]?.label ?? s}
					</button>
				))}
			</div>
			<Input
				value={rejectionReason}
				onChange={(e) => setRejectionReason(e.target.value)}
				placeholder='Причина (для статуса "Отклонено")'
				className="h-8 text-xs"
			/>
		</div>
	);
}
