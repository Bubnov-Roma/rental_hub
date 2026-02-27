"use client";

import GlobalErrorPage from "@/components/shared/GlobalErrorPage";
import "./globals.css";

export default function GlobalError({
	reset,
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="ru">
			<body>
				<GlobalErrorPage
					title={`Что-то пошло не так`}
					message={error?.message || "Произошла системная ошибка"}
					reset={reset}
				/>
			</body>
		</html>
	);
}
