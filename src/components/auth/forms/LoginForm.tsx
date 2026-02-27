"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Input, Label } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "../AuthCard";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const handlePasswordLogin = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				toast.error("Неверный email или пароль");
				return;
			}

			toast.success("С возвращением!");
			router.push("/dashboard");
		} catch {
			toast.error("Ошибка авторизации");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthCard
			title="С возвращением"
			description="Введите данные для входа в аккаунт"
			footerLink={{
				text: "Нет аккаунта?",
				label: "Зарегистрироваться",
				href: "/auth?view=register",
			}}
			isLoading={isLoading}
		>
			<div className="space-y-6">
				<form onSubmit={handlePasswordLogin} className="space-y-4">
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
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>Пароль</Label>
							<Link
								href="/auth?view=forgot"
								className="text-xs text-foreground hover:underline"
							>
								Забыли пароль?
							</Link>
						</div>
						<div className="relative">
							<Lock className="z-1 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="password"
								placeholder="••••••••"
								className="pl-10 h-11 bg-white/5"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</div>

					<Button
						type="submit"
						className="w-full h-11 font-bold shadow-lg shadow-primary/20"
					>
						Войти
					</Button>
				</form>

				<Button
					variant="ghost"
					className="w-full text-xs text-muted-foreground hover:text-foreground"
					onClick={() => router.push("/auth?view=otp-login")}
				>
					Войти по коду (без пароля)
				</Button>
			</div>
		</AuthCard>
	);
}
