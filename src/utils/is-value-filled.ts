export const isValueFilled = (val: unknown): boolean => {
	if (val === null || val === undefined || val === "") return false;

	if (Array.isArray(val)) {
		if (val.length === 0) return false;

		return val.every((item: unknown) => {
			if (item !== null && typeof item === "object") {
				const obj = item as Record<string, unknown>;

				const ignoredKeys = ["platform", "relation", "id"];

				const keysToCheck = Object.keys(obj).filter(
					(key) => !ignoredKeys.includes(key)
				);

				if (keysToCheck.length === 0) return true;

				return keysToCheck.every((key) => isValueFilled(obj[key]));
			}

			return item !== "";
		});
	}

	if (typeof val === "object") {
		const obj = val as Record<string, unknown>;
		return Object.values(obj).some((v) => isValueFilled(v));
	}

	return true;
};
