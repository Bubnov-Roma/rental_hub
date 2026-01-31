import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
	return new Intl.NumberFormat("ru-RU", {
		style: "currency",
		currency: "RUB",
		minimumFractionDigits: 0,
	}).format(price);
}

export function formatDate(date: Date | string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(date));
}

export function calculateRentalDays(start: Date, end: Date) {
	const diff = end.getTime() - start.getTime();
	return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function generateSlug(text: string) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9а-яё\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}
