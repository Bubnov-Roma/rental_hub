import EquipmentClientPage from "@/components/core/EquipmentClientPage";
import { getEquipment } from "@/lib/api/equipment";

export type EquipmentSearchParams = {
	category?: string;
	subcategory?: string;
	search?: string;
};

interface PageProps {
	searchParams: Promise<EquipmentSearchParams>;
}

export default async function EquipmentPage({ searchParams }: PageProps) {
	const params = await searchParams;

	const initialData = await getEquipment({
		categorySlug: params.category || "all",
		subcategorySlug: params.subcategory || "",
		search: params.search || "",
	});

	return (
		<EquipmentClientPage initialData={initialData} resolvedParams={params} />
	);
}
