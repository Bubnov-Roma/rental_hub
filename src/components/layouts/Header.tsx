"use client";

import { useQuery } from "@tanstack/react-query";
import {
	History,
	Loader2,
	PanelLeft,
	Search,
	ShoppingCart,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { useDebounceValue, useOnClickOutside } from "usehooks-ts";
import { searchEquipmentAction } from "@/app/actions/equipment-actions";
import { Button, SidebarTrigger, useSidebar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { slugify } from "@/utils";

export function Header() {
	const [isFocused, setIsFocused] = useState(false);

	const [search, setSearch] = useQueryState(
		"q",
		parseAsString.withDefault("").withOptions({ shallow: true })
	);

	const [debouncedSearch] = useDebounceValue(search, 300);

	const { data: items, isLoading } = useQuery({
		queryKey: ["header-search", debouncedSearch],
		queryFn: () => searchEquipmentAction(debouncedSearch),
		enabled: debouncedSearch.length > 1,
		staleTime: 1000 * 60 * 5,
	});

	const cartItems = useCartStore((state) => state.items);
	const { state: sidebarState, toggleSidebar, isMobile } = useSidebar();
	const isCollapsed = sidebarState === "collapsed" && !isMobile;

	const containerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	useOnClickOutside(containerRef as React.RefObject<HTMLDivElement>, () =>
		setIsFocused(false)
	);

	return (
		<header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-foreground/5 bg-background/60 px-6 backdrop-blur-xl group">
			{/* Mobile Sidebar Trigger */}
			<div className="md:hidden">
				<SidebarTrigger />
			</div>

			{/* Desktop Toggle Button - appears when sidebar is collapsed */}
			{isCollapsed && !isMobile && (
				<Button
					variant="ghost"
					onClick={toggleSidebar}
					className="opacity-0 group-hover:opacity-100 items-center justify-center h-8 w-8 rounded-lg text-primary transition-all duration-300 hover:scale-110"
				>
					<PanelLeft
						size={16}
						className="transition-transform group-hover:scale-110"
					/>
				</Button>
			)}

			{/* SEARCH CONTAINER */}
			<div ref={containerRef} className="relative w-full max-w-xl h-11">
				{/* Google Bubble  */}
				<div
					className={cn(
						"absolute inset-x-0 transition-all duration-300 ease-in-out rounded-2xl pointer-events-none",
						isFocused
							? "-top-2 h-120 bg-background shadow-2xl ring-1 ring-white/10 z-0"
							: "top-0 h-11 bg-foreground/5 z-0"
					)}
				/>

				<div className="relative z-10 flex flex-col">
					<div className="flex items-center h-11 px-4">
						<Search
							className={cn(
								"transition-colors shrink-0",
								isFocused ? "text-primary" : "text-muted-foreground"
							)}
							size={18}
						/>
						<input
							className="w-full bg-transparent border-none px-3 focus:outline-none text-sm placeholder:text-muted-foreground"
							placeholder="Поиск техники..."
							onFocus={() => setIsFocused(true)}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						{search && (
							<button
								type="button"
								onClick={() => setSearch("")}
								className="p-1 hover:bg-white/10 rounded-full transition-colors"
							>
								<X size={14} className="text-muted-foreground" />
							</button>
						)}
					</div>

					{/* Результаты */}
					{isFocused && (
						<div className="animate-in fade-in slide-in-from-top-1 duration-300">
							<div className="h-px bg-white/5 mx-4 mb-2" />

							<div className="max-h-105 overflow-y-auto px-2 pb-4 custom-scrollbar">
								{isLoading && debouncedSearch ? (
									<div className="flex items-center justify-center py-20">
										<Loader2
											className="animate-spin text-primary/50"
											size={32}
										/>
									</div>
								) : debouncedSearch.length === 0 ? (
									/* ИСТОРИЯ */
									<div className="py-2">
										{["Sony A7 IV", "Blackmagic 6K", "Aputure 300d"].map(
											(term) => (
												<button
													type="button"
													key={term}
													className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/5 cursor-pointer rounded-xl text-sm transition-colors group text-left"
													onClick={() => setSearch(term)}
												>
													<History
														size={16}
														className="text-muted-foreground group-hover:text-primary transition-colors"
													/>
													<span className="text-foreground/80">{term}</span>
												</button>
											)
										)}
									</div>
								) : items?.length ? (
									<div className="grid gap-1">
										{items.map((item) => (
											<button
												type="button"
												key={item.id}
												onClick={() => {
													router.push(`/equipment/item/${slugify(item.title)}`);
													setIsFocused(false);
												}}
												className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-left group/item"
											>
												<div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
													<Image
														src={
															item.equipment_image_links?.[0]?.images?.url ||
															"/placeholder-equipment.png"
														}
														alt={item.title}
														width={40}
														height={40}
														className="w-full h-full object-cover group-hover/item:scale-110 transition-transform"
													/>
												</div>
												<div className="flex-1 min-w-0">
													<div className="font-medium text-sm truncate group-hover/item:text-primary transition-colors">
														{item.title}
													</div>
													<div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
														{item.price_per_day} ₽ / сутки
													</div>
												</div>
											</button>
										))}
									</div>
								) : (
									<div className="py-20 text-center">
										<p className="text-sm text-muted-foreground font-medium">
											Ничего не нашли...
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2">
				<Link
					href="/checkout"
					className="relative group p-2 hover:bg-white/5 rounded-full transition-colors"
					data-cart-icon="true"
				>
					<ShoppingCart
						size={20}
						className="text-muted-foreground group-hover:text-primary transition-colors"
					/>
					{cartItems.length > 0 && (
						<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
							{cartItems.length}
						</span>
					)}
				</Link>
			</div>
		</header>
	);
}
