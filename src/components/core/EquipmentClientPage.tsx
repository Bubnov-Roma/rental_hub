"use client";

import Link from "next/link";
import { CategoryFilter } from "@/components/core/CategoryFilter";
import { EquipmentGrid } from "@/components/core/EquipmentGrid";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CATEGORIES } from "@/constants";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { useEquipment } from "@/hooks/useEquipment";
import { formatPlural } from "@/utils";

interface PageProps {
	initialData: GroupedEquipment[];
	resolvedParams: {
		category?: string;
		subcategory?: string;
		search?: string;
	};
}

const crumbLinkClass =
	"text-muted-foreground hover:text-foreground transition-colors text-sm";

export default function EquipmentClientPage({
	initialData,
	resolvedParams,
}: PageProps) {
	const categorySlug = resolvedParams.category || "all";
	const subcategorySlug = resolvedParams.subcategory || "";

	const currentCategory =
		CATEGORIES.find((c) => c.slug === categorySlug) || CATEGORIES[0];

	const currentSubcategory =
		subcategorySlug && currentCategory?.subcategories
			? (
					currentCategory.subcategories as Array<{ slug: string; name: string }>
				).find((s) => s.slug === subcategorySlug)
			: null;

	const { data: items, isLoading } = useEquipment(
		{
			categorySlug,
			...(subcategorySlug ? { subcategorySlug } : {}),
			...(resolvedParams.search !== undefined
				? { search: resolvedParams.search }
				: {}),
		},
		initialData
	);

	const pageTitle =
		currentSubcategory?.name ??
		(categorySlug === "all"
			? "Вся техника"
			: (currentCategory?.name ?? "Каталог"));

	return (
		<div className="flex flex-col flex-1 min-w-0 p-6 md:p-10 space-y-8 overflow-hidden">
			<Breadcrumb>
				<BreadcrumbList>
					{/* Главная */}
					<BreadcrumbItem>
						<Link href="/" className={crumbLinkClass}>
							Главная
						</Link>
					</BreadcrumbItem>

					<BreadcrumbSeparator />

					{/* Каталог */}
					<BreadcrumbItem>
						{categorySlug === "all" ? (
							<BreadcrumbPage>Каталог</BreadcrumbPage>
						) : (
							<Link href="/equipment" className={crumbLinkClass}>
								Каталог
							</Link>
						)}
					</BreadcrumbItem>

					{/* Категория */}
					{categorySlug !== "all" && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{currentSubcategory ? (
									<Link
										href={`/equipment?category=${currentCategory.slug}`}
										className={crumbLinkClass}
									>
										{currentCategory.name}
									</Link>
								) : (
									<BreadcrumbPage>{currentCategory?.name}</BreadcrumbPage>
								)}
							</BreadcrumbItem>
						</>
					)}

					{/* Подкатегория */}
					{currentSubcategory && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{currentSubcategory.name}</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>

			{/* Заголовок */}
			<div>
				<h1 className="text-4xl font-black tracking-tight uppercase italic">
					{pageTitle}
				</h1>
				{!isLoading && items && items.length === 0 && (
					<p className="text-muted-foreground mt-2">Позиций не найдено</p>
				)}
				{!isLoading && items && items.length > 0 && (
					<p className="text-muted-foreground mt-2">
						Найдено {formatPlural(items.length, "equipment")}
					</p>
				)}
			</div>

			<div className="max-w-full">
				<CategoryFilter />
			</div>

			<EquipmentGrid items={items || []} isLoading={isLoading} />
		</div>
	);
}
