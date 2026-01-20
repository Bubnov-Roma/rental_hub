"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";
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
	const supabase = createClient();
	const router = useRouter();

	const handleSignOut = async () => {
		setIsOpen(false);
		setIsPending(true);
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			await signOutAction();
			setDirty(false);
			setIsOpen(false);
			router.push("/");
			router.refresh();
		} catch (error) {
			if (error instanceof Error && error.message === "NEXT_REDIRECT") {
				console.error(error);
			}
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
					className={cn("gap-3 transition-all active:scale-95", className)}
				>
					<LogOut size={18} className={cn(isPending && "animate-spin")} />
					{showText && (isPending ? "Выход..." : "Выйти")}
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
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
					<AlertDialogTitle className="text-2xl font-bold text-white">
						{isDirty ? "Есть изменения" : "Уже уходите?"}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-white/50 text-base leading-relaxed">
						{isDirty
							? "У вас остались несохраненные правки. Если выйдете сейчас, они исчезнут навсегда."
							: "Вы уверены, что хотите завершить сеанс? Мы будем ждать вашего возвращения."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="mt-8 gap-3">
					<AlertDialogCancel asChild>
						<Button
							variant="ghost"
							className="rounded-2xl px-6 h-10 text-white/70 hover:text-white/90 hover:bg-white/5"
						>
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
									? "bg-orange-500 hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
									: "bg-red-700/30 text-red/70 hover:text-red hover:bg-red/5 shadow-[0_0_-20px_rgba(239,8,8,0.3)]"
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
