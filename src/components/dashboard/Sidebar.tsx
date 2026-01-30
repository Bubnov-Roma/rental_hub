"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Fab } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { CLIENT_SIDEBAR_NAV_ITEMS as config } from "@/constants";
import { cn } from "@/utils";

export function Sidebar() {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(true);

	const { push } = useRouter();

	const fabItems = config.map((item) => ({
		id: item.href,
		icon: item.icon,
		label: item.name,
		badge: item?.badge || undefined,
		onClick: () => push(item.href),
		color:
			pathname === item.href
				? "text-primary border-primary/40 bg-primary/10"
				: "text-foreground hover:bg-foreground/5 hover:text-foreground",
	}));

	return (
		<>
			<div className="md:hidden">
				<Fab items={fabItems} mainIcon={<Menu />} />
			</div>
			<aside className="hidden md:block sticky top-0 h-screen w-20 z-40">
				<div
					className={cn(
						"absolute left-0 top-0 h-full transition-all duration-300 ease-in-out overflow-hidden shadow-2xl border-r border-foreground/10",
						"bg-card/40 backdrop-blur-xl rounded-r-2xl",
						collapsed ? "w-20" : "w-64"
					)}
				>
					<div className="flex h-full flex-col">
						<div className="flex items-center justify-center p-6 h-20 shrink-0">
							<Button
								variant="ghost"
								size="icon"
								className="hover:bg-primary/10 hover:text-primary transition-colors"
								onClick={() => setCollapsed(!collapsed)}
							>
								{collapsed ? (
									<ChevronRight className="w-5 h-5" />
								) : (
									<ChevronLeft className="w-5 h-5" />
								)}
							</Button>
						</div>

						{/* Навигация */}
						<nav className="flex-1 space-y-2 p-4">
							{config.map((item) => {
								const isActive = pathname.startsWith(item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"group flex items-center h-12 rounded-xl px-3 transition-all duration-300 relative",
											isActive && pathname === item.href
												? "bg-primary/20 text-primary shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]"
												: "text-foreground hover:bg-foreground/5 hover:text-foreground"
										)}
									>
										<item.icon
											className={cn(
												"h-5 w-5 shrink-0 transition-transform group-hover:scale-110"
											)}
										/>
										<div
											className={cn(
												"ml-3 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
												collapsed ? "w-0 opacity-0" : "w-40 opacity-100"
											)}
										>
											<span className="font-medium tracking-tight">
												{item.name}
											</span>
										</div>

										{item.badge && (
											<span
												className={cn(
													"absolute right-3 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground font-black transition-all duration-300",
													collapsed
														? "scale-0 opacity-0"
														: "scale-100 opacity-100"
												)}
											>
												{item.badge}
											</span>
										)}
									</Link>
								);
							})}
						</nav>
					</div>
				</div>
			</aside>
		</>
	);
}
