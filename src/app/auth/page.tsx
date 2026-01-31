import Link from "next/link";
import { Suspense } from "react";
import { AuthFormController } from "@/components/auth/AuthFormController";
import { RainbowSpinner } from "@/components/shared";

export default async function AuthPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const view = (params.view as string) || "contact";
	const mode = (params.mode as string) || "login";
	return (
		<div className="container flex min-h-screen w-full max-w-full justify-center py-12">
			<div className="w-full max-w-lg space-y-8">
				<div className="text-center">
					<Link
						href="/"
						className="text-2xl font-bold text-primary transition-colors hover:text-primary/80"
					>
						Linza
					</Link>
					<h1 className="mt-2 text-3xl font-extrabold text-foreground">
						{view === "forgot" && "Восстановить доступ"}
						{view === "contact" && "Войти"}
						{view === "otp" && "Введите код"}
					</h1>
				</div>

				<div className="glass-card p-8 rounded-2xl shadow-xl">
					<Suspense
						fallback={
							<div className="h-64 flex items-center justify-center">
								<RainbowSpinner />
							</div>
						}
					>
						<AuthFormController view={view} mode={mode} />
					</Suspense>
				</div>

				{view === "contact" && (
					<p className="text-center text-xs text-foreground/70">
						Нажимая «Продолжить», вы соглашаетесь с <br />
						<Link href="/terms" className="underline hover:text-primary">
							Условиями использования
						</Link>
					</p>
				)}
			</div>
		</div>
	);
}
