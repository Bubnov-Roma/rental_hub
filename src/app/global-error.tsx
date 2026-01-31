"use client";

import GlobalErrorPage from "@/components/shared/GlobalErrorPage";

export default function GlobalError({
	reset,
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<GlobalErrorPage
			title={`Упс!\n Что-то пошло не так ${error?.digest ?? error?.message}`}
			message="Возможно, пропало соединение с интернетом или сервер временно недоступен."
			reset={reset}
		/>
	);
}
