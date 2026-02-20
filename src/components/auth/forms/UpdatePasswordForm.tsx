"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/utils";

export function UpdatePasswordForm() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const handleUpdatePassword = async (e: React.SubmitEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Пароли не совпадают");
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) throw error;

			// Редирект на Success View вместо Dashboard
			router.push("/auth?view=success&redirect=/dashboard");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Ошибка обновления пароля");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthCard
			title="Новый пароль"
			description="Придумайте сложный пароль"
			isLoading={isLoading}
		>
			<form onSubmit={handleUpdatePassword} className="space-y-4">
				<div className="space-y-2">
					<Label>Новый пароль</Label>
					<div className="relative">
						<Lock className="z-1 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="password"
							placeholder="••••••••"
							className="pl-10 h-11 bg-white/5"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={6}
						/>
					</div>
				</div>
				<div className="space-y-2">
					<Label>Повторите пароль</Label>
					<div className="relative">
						<Lock className="z-1 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="password"
							placeholder="••••••••"
							className="pl-10 h-11 bg-white/5"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							minLength={6}
						/>
					</div>
				</div>

				<Button
					type="submit"
					disabled={isLoading}
					className="w-full h-11 font-bold shadow-lg shadow-primary/20"
				>
					Обновить пароль
				</Button>
			</form>
		</AuthCard>
	);
}
