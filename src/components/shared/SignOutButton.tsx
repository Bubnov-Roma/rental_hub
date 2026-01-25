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
	Button,
} from "@/components/ui";
import { useUnsavedChanges } from "@/store";
import { cn } from "@/utils";

interface SignOutButtonProps {
	className?: string;
	showText?: boolean;
}

export function SignOutButton({
	className,
	showText = true,
}: SignOutButtonProps) {
	const [isPending, setIsPending] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const { isDirty, setDirty } = useUnsavedChanges();

	const handleSignOut = async () => {
		setIsOpen(false);
		setIsPending(true);
		try {
			const result = await signOutAction();
			if (result?.success) {
				setDirty(false);
				window.location.href = "/";
			} else {
				toast.error(result?.error || "Ошибка при выходе");
				setIsPending(false);
			}
		} catch (error) {
			console.error(error);
			setIsPending(false);
			toast.success("Вы успешно разлогинились");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					disabled={isPending}
					className={cn(
						"gap-4 rounded-md transition-all active:scale-95 flex justify-start hover:bg-red-500/30 hover:text-foreground",
						className
					)}
				>
					<LogOut size={18} className={cn(isPending && "animate-spin")} />
					{showText && (isPending ? "Выход..." : "Выйти")}
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className="glass-card">
				<AlertDialogHeader className="space-y-3">
					<div
						className={cn(
							"w-12 h-12 rounded-2xl flex items-center justify-center mb-2 mx-auto sm:mx-0",
							isDirty
								? "bg-orange-500/20 text-orange-400"
								: "bg-red-500/20 text-red-400"
						)}
					>
						<LogOut size={24} />
					</div>
					<AlertDialogTitle className="text-2xl font-bold">
						{isDirty ? "Есть изменения" : "Уже уходите?"}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-base leading-relaxed">
						{isDirty
							? "У вас остались несохраненные правки. Если выйдете сейчас, они исчезнут навсегда."
							: "Вы уверены, что хотите завершить сеанс? Мы будем ждать вашего возвращения."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="mt-8 gap-3">
					<AlertDialogCancel asChild>
						<Button variant="ghost" className="rounded-2xl px-6 h-10">
							Отмена
						</Button>
					</AlertDialogCancel>

					<AlertDialogAction asChild>
						<Button
							variant="ghost"
							onClick={(e) => {
								e.preventDefault();
								handleSignOut();
							}}
							className={cn(
								"rounded-2xl px-6 h-10 transition-all",
								isDirty
									? "bg-red-500 hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
									: "hover:bg-red-700/70 hover:shadow-[0_0_-20px_rgba(239,8,8,3)] hover:text-white"
							)}
							disabled={isPending}
						>
							{isDirty ? "Все равно выйти" : "Выйти"}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
