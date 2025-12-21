import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/forms/AuthForm";

export const metadata: Metadata = {
	title: "Вход в аккаунт | Rentacamera",
	description: "Войдите в свой аккаунт для бронирования оборудования",
};

export default function LoginPage() {
	return (
		<div className="container flex min-h-screen items-center justify-center py-12">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/" className="inline-flex items-center gap-2">
						<span className="text-2xl font-bold text-blue-600">
							Rentacamera
						</span>
					</Link>
				</div>

				<AuthForm mode="login" />

				<div className="mt-8 text-center text-sm text-gray-600">
					<p>
						Нажимая «Войти», вы соглашаетесь с{" "}
						<Link href="/terms" className="text-blue-600 hover:underline">
							Условиями использования
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
