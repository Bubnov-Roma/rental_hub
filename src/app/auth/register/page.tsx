import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/forms/AuthForm";

export const metadata: Metadata = {
	title: "Регистрация | Rentacamera",
	description: "Создайте аккаунт для бронирования фото-видео оборудования",
};

export default function RegisterPage() {
	return (
		<div className="container flex min-h-screen items-center justify-center py-12">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/" className="inline-flex items-center gap-2">
						<span className="text-2xl font-bold text-blue-600">Rentacamera</span>
					</Link>
					<p className="mt-2 text-gray-600">Присоединяйтесь к сообществу профессионалов</p>
				</div>

				<AuthForm mode="register" />
			</div>
		</div>
	);
}
