export interface DadataAddressSuggestion {
	value: string;
	data: {
		postal_code: string | null;
		country: string;
		region_with_type: string;
		city_with_type: string | null;
		settlement_with_type: string | null;
		street_with_type: string | null;
		house: string | null;
		flat: string | null;
	};
}

export interface DadataBaseSuggestion {
	value: string;
	unrestricted_value: string;
}

interface FetchDadataOptions {
	signal?: AbortSignal;
	count?: number;
}

export const fetchDadata = async <T = DadataBaseSuggestion>(
	type: string,
	query: string,
	options: FetchDadataOptions = {}
): Promise<T[]> => {
	const { signal, count = 5 } = options;

	const token = process.env.NEXT_PUBLIC_DADATA_API_KEY;
	if (!query || query.length < 2 || !token) return [];

	const timeoutId = setTimeout(() => {
		if (options.signal?.aborted === false) {
		}
	}, 5000);

	try {
		const response = await fetch(
			`https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/${type}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: `Token ${token}`,
				},
				body: JSON.stringify({ query, count }),
				...signal,
			}
		);

		clearTimeout(timeoutId);

		if (!response.ok) throw new Error(`Dadata error: ${response.status}`);
		const data = await response.json();
		return data.suggestions || [];
	} catch (err) {
		clearTimeout(timeoutId);
		if (err instanceof Error && err.name === "AbortError") return [];
		console.error(`Dadata ${type} error:`, err);
		throw err;
	}
};
