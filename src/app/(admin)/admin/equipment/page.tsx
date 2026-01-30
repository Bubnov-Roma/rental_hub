import { Plus } from "lucide-react";
import Link from "next/link";
import EquipmentTable from "@/components/admin/EquipmentTable";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEquipmentPage() {
	const supabase = await createClient();

	const { data } = await supabase
		.from("equipment")
		.select(`
      *,
      images:images(url) 
    `)
		.order("created_at", { ascending: false });

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Оборудование</h1>
					<p className="mt-2 text-gray-600">
						Управление каталогом оборудования ({data?.length || 0} единиц)
					</p>
				</div>
				<Button asChild>
					<Link href="/admin/equipment/new">
						<Plus className="mr-2 h-4 w-4" />
						Добавить оборудование
					</Link>
				</Button>
			</div>
			<EquipmentTable initialData={data || []} />
		</div>
	);
}
