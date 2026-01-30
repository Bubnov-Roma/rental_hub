"use client";

import GlobalErrorPage from "@/components/shared/GlobalErrorPage";

export default function GlobalNotFound() {
	return (
		<GlobalErrorPage
			title={`404\n Страница не найдена`}
			message={`Похоже, эта ссылка больше не работает\n А возможно её никогда не существовало`}
		/>
	);
}
