type AppError = Error & {
	message: string;
	status?: number;
	code?: string;
};

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	if (error && typeof error === "object" && "message" in error) {
		return String((error as { message: unknown }).message);
	}

	return "Произошла неизвестная ошибка";
}

export function isAppError(error: unknown): error is AppError {
	return error instanceof Error;
}
