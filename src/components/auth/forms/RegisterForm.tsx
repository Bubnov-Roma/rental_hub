"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Input, Label } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/utils";
import { AuthCard } from "../AuthCard";

export function RegisterForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const handleRegister = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) throw error;

			if (data.session) {
				toast.success("Вы успешно зарегистрировались!");
				router.push("/dashboard");
			} else {
				toast.success("Проверьте почту для подтверждения аккаунта");
				router.push("/auth?view=contact");
			}
		} catch (err) {
			toast.error(getErrorMessage(err) || "Ошибка регистрации");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthCard
			title="Регистрация"
			description="Присоединяйтесь к Linza"
			footerLink={{
				text: "Уже есть аккаунт?",
				label: "Войти",
				href: "/auth?view=login",
			}}
			isLoading={isLoading}
		>
			<form onSubmit={handleRegister} className="space-y-4">
				<div className="space-y-2">
					<Label>Email</Label>
					<div className="relative">
						<Mail className="z-1 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="email"
							placeholder="name@example.com"
							className="pl-10 h-11 bg-white/5"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
				</div>
				<div className="space-y-2">
					<Label>Пароль</Label>
					<div className="relative">
						<Lock className="z-1 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="password"
							placeholder="Придумайте пароль (мин. 6 символов)"
							className="pl-10 h-11 bg-white/5"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={6}
						/>
					</div>
				</div>

				<Button
					type="submit"
					className="w-full h-11 font-bold shadow-lg shadow-primary/20"
				>
					Зарегистрироваться
				</Button>
			</form>
		</AuthCard>
	);
}
