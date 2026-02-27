"use client";

import { CheckCircle2, Clock, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/utils";

export function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSent, setIsSent] = useState(false);
	const [cooldown, setCooldown] = useState(0); // Таймер в секундах
	const [userNotFound, setUserNotFound] = useState(false);

	const supabase = createClient();

	// Логика таймера
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (cooldown > 0) {
			interval = setInterval(() => {
				setCooldown((prev) => prev - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [cooldown]);

	const sendResetLink = async () => {
		setIsLoading(true);
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/callback?next=/auth?view=update-password`,
			});
			if (error) throw error;

			setIsSent(true);
			setCooldown(60); // Ставим таймер на 60 секунд
			toast.success("Ссылка отправлена!");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Ошибка отправки");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setUserNotFound(false);

		try {
			// 1. Проверяем, есть ли такой пользователь (Если у вас есть публичная таблица profiles/users)
			// Если таблицы нет, этот шаг можно пропустить, Supabase отправит "фейковый" успех.
			// const { data: userCheck, error: checkError } = await supabase
			// 	.from("profiles") // Замените на вашу таблицу с пользователями
			// 	.select("id")
			// 	.eq("email", email)
			// 	.maybeSingle();

			// Если таблица profiles закрыта RLS, checkError будет, игнорируем его и пробуем отправить
			// if (!checkError && !userCheck) {
			// 	setUserNotFound(true);
			// 	toast.error("Пользователь с такой почтой не найден");
			// 	setIsLoading(false);
			// 	return;
			// }

			// 2. Если пользователь есть (или мы не смогли проверить), отправляем
			await sendResetLink();
		} catch (error) {
			console.error(error);
			// В случае ошибки проверки все равно пробуем отправить, fail safe
			await sendResetLink();
		}
	};

	// Состояние: Пользователь не найден
	if (userNotFound) {
		return (
			<AuthCard
				title="Аккаунт не найден"
				description={`Мы не нашли пользователя с почтой ${email}`}
				footerLink={{
					text: "Ошиблись в написании?",
					label: "Попробовать снова",
					onClick: () => setUserNotFound(false),
					href: "#",
				}}
			>
				<div className="flex flex-col gap-4">
					<div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
						<p className="text-sm text-destructive font-medium mb-2">
							Хотите создать новый аккаунт?
						</p>
						<Button className="w-full" asChild>
							<Link href="/auth?view=register">
								<UserPlus className="w-4 h-4 mr-2" />
								Зарегистрироваться
							</Link>
						</Button>
					</div>
				</div>
			</AuthCard>
		);
	}

	// Состояние: Ссылка отправлена
	if (isSent) {
		return (
			<AuthCard
				title="Проверьте почту"
				description={`Мы отправили ссылку для сброса на ${email}`}
			>
				<div className="flex flex-col items-center space-y-6 py-4">
					<div className="relative">
						<div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
						<CheckCircle2
							size={64}
							className="relative text-primary animate-pulse"
						/>
					</div>

					<p className="text-center text-sm text-muted-foreground">
						Перейдите по ссылке в письме для создания нового пароля.
					</p>

					<div className="w-full space-y-3">
						<Button
							variant="outline"
							disabled={cooldown > 0 || isLoading}
							onClick={sendResetLink}
							className="w-full h-11 relative overflow-hidden"
						>
							{cooldown > 0 ? (
								<>
									<Clock className="w-4 h-4 mr-2 animate-pulse" />
									Отправить повторно через {cooldown} сек
								</>
							) : (
								"Отправить ссылку повторно"
							)}
						</Button>

						<Button
							variant="ghost"
							onClick={() => setIsSent(false)}
							className="w-full text-xs text-muted-foreground"
						>
							Ввести другой email
						</Button>
					</div>
				</div>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			title="Сброс пароля"
			description="Введите email для получения ссылки"
			footerLink={{
				text: "Вспомнили пароль?",
				label: "Войти",
				href: "/auth?view=login",
			}}
			isLoading={isLoading}
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label>Email</Label>
					<div className="relative">
						<Mail className="z-1 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="email"
							placeholder="name@example.com"
							className="pl-10"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
				</div>

				<Button
					type="submit"
					disabled={isLoading}
					className="w-full h-11 font-bold shadow-lg shadow-primary/20"
				>
					Отправить ссылку
				</Button>
			</form>
		</AuthCard>
	);
}
