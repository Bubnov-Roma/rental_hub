"use client";

import GlobalErrorPage from "@/components/shared/GlobalErrorPage";

export default function GlobalNotFound() {
	return (
		<GlobalErrorPage
			title={`Страница не найдена`}
			message={`Похоже, этой страницы пока не существует`}
		/>
	);
}
