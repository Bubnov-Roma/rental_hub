import { useEffect, useRef, useState } from "react";
import {
	type DadataAddressSuggestion,
	type DadataBaseSuggestion,
	fetchDadata,
} from "@/services/dadata.service";

type DadataType = "fio" | "address" | "party" | "bank";

type DadataResult<T extends DadataType> = T extends "address"
	? DadataAddressSuggestion
	: DadataBaseSuggestion;

interface UseDadataSuggestionsOptions {
	minLength?: number;
	debounceMs?: number;
	count?: number;
}

export const useDadataSuggestions = <T extends DadataType>(
	query: string,
	type: DadataType,
	options: UseDadataSuggestionsOptions = {}
) => {
	const { minLength = 2, debounceMs = 200 } = options;

	const [suggestions, setSuggestions] = useState<DadataResult<T>[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);

	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const load = async () => {
			if (!query || query.length < minLength) {
				setSuggestions([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			abortControllerRef.current = new AbortController();

			try {
				const results = await fetchDadata<DadataResult<T>>(type, query, {
					signal: abortControllerRef.current?.signal,
				});
				setSuggestions(results);
			} catch (error) {
				if (error instanceof Error && error.name !== "AbortError") {
					setIsError(true);
				}
			} finally {
				setIsLoading(false);
			}
		};

		const timer = setTimeout(load, debounceMs);
		return () => {
			clearTimeout(timer);
			abortControllerRef.current?.abort();
		};
	}, [query, debounceMs, minLength, type]);

	return {
		suggestions,
		isLoading,
		isError,
		isEmpty: suggestions.length === 0,
		hasResults: suggestions.length > 0,
	};
};
export const useDadataAddressSuggestions = (
	query: string,
	options?: UseDadataSuggestionsOptions
) => {
	return useDadataSuggestions(query, "address" as const, options);
};

export const useDadataFioSuggestions = (
	query: string,
	options?: UseDadataSuggestionsOptions
) => {
	const result = useDadataSuggestions(query, "fio" as const, options);

	return {
		...result,
		suggestions: result.suggestions.map((s) => s.value),
	};
};
