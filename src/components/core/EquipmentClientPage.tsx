"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CategoryFilter } from "@/components/core/CategoryFilter";
import { EquipmentGrid } from "@/components/core/EquipmentGrid";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { DbCategory } from "@/constants/navigation";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { useEquipment } from "@/hooks";
import { formatPlural } from "@/utils";

interface PageProps {
	initialData: GroupedEquipment[];
	categories: DbCategory[];
}

const crumbLinkClass =
	"text-muted-foreground hover:text-foreground transition-colors text-sm";

export default function EquipmentClientPage({
	initialData,
	categories,
}: PageProps) {
	const searchParams = useSearchParams();

	const categorySlug = searchParams.get("category") || "all";
	const subcategorySlug = searchParams.get("subcategory") || "";
	const searchQuery = searchParams.get("search") || "";

	const currentCategory = useMemo(
		() => categories.find((c) => c.slug === categorySlug) ?? null,
		[categorySlug, categories]
	);

	const currentSubcategory = useMemo(() => {
		if (!subcategorySlug || !currentCategory?.subcategories) return null;
		return (
			currentCategory.subcategories.find((s) => s.slug === subcategorySlug) ??
			null
		);
	}, [subcategorySlug, currentCategory]);

	const equipmentFilters = useMemo(
		() => ({
			categorySlug,
			subcategorySlug: subcategorySlug || undefined,
			search: searchQuery || undefined,
		}),
		[categorySlug, subcategorySlug, searchQuery]
	);

	const { data: items, isLoading } = useEquipment(
		equipmentFilters,
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
					<BreadcrumbItem>
						<Link href="/" className={crumbLinkClass}>
							Главная
						</Link>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						{categorySlug === "all" ? (
							<BreadcrumbPage>Каталог</BreadcrumbPage>
						) : (
							<Link href="/equipment" className={crumbLinkClass}>
								Каталог
							</Link>
						)}
					</BreadcrumbItem>
					{categorySlug !== "all" && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{currentSubcategory ? (
									<Link
										href={`/equipment?category=${currentCategory?.slug}`}
										className={crumbLinkClass}
									>
										{currentCategory?.name}
									</Link>
								) : (
									<BreadcrumbPage>{currentCategory?.name}</BreadcrumbPage>
								)}
							</BreadcrumbItem>
						</>
					)}
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

			<div>
				<h1 className="text-4xl font-black tracking-tight uppercase italic">
					{pageTitle}
				</h1>
				{!isLoading && items && items.length === 0 && (
					<p className="text-muted-foreground mt-2">Позиций не найдено</p>
				)}
				{!isLoading && items && items.length > 0 && (
					<p className="text-muted-foreground mt-2">
						{formatPlural(items.length, "equipment")}
					</p>
				)}
			</div>

			<div className="max-w-full">
				<CategoryFilter categories={categories} />
			</div>

			<EquipmentGrid items={items || []} isLoading={isLoading} />
		</div>
	);
}
