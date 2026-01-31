import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { EquipmentForm } from "@/components/forms";
import { Button } from "@/components/ui/button";

export default function NewEquipmentPage() {
	const categories = [
		"Камеры",
		"Свет",
		"Звук",
		"Кинооборудование",
		"Объективы",
		"Стабилизация",
		"Операторское оборудование",
		"Аксессуары",
		"Услуги",
	];

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link href="/admin/equipment">
						<ChevronLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h1 className="text-3xl font-bold text-gray-900">Новое оборудование</h1>
			</div>
			<EquipmentForm categories={categories} />
		</div>
	);
}
