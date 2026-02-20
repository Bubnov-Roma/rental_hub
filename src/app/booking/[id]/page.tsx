import { notFound } from "next/navigation";
import type { SupabaseLink } from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "./BookingForm";

export default async function BookingPage({
	params,
}: {
	params: { id: string };
}) {
	const { id } = await params;
	const supabase = await createClient();

	const { data: equipment, error } = await supabase
		.from("equipment")
		.select(`
      *,
      equipment_image_links(images(url))
    `)
		.eq("id", id)
		.single();

	if (error || !equipment) notFound();

	const item = {
		...equipment,
		imageUrl:
			equipment.equipment_image_links?.[0]?.images?.url || "/placeholder.png",
		images:
			equipment.equipment_image_links?.map(
				(l: SupabaseLink) => l.images?.url
			) || [],
	};

	return (
		<div className="min-h-screen bg-background py-12">
			<div className="container mx-auto px-4">
				<BookingForm equipment={item} />
			</div>
		</div>
	);
}
