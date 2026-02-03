"use client";
import React from "react";
import { EquipmentGrid } from "@/components/core/EquipmentGrid";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES } from "@/constants";
import { useEquipment } from "@/hooks/useEquipment";
import { formatPlural } from "@/utils";

interface EquipmentPageProps {
	searchParams: Promise<{
		category?: string;
		search?: string;
		[key: string]: string | undefined;
	}>;
}

export default function EquipmentPage({ searchParams }: EquipmentPageProps) {
	const resolvedParams = React.use(searchParams);
	const categorySlug = resolvedParams?.category || "all";

	const currentCategory =
		CATEGORIES.find((c) => c.slug === categorySlug) || CATEGORIES[0];

	const { data: items, isLoading } = useEquipment({
		...(resolvedParams?.search !== undefined
			? { search: resolvedParams.search }
			: {}),
		categorySlug: (categorySlug || "all").toString(),
	});

	return (
		<div className="p-6 md:p-10 space-y-8">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Главная</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Каталог</BreadcrumbPage>
					</BreadcrumbItem>
					{categorySlug !== "all" && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{currentCategory?.name}</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>

			<div>
				<h1 className="text-4xl font-black tracking-tight uppercase italic">
					{categorySlug === "all" ? "Вся техника" : currentCategory?.name}
				</h1>
				{isLoading ? (
					<div className="mt-2 flex items-center gap-2">
						<Progress />
					</div>
				) : (
					<p className="text-muted-foreground mt-2">
						{items?.length
							? `Найдено ${formatPlural(items.length, "equipment")}`
							: "Позиций не найдено"}
					</p>
				)}
			</div>
			<EquipmentGrid items={items || []} isLoading={isLoading} />
		</div>
	);
}
