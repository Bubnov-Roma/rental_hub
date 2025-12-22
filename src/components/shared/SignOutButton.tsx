"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signOutAction } from "@/app/actions/auth";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUnsavedChanges } from "@/state/use-unsaved-changes";
import { cn } from "@/utils/utils";

interface SignOutButtonProps {
	variant?: "ghost" | "outline" | "default" | "destructive";
	className?: string;
	showText?: boolean;
}

export function SignOutButton({
	variant = "ghost",
	className,
	showText = true,
}: SignOutButtonProps) {
	const [isPending, setIsPending] = useState(false);
	const { isDirty, setDirty } = useUnsavedChanges();

	const handleSignOut = async () => {
		try {
			setIsPending(true);
			await signOutAction();
			toast.success("Выход выполнен успешно");
			setDirty(false);
		} catch {
			toast.error("Не удалось выйти из системы");
			setIsPending(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant={variant}
					disabled={isPending}
					className={cn("justify-start", className)}
				>
					<LogOut
						className={cn(
							"h-4 w-4",
							showText && "mr-2",
							isPending && "animate-spin"
						)}
					/>
					{showText && (isPending ? "Выход..." : "Выйти")}
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isDirty ? "Несохраненные изменения" : "Подтвердите выход"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isDirty
							? "У вас есть несохраненные данные. Если вы выйдете сейчас, все изменения будут потеряны."
							: "Вы уверены, что хотите завершить текущую сессию?"}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							handleSignOut();
						}}
						className={cn(
							isDirty
								? "bg-orange-600 hover:bg-orange-700"
								: "bg-red-600 hover:bg-red-700"
						)}
						disabled={isPending}
					>
						{isDirty ? "Все равно выйти" : "Выйти"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
