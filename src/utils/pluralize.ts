import { PLURAL_FORMS, type PluralType } from "@/constants";

/**
 * Форматирует число с правильной формой слова в зависимости от количества.
 * @param count - число
 * @param type - ключ из словаря PLURAL_FORMS
 * @param includeNumber - нужно ли возвращать число вместе со словом (по умолчанию true)
 */
export const formatPlural = (
	count: number,
	type: PluralType,
	includeNumber: boolean = true
) => {
	const forms = PLURAL_FORMS[type];
	const mod10 = count % 10;
	const mod100 = count % 100;

	let result = forms[2] as (typeof forms)[number];

	if (mod100 < 11 || mod100 > 19) {
		if (mod10 === 1) result = forms[0];
		else if (mod10 >= 2 && mod10 <= 4) result = forms[1];
	}

	return includeNumber ? `${count} ${result}` : result;
};
