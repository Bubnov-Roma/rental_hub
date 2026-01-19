export const getStatusText = (status: string) => {
	const texts: Record<string, string> = {
		completed: "Завершено",
		pending: "Ожидание",
		cancelled: "Отменено",
		confirmed: "Подтверждено",
	};
	return texts[status] || "отсутствует";
};
export const getStatusColor = (status: string) => {
	const colors: Record<string, string> = {
		completed: "bg-green-100 text-green-800",
		pending: "bg-yellow-100 text-yellow-800",
		cancelled: "bg-red-100 text-red-800",
		confirmed: "bg-blue-100 text-blue-800",
	};
	return colors[status] || "bg-gray-100 text-gray-800";
};
