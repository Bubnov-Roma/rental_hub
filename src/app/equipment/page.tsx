import { Suspense } from "react";
import EquipmentClientPage from "@/components/core/EquipmentClientPage";
import { EquipmentGrid } from "@/components/core/EquipmentGrid";
import { getEquipment } from "@/lib/api/equipment";

export type EquipmentSearchParams = {
	category?: string;
	subcategory?: string;
	search?: string;
};

interface PageProps {
	searchParams: Promise<EquipmentSearchParams>;
}

function PageSkeleton() {
	return (
		<div className="flex flex-col flex-1 min-w-0 p-6 md:p-10 space-y-8">
			<EquipmentGrid items={[]} isLoading={true} />
		</div>
	);
}

export default async function EquipmentPage({ searchParams }: PageProps) {
	const params = await searchParams;

	const initialData = await getEquipment({
		categorySlug: params.category || "all",
		subcategorySlug: params.subcategory || "",
		search: params.search || "",
	});

	return (
		<Suspense fallback={<PageSkeleton />}>
			<EquipmentClientPage initialData={initialData} />
		</Suspense>
	);
}
