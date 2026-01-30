"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navItems = [
		{ href: "/equipment", label: "Каталог" },
		{ href: "/how-it-works", label: "Как это работает" },
		{ href: "/pricing", label: "Тарифы" },
	];

	return (
		<>
			<header className="header-glass">
				<div className="container mx-auto">
					<div className="flex h-20 items-center justify-between">
						{/* Logo */}
						<Link
							href="/"
							className="flex items-center gap-2.5 group relative z-60"
						>
							{/* <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_var(--brand-glow)]">
								<Camera className="h-6 w-6" />
							</div> */}
							<span className="text-xl font-black tracking-tight bg-clip-text text-foreground">
								Linza
							</span>
						</Link>
						{/* Desktop Nav */}
						<nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full z-50">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="px-5 py-2 text-sm font-semibold text-foreground/60 hover:text-foreground hover:scale-102 rounded-full transition-all"
								>
									{item.label}
								</Link>
							))}
						</nav>

						{/* Actions */}
						<div className="flex items-center gap-3 relative z-60">
							<div className="hidden md:block">
								<UserMenu />
							</div>
							{/* Mobile Toggle */}
							<Button
								variant="glass"
								size="icon"
								className="md:hidden rounded-xl size-10"
								onClick={() => setIsMenuOpen(!isMenuOpen)}
							>
								{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
							</Button>
						</div>
					</div>
				</div>
			</header>
			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="fixed inset-0 z-35 md:hidden bg-card/80 backdrop-blur-xl"
					>
						<div className="flex flex-col p-10 pt-24 space-y-8">
							{navItems.map((item, i) => (
								<Link
									key={item.href}
									href={item.href}
									style={{ transitionDelay: `${i * 50}ms` }}
									className="text-2xl font-bold text-foreground animate-in slide-in-from-left-8 fill-mode-both"
								>
									{item.label}
								</Link>
							))}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4 }}
								className="pt-8 border-t border-foreground/10"
							>
								<UserMenu />
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
