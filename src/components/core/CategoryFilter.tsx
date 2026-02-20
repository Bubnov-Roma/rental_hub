"use client";

import { ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { CATEGORIES } from "@/constants";
import { cn } from "@/lib/utils";

export function CategoryFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const scrollRef = useRef<HTMLDivElement>(null);

	const currentCategory = searchParams.get("category") || "all";
	const currentSubcategory = searchParams.get("subcategory") || "";

	const [expandedCategory, setExpandedCategory] = useState<string>(() => {
		if (currentSubcategory && currentCategory !== "all") return currentCategory;
		return "";
	});

	const activeCatData = CATEGORIES.find((c) => c.slug === expandedCategory);
	const subcategories = activeCatData?.subcategories ?? [];

	useEffect(() => {
		if (currentCategory !== "all" && currentSubcategory) {
			setExpandedCategory(currentCategory);
		}
	}, [currentCategory, currentSubcategory]);

	const navigate = (params: Record<string, string | null>) => {
		const next = new URLSearchParams(searchParams.toString());
		for (const [key, val] of Object.entries(params)) {
			if (val === null) {
				next.delete(key);
			} else {
				next.set(key, val);
			}
		}
		router.push(`?${next.toString()}`, { scroll: false });
	};

	const handleCategoryClick = (slug: string) => {
		if (slug === "all") {
			navigate({ category: null, subcategory: null });
			setExpandedCategory("");
			return;
		}

		const cat = CATEGORIES.find((c) => c.slug === slug);
		const hasSubs = (cat?.subcategories?.length ?? 0) > 0;

		if (slug === currentCategory) {
			if (hasSubs) setExpandedCategory((prev) => (prev === slug ? "" : slug));
			return;
		}

		navigate({ category: slug, subcategory: null });
		setExpandedCategory(hasSubs ? slug : "");
	};

	const handleSubcategoryClick = (catSlug: string, subSlug: string) => {
		if (currentSubcategory === subSlug) {
			navigate({ category: catSlug, subcategory: null });
		} else {
			navigate({ category: catSlug, subcategory: subSlug });
		}
	};

	return (
		<div className="space-y-1 w-full">
			{/* Категории */}
			<div
				ref={scrollRef}
				className="flex items-center gap-1 overflow-x-auto scroll-smooth no-scrollbar w-full"
			>
				{CATEGORIES.map((cat) => {
					const isActive = currentCategory === cat.slug;
					const hasSubs = (cat.subcategories?.length ?? 0) > 0;
					const isExpanded = expandedCategory === cat.slug;

					return (
						<Button
							key={cat.slug}
							variant="ghost"
							onClick={() => handleCategoryClick(cat.slug)}
							className={cn(
								"relative flex items-center gap-1 whitespace-nowrap transition-all duration-200 shrink-0",
								"text-[11px] uppercase tracking-[0.15em] font-bold h-9 px-3 rounded-lg",
								isActive
									? "text-foreground bg-primary/5 hover:bg-primary/10"
									: "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
							)}
						>
							{cat.name}
							{hasSubs && (
								<ChevronRight
									size={11}
									className={cn(
										"transition-transform duration-200 opacity-60",
										isExpanded && "rotate-90"
									)}
								/>
							)}
							{isActive && (
								<span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-primary rounded-full animate-in fade-in zoom-in duration-200" />
							)}
						</Button>
					);
				})}
			</div>

			{/* Подкатегории */}
			{expandedCategory && subcategories.length > 0 && (
				<div className="flex items-center gap-1 overflow-x-auto scroll-smooth no-scrollbar pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
					{subcategories.map((sub) => {
						const isActive = currentSubcategory === sub.slug;
						return (
							<Button
								key={sub.slug}
								variant="ghost"
								onClick={() =>
									handleSubcategoryClick(expandedCategory, sub.slug)
								}
								className={cn(
									"relative whitespace-nowrap transition-all duration-200 shrink-0",
									"text-[10px] uppercase tracking-[0.12em] font-semibold h-7 px-2.5 rounded-md",
									isActive
										? "text-foreground bg-primary/5 hover:bg-primary/10"
										: "text-muted-foreground/70 hover:text-foreground hover:bg-muted-foreground/10"
								)}
							>
								{sub.name}
								{isActive && (
									<span className="absolute bottom-0.5 left-2 right-2 h-0.5 bg-primary rounded-full" />
								)}
							</Button>
						);
					})}
				</div>
			)}
		</div>
	);
}
