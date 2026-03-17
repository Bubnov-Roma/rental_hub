import { useCallback, useState } from "react";
import type { DbCategory } from "@/core/domain/entities/Equipment";

export interface SearchPanelState {
	query: string;
	setQuery: (q: string) => void;
	category: string;
	subcategory: string;
	expandedCat: string;
	selectCategory: (slug: string) => void;
	selectSubcategory: (catSlug: string, subSlug: string) => void;
	setExpandedCat: (cat: string) => void;
	handleCategoryClick: (slug: string) => void;
}

export function useSearchState(categories: DbCategory[] = []) {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("all");
	const [subcategory, setSubcategory] = useState("");
	const [expandedCat, setExpandedCat] = useState("");

	const selectCategory = useCallback((slug: string) => {
		setCategory(slug === "all" ? "all" : slug);
		setSubcategory("");
	}, []);

	const selectSubcategory = useCallback((_catSlug: string, subSlug: string) => {
		setSubcategory((prev) => (prev === subSlug ? "" : subSlug));
	}, []);

	const handleCategoryClick = useCallback(
		(slug: string) => {
			const hasSubs =
				(categories.find((c) => c.slug === slug)?.subcategories?.length ?? 0) >
				0;
			if (slug === "all") {
				selectCategory("all");
				setExpandedCat("");
				return;
			}
			selectCategory(slug);
			setExpandedCat(hasSubs ? (expandedCat === slug ? "" : slug) : "");
		},
		[selectCategory, expandedCat, categories]
	);

	const reset = useCallback(() => {
		setQuery("");
		setCategory("all");
		setSubcategory("");
		setExpandedCat("");
	}, []);

	return {
		state: {
			query,
			setQuery,
			category,
			subcategory,
			expandedCat,
			selectCategory,
			selectSubcategory,
			setExpandedCat,
			handleCategoryClick,
		},
		reset,
	};
}
