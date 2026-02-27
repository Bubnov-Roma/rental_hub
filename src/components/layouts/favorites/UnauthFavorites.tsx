"use client";

import { motion } from "framer-motion";
import { BookMarked, Heart, Layers, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function UnauthFavorites() {
	return (
		<div className="min-h-[70vh] flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="max-w-md w-full text-center space-y-8"
			>
				{/* Icon cluster */}
				<div className="relative flex items-center justify-center h-32">
					<motion.div
						animate={{ y: [0, -6, 0] }}
						transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
						className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/10"
					>
						<Heart size={36} className="text-primary fill-primary/30" />
					</motion.div>
					<motion.div
						animate={{ y: [0, 5, 0] }}
						transition={{
							duration: 3.5,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.3,
						}}
						className="absolute -right-2 top-4 w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center"
					>
						<Layers size={20} className="text-muted-foreground" />
					</motion.div>
					<motion.div
						animate={{ y: [0, -4, 0] }}
						transition={{
							duration: 2.8,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.6,
						}}
						className="absolute -left-2 bottom-4 w-10 h-10 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center"
					>
						<BookMarked size={16} className="text-muted-foreground" />
					</motion.div>
				</div>

				{/* Text */}
				<div className="space-y-3">
					<h1 className="text-3xl font-black tracking-tight uppercase italic">
						Избранное
					</h1>
					<p className="text-muted-foreground leading-relaxed">
						Сохраняйте технику в избранное и собирайте готовые сеты для любимых
						сценариев съёмок.
					</p>
				</div>

				{/* Features */}
				<div className="grid grid-cols-1 gap-2 text-left">
					{[
						{ icon: Heart, text: "Сохраняйте понравившуюся технику" },
						{ icon: Layers, text: "Создавайте наборы для разных сценариев" },
						{
							icon: Sparkles,
							text: "Добавляйте весь сет в корзину одним кликом",
						},
					].map(({ icon: Icon, text }) => (
						<div
							key={text}
							className="flex items-center gap-3 px-4 py-3 rounded-xl bg-foreground/3 border border-foreground/5"
						>
							<div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
								<Icon size={14} className="text-primary" />
							</div>
							<span className="text-sm text-muted-foreground">{text}</span>
						</div>
					))}
				</div>

				{/* CTA */}
				<div className="flex flex-col sm:flex-row gap-3">
					<Button asChild className="flex-1 rounded-xl gap-2 h-11">
						<Link href="/auth">
							<LogIn size={16} />
							Войти / Зарегистрироваться
						</Link>
					</Button>
					<Button asChild variant="outline" className="flex-1 rounded-xl h-11">
						<Link href="/equipment">Смотреть каталог</Link>
					</Button>
				</div>
			</motion.div>
		</div>
	);
}
