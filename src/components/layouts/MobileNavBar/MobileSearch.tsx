"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { SearchFilters } from "@/components/core/search/SearchFilters";
import { SearchPanel } from "@/components/core/search/SearchPanel";
import { Button } from "@/components/ui";
import { useSearchState } from "@/hooks";
import { useSearchHistory } from "@/hooks/use-search-history";
import { cn } from "@/lib/utils";

interface MobileSearchProps {
	isOpen: boolean;
	onClose: () => void;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
	const { state, reset } = useSearchState();
	const { addToHistory } = useSearchHistory();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 80);
		} else {
			reset();
		}
	}, [isOpen, reset]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	const handleClose = () => {
		if (state.query.trim().length > 1) addToHistory(state.query.trim());
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div
			className={cn(
				"fixed inset-0 z-80 flex flex-col bg-background/70 backdrop-blur-2xl",
				"animate-in fade-in duration-150"
			)}
		>
			{/* Results area — fills space above the input */}
			<SearchPanel
				state={state}
				variant="mobile"
				onClose={handleClose}
				className="flex-1 min-h-0"
			/>

			{/* ── Sticky bottom search bar ── */}
			<div className="shrink-0 relative flex flex-col w-full bg-background/90 backdrop-blur-xl border-t border-foreground/5">
				{/* Fade mask so results gracefully disappear into the bar */}
				<div className="absolute -top-12 inset-x-0 h-12 bg-linear-to-t from-background/90 to-transparent pointer-events-none" />
				{/* ── Умные фильтры для мобилки ── */}
				{state.query.trim().length > 1 && (
					<div className="px-4 pt-3 pb-1 w-full overflow-hidden animate-in slide-in-from-bottom-2">
						<SearchFilters
							category={state.category}
							subcategory={state.subcategory}
							expandedCat={state.expandedCat}
							onCategory={state.handleCategoryClick}
							onSubcategory={state.selectSubcategory}
							variant="mobile"
						/>
					</div>
				)}
				<div
					className="mx-3 mb-2 flex items-center gap-2"
					style={{
						paddingBottom: "calc(env(safe-area-inset-bottom))",
					}}
				>
					<div className="flex-1 flex items-center gap-3 bg-foreground/5 rounded-2xl px-4 h-14">
						<Search size={18} className="text-primary shrink-0" />
						<input
							ref={inputRef}
							className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground"
							placeholder="Поиск техники..."
							value={state.query}
							onChange={(e) => state.setQuery(e.target.value)}
						/>
						{state.query && (
							<button
								type="button"
								onClick={() => state.setQuery("")}
								className="p-1 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
							>
								<X size={14} className="text-muted-foreground" />
							</button>
						)}
					</div>
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={handleClose}
						className="shrink-0 p-3 h-14 w-14 text-sm rounded-full font-semibold bg-primary/80 text-foreground active:opacity-70 transition-opacity"
					>
						<X size={26} className="w-full h-full size-full" />
					</Button>
				</div>
			</div>
		</div>
	);
}
