export function deepSetClient(
	obj: Record<string, unknown>,
	keys: string[],
	value: unknown
): Record<string, unknown> {
	const [head, ...rest] = keys;
	if (!head) return obj;
	if (rest.length === 0) return { ...obj, [head]: value };
	return {
		...obj,
		[head]: deepSetClient(
			(obj[head] as Record<string, unknown>) ?? {},
			rest,
			value
		),
	};
}
