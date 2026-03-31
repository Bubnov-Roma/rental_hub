"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Скелетон профиля — показывается пока useApplicationStore грузит статус.
 * Адаптируется под два состояния: форма (много полей) и карточка профиля.
 */
export function ProfileSkeleton({
	variant = "form",
}: {
	variant?: "form" | "profile";
}) {
	if (variant === "profile") {
		return (
			<div className="max-w-4xl mx-auto space-y-8 animate-pulse">
				{/* Шапка карточки */}
				<div className="rounded-[32px] border border-foreground/5 bg-card/50 overflow-hidden">
					<div className="p-8 flex items-center gap-6 border-b border-foreground/5">
						<Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
						<div className="space-y-2 flex-1">
							<Skeleton className="h-7 w-48" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
					<div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Левая колонка */}
						<div className="space-y-4">
							<Skeleton className="h-3 w-36" />
							<div className="space-y-3">
								{[...Array(2)].map((_, i) => (
									<div
										key={i}
										className="flex justify-between items-center p-2"
									>
										<div className="flex items-center gap-3">
											<Skeleton className="w-4 h-4 rounded" />
											<Skeleton className="h-4 w-16" />
										</div>
										<Skeleton className="h-4 w-32" />
									</div>
								))}
							</div>
						</div>
						{/* Правая колонка */}
						<div className="space-y-4">
							<Skeleton className="h-3 w-36" />
							<div className="space-y-3">
								{[...Array(2)].map((_, i) => (
									<div
										key={i}
										className="flex justify-between items-center p-2"
									>
										<div className="flex items-center gap-3">
											<Skeleton className="w-4 h-4 rounded" />
											<Skeleton className="h-4 w-16" />
										</div>
										<Skeleton className="h-4 w-32" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// variant === "form" — скелетон формы регистрации
	return (
		<div className="max-w-4xl mx-auto py-6 space-y-8">
			<div className="rounded-[32px] border border-foreground/5 bg-card/50 overflow-hidden px-6 py-10 space-y-8">
				{/* Заголовок шага */}
				<Skeleton className="h-8 w-64" />

				{/* Две колонки полей */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Колонка 1 */}
					<div className="space-y-5">
						<Skeleton className="h-3 w-28" />
						{/* ФИО */}
						<div className="space-y-2">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-11 w-full rounded-xl" />
						</div>
						{/* Дата + Телефон */}
						<div className="grid grid-cols-2 gap-3">
							{[...Array(2)].map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-3 w-20" />
									<Skeleton className="h-11 w-full rounded-xl" />
								</div>
							))}
						</div>
						{/* Email */}
						<div className="space-y-2">
							<Skeleton className="h-3 w-12" />
							<Skeleton className="h-11 w-full rounded-xl" />
						</div>
					</div>

					{/* Колонка 2 */}
					<div className="space-y-5">
						<Skeleton className="h-3 w-36" />
						{/* Серия + Дата выдачи */}
						<div className="grid grid-cols-2 gap-3">
							{[...Array(2)].map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-3 w-20" />
									<Skeleton className="h-11 w-full rounded-xl" />
								</div>
							))}
						</div>
						{/* Кем выдан */}
						<div className="space-y-2">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="h-24 w-full rounded-xl" />
						</div>
						{/* Семейное положение */}
						<div className="space-y-2">
							<Skeleton className="h-3 w-36" />
							<div className="flex gap-3">
								<Skeleton className="h-10 w-36 rounded-xl" />
								<Skeleton className="h-10 w-36 rounded-xl" />
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between pt-4">
					<Skeleton className="h-10 w-20 rounded-xl" />
					<div className="flex gap-2">
						{[...Array(3)].map((_, i) => (
							<Skeleton key={i} className="w-10 h-10 rounded-xl" />
						))}
					</div>
					<Skeleton className="h-10 w-20 rounded-xl" />
				</div>
			</div>
		</div>
	);
}
