"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { ValidatedInput } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema } from "@/schemas";
import { getErrorMessage } from "@/utils";

export function UpdatePasswordForm() {
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<{
		password?: string;
		confirmPassword?: string;
	}>({});
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const supabase = createClient();

	const handleUpdatePassword = async (e: React.SubmitEvent) => {
		e.preventDefault();

		const result = updatePasswordSchema.safeParse({
			password,
			confirmPassword,
		});

		if (!result.success) {
			const formattedErrors: Record<string, string> = {};
			result.error.issues.forEach((issue) => {
				formattedErrors[issue.path[0] as string] = issue.message;
			});
			setErrors(formattedErrors);
			return;
		}

		setErrors({});
		setIsLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) throw error;

			toast.success("Пароль успешно обновлен");
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
			<form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
				<ValidatedInput
					label="Новый пароль"
					type={showPassword ? "text" : "password"}
					placeholder="••••••••"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						if (errors.password)
							setErrors((prev) => ({ ...prev, password: "" }));
					}}
					error={errors.password ?? ""}
					icon={<Lock className="h-4 w-4" />}
					required
					suffix={
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="text-muted-foreground hover:text-foreground transition-colors p-1"
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					}
				/>

				<ValidatedInput
					label="Повторите пароль"
					type={showConfirmPassword ? "text" : "password"}
					placeholder="••••••••"
					value={confirmPassword}
					onChange={(e) => {
						setConfirmPassword(e.target.value);
						// Очищаем ошибку при вводе
						if (errors.confirmPassword)
							setErrors((prev) => ({ ...prev, confirmPassword: "" }));
					}}
					error={errors.confirmPassword ?? ""}
					icon={<Lock className="h-4 w-4" />}
					required
					suffix={
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="text-muted-foreground hover:text-foreground transition-colors p-1"
						>
							{showConfirmPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					}
				/>

				<Button
					type="submit"
					disabled={isLoading}
					className="w-full h-12 font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
				>
					{isLoading ? "Обновление..." : "Обновить пароль"}
				</Button>
			</form>
		</AuthCard>
	);
}
