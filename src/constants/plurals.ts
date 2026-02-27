export const PLURAL_FORMS = {
	equipment: ["позиция", "позиции", "позиций"],
	days: ["день", "дня", "дней"],
	reviews: ["отзыв", "отзыва", "отзывов"],
	items: ["товар", "товара", "товаров"],
	unavailable: ["недоступен", "недоступны", "недоступны"],
} as const;

export type PluralType = keyof typeof PLURAL_FORMS;
