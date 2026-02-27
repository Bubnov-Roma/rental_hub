"use client";

import { Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Button } from "@/components/ui";

interface CustomErrorPageProps {
	readonly title: string;
	readonly message: string;
	readonly children?: React.ReactNode;
	readonly reset?: () => void;
}

const GlobalErrorPage = ({ title, message, reset }: CustomErrorPageProps) => {
	const router = useRouter();

	const handleRetry = () => {
		if (reset) reset();
		else startTransition(() => router.refresh());
	};

	return (
		<div className="relative">
			<div className="absolute inset-0 bg-radial-[circle_at_top_right] from-(--error-bg-glow) to-transparent pointer-events-none transition-colors duration-1000  dark:opacity-20" />
			<div className="min-h-[80vh] flex items-center justify-center p-6 overflow-hidden">
				<div className="relative max-w-lg w-full">
					{/* 1. Динамическое свечение ПОД облачком */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-(--brand-glow) opacity-20 blur-[100px] rounded-full pointer-events-none" />

					{/* 2. Основной анимированный контейнер */}
					<div className="relative group animate-bounce-slow">
						{/* Мягкий цветной ореол, привязанный к движению */}
						<div className="absolute inset-0 bg-linear-to-tr from-pink-400/60 via-purple-400/30 to-primary/30 blur-[60px] rounded-[5rem] opacity-50 group-hover:opacity-80 transition-opacity duration-800" />

						{/* 3. Само Облачко */}
						<div className="relative overflow-hidden bg-linear-to-b from-white/80 via-white/40 to-white/10  dark:from-white/10 dark:via-black/40 dark:to-black/60 backdrop-blur-3xl rounded-[3.5rem] md:rounded-[6rem] px-10 md:px-15 py-20 md:py-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border-none flex flex-col items-center text-center space-y-10">
							<div className="space-y-6">
								{/* Заголовок с градиентом для эффекта объема */}
								<h2 className="text-[clamp(2rem,6vw,3rem)] font-bold bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70 leading-[1.1] tracking-tight  whitespace-pre-line">
									{title}
								</h2>
								<p className="text-[clamp(1rem,3.5vw,1rem)] text-muted-foreground/80 font-medium max-w-75 md:max-w-md mx-auto leading-relaxed  whitespace-pre-line">
									{message}
								</p>
							</div>

							{/* Кнопки */}
							<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
								<Button
									onClick={handleRetry}
									variant="glass"
									className="w-full sm:w-auto rounded-full px-10 py-7 h-auto text-base shadow-lg shadow-primary/10 transition-colors duration-300"
								>
									<RefreshCcw className="size-5" />
									Обновить
								</Button>
								<Button
									asChild
									variant="outline"
									className="w-full sm:w-auto rounded-full px-10 py-7 h-auto bg-white/30 dark:bg-white/5 border-none shadow-sm text-base hover:bg-background hover-dark:bg-foreground transition-colors duration-800"
								>
									<Link href="/">
										<Home className="size-5" />
										На главную
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GlobalErrorPage;
