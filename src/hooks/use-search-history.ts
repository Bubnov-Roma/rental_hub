"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "linza-search-history";
const MAX_HISTORY = 10;

export function useSearchHistory() {
	const [history, setHistory] = useState<string[]>([]);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				setHistory(JSON.parse(stored));
			}
		} catch {}
	}, []);

	const addToHistory = useCallback((term: string) => {
		if (!term.trim() || term.length < 2) return;
		setHistory((prev) => {
			const filtered = prev.filter(
				(t) => t.toLowerCase() !== term.toLowerCase()
			);
			const next = [term, ...filtered].slice(0, MAX_HISTORY);
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {}
			return next;
		});
	}, []);

	const removeFromHistory = useCallback((term: string) => {
		setHistory((prev) => {
			const next = prev.filter((t) => t !== term);
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {}
			return next;
		});
	}, []);

	const clearHistory = useCallback(() => {
		setHistory([]);
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {}
	}, []);

	return { history, addToHistory, removeFromHistory, clearHistory };
}
