"use client";

import { Camera, Menu, X } from "lucide-react";
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
		<header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Login */}
					<Link href="/" className="flex items-center gap-2">
						<Camera className="h-8 w-8 text-blue-600" />
						<span className="text-xl font-bold">RentalHub</span>
					</Link>

					{/* For desktop */}
					<nav className="hidden md:flex items-center gap-8">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
							>
								{item.label}
							</Link>
						))}
					</nav>

					{/* Sidebar for mobile */}
					<div className="md:hidden">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>

						{isMenuOpen && (
							<div className="fixed inset-0 top-16 z-50 bg-white">
								<div className="flex flex-col p-6 space-y-4">
									{navItems.map((item) => (
										<Link
											key={item.href}
											href={item.href}
											className="py-3 text-lg font-medium text-gray-900 hover:text-blue-600"
											onClick={() => setIsMenuOpen(false)}
										>
											{item.label}
										</Link>
									))}
									<div className="pt-4 border-t">
										<UserMenu />
									</div>
								</div>
							</div>
						)}
					</div>

					{/* User profile */}
					<div className="hidden md:block">
						<UserMenu />
					</div>
				</div>
			</div>
		</header>
	);
}
