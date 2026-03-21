"use client";

import { CircleNotchIcon } from "@phosphor-icons/react";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Input,
} from "@/components/ui";

export function AuthModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSent, setIsSent] = useState(false);

	const handleMagicLink = async () => {
		if (!email.includes("@")) {
			toast.error("Введите корректный email");
			return;
		}

		setIsLoading(true);
		// signIn вернет { error, ok } без редиректа
		const res = await signIn("nodemailer", { email, redirect: false });
		setIsLoading(false);

		if (res?.error) {
			toast.error("Ошибка при отправке ссылки");
		} else {
			setIsSent(true);
			toast.success("Ссылка отправлена!");
		}
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		await signIn("google", { callbackUrl: "/dashboard" });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-2xl space-y-4">
				<DialogHeader>
					<DialogTitle className="text-xl font-black uppercase italic">
						Войдите для бронирования
					</DialogTitle>
					<DialogDescription>
						{isSent ? "Проверьте вашу почту" : "Выберите удобный способ входа"}
					</DialogDescription>
				</DialogHeader>

				{!isSent ? (
					<div className="space-y-4">
						<Button
							variant="social"
							className="w-full h-12 gap-2"
							onClick={handleGoogleLogin}
							disabled={isLoading}
						>
							Вход с{" "}
							<Image
								src="https://www.svgrepo.com/show/475656/google-color.svg"
								width={18}
								height={18}
								alt="Google"
							/>{" "}
							Google
						</Button>

						<div className="relative">
							<EnvelopeSimpleIcon
								size={15}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
							/>
							<Input
								placeholder="your@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
								className="pl-9 h-12 rounded-xl"
								disabled={isLoading}
							/>
						</div>
						<Button
							onClick={handleMagicLink}
							disabled={isLoading || !email}
							className="w-full h-12 rounded-2xl font-black uppercase italic"
						>
							{isLoading ? (
								<CircleNotchIcon className="animate-spin" />
							) : (
								"Получить ссылку на вход"
							)}
						</Button>
					</div>
				) : (
					<div className="text-center py-6 space-y-2">
						<p className="text-sm">
							Ссылка для входа отправлена на{" "}
							<span className="font-bold">{email}</span>
						</p>
						<p className="text-xs text-muted-foreground">
							Нажмите на нее, чтобы безопасно войти.
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
