"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth";
import { getErrorMessage } from "@/utils/error-handler";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			await resetPassword(email);
			setSuccess(true);
		} catch (err) {
			setError(getErrorMessage(err) || "Произошла ошибка");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container flex min-h-screen items-center justify-center py-12">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/" className="inline-flex items-center gap-2">
						<span className="text-2xl font-bold text-blue-600">RentalHub</span>
					</Link>
					<h1 className="mt-4 text-2xl font-bold">Восстановление пароля</h1>
					<p className="mt-2 text-gray-600">
						{success ? "Проверьте свою почту" : "Введите email, указанный при регистрации"}
					</p>
				</div>

				{success ? (
					<div className="space-y-4 rounded-lg bg-green-50 p-6">
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
								<Mail className="h-6 w-6 text-green-600" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900">Проверьте вашу почту</h3>
							<p className="mt-2 text-gray-600">
								Мы отправили ссылку для сброса пароля на адрес{" "}
								<span className="font-medium">{email}</span>
							</p>
							<p className="mt-2 text-sm text-gray-500">
								Если письмо не пришло, проверьте папку «Спам»
							</p>
						</div>
						<Button className="w-full" onClick={() => router.push("/auth/login")}>
							Вернуться к входу
						</Button>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="rounded-lg bg-red-50 p-4">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}

						<div>
							<Label htmlFor="email">Email</Label>
							<div className="relative mt-1">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									id="email"
									type="email"
									placeholder="email@example.com"
									className="pl-10"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
							) : (
								"Отправить ссылку"
							)}
						</Button>
					</form>
				)}

				<div className="mt-6 text-center">
					<Link
						href="/auth/login"
						className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
					>
						<ArrowLeft className="h-4 w-4" />
						Вернуться к входу
					</Link>
				</div>
			</div>
		</div>
	);
}
