"use client";

import { ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { CATEGORIES } from "@/constants";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
	isPending?: boolean;
}

export function CategoryFilter({ isPending = false }: CategoryFilterProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPendingInternal, startTransition] = useTransition();

	const currentCategory = searchParams.get("category") || "all";
	const currentSubcategory = searchParams.get("subcategory") || "";

	const [optimisticCategory, setOptimisticCategory] =
		useOptimistic(currentCategory);
	const [optimisticSubcategory, setOptimisticSubcategory] =
		useOptimistic(currentSubcategory);

	// expandedCategory инициализируется из URL и больше не синхронизируется
	// через useEffect — тот useEffect вызывал лишние рендеры.
	// Вместо этого вычисляем его из оптимистичного состояния.
	const [manualExpanded, setManualExpanded] = useState<string>(() => {
		if (currentSubcategory && currentCategory !== "all") return currentCategory;
		return currentCategory !== "all" ? currentCategory : "";
	});

	// expandedCategory = то что пользователь раскрыл вручную
	const expandedCategory = manualExpanded;

	const subcategories = useMemo(
		() =>
			CATEGORIES.find((c) => c.slug === expandedCategory)?.subcategories ?? [],
		[expandedCategory]
	);

	const navigate = (params: Record<string, string | null>) => {
		const next = new URLSearchParams(searchParams.toString());
		for (const [key, val] of Object.entries(params)) {
			if (val === null) next.delete(key);
			else next.set(key, val);
		}
		router.push(`?${next.toString()}`, { scroll: false });
	};

	const handleCategoryClick = (slug: string) => {
		if (slug === "all") {
			startTransition(() => {
				setOptimisticCategory("all");
				setOptimisticSubcategory("");
				navigate({ category: null, subcategory: null });
			});
			setManualExpanded("");
			return;
		}

		const cat = CATEGORIES.find((c) => c.slug === slug);
		const hasSubs = (cat?.subcategories?.length ?? 0) > 0;

		if (slug === optimisticCategory) {
			// Повторный клик — только переключает раскрытие подкатегорий
			if (hasSubs) setManualExpanded((prev) => (prev === slug ? "" : slug));
			return;
		}

		startTransition(() => {
			setOptimisticCategory(slug);
			setOptimisticSubcategory("");
			navigate({ category: slug, subcategory: null });
		});
		setManualExpanded(hasSubs ? slug : "");
	};

	const handleSubcategoryClick = (catSlug: string, subSlug: string) => {
		// ВСЕ вызовы setOptimistic должны быть ВНУТРИ startTransition —
		// иначе React бросает ошибку и форсирует лишний рендер.
		if (optimisticSubcategory === subSlug) {
			startTransition(() => {
				setOptimisticSubcategory("");
				navigate({ category: catSlug, subcategory: null });
			});
		} else {
			startTransition(() => {
				setOptimisticSubcategory(subSlug);
				navigate({ category: catSlug, subcategory: subSlug });
			});
		}
	};

	const loading = isPending || isPendingInternal;

	return (
		<div className="space-y-1 w-full">
			{/* Category row */}
			<div className="flex items-center gap-1 overflow-x-auto scroll-smooth no-scrollbar w-full">
				{CATEGORIES.map((cat) => {
					const isActive = optimisticCategory === cat.slug;
					const hasSubs = (cat.subcategories?.length ?? 0) > 0;
					const isExpanded = expandedCategory === cat.slug;

					return (
						<Button
							key={cat.slug}
							variant="ghost"
							onClick={() => handleCategoryClick(cat.slug)}
							className={cn(
								"relative flex items-center gap-1 whitespace-nowrap transition-all duration-150 shrink-0",
								"text-[11px] uppercase tracking-[0.15em] font-bold h-9 px-3 rounded-lg",
								isActive
									? "text-foreground bg-muted-foreground/10"
									: "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10",
								loading && isActive && "opacity-70"
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
								<span
									className={cn(
										"absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full",
										loading
											? "bg-primary/40 animate-pulse"
											: "bg-primary animate-in fade-in zoom-in duration-200"
									)}
								/>
							)}
						</Button>
					);
				})}
			</div>

			{/* Subcategory row */}
			{expandedCategory && subcategories.length > 0 && (
				<div className="flex items-center gap-1 overflow-x-auto scroll-smooth no-scrollbar pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
					{subcategories.map((sub) => {
						const isActive = optimisticSubcategory === sub.slug;
						return (
							<Button
								key={sub.slug}
								variant="ghost"
								onClick={() =>
									handleSubcategoryClick(expandedCategory, sub.slug)
								}
								className={cn(
									"relative whitespace-nowrap transition-all duration-150 shrink-0",
									"text-[10px] uppercase tracking-[0.12em] font-semibold h-7 px-2.5 rounded-md",
									isActive
										? "text-foreground bg-primary/5"
										: "text-muted-foreground/70 hover:text-foreground hover:bg-muted-foreground/10",
									loading && isActive && "opacity-70"
								)}
							>
								{sub.name}
								{isActive && (
									<span
										className={cn(
											"absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full",
											loading ? "bg-primary/40 animate-pulse" : "bg-primary"
										)}
									/>
								)}
							</Button>
						);
					})}
				</div>
			)}

			{loading && (
				<div className="h-0.5 w-full overflow-hidden rounded-full bg-foreground/5">
					<div
						className="h-full bg-primary/40 rounded-full"
						style={{ width: "40%", animation: "slide 1s ease-in-out infinite" }}
					/>
				</div>
			)}
		</div>
	);
}
