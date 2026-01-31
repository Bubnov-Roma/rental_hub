import { EquipmentCard } from "@/components/core/EquipmentCard";
import type { Equipment } from "@/core/domain/entities/Equipment";

interface EquipmentGridProps {
	equipment: Equipment[];
	onBook: (id: string) => void;
	onViewDetails: (id: string) => void;
}

export function EquipmentGrid({
	equipment,
	onBook,
	onViewDetails,
}: EquipmentGridProps) {
	if (equipment.length === 0) {
		return (
			<div className="py-12 text-center">
				<div className="mx-auto max-w-md">
					<div className="mb-4 text-6xl">📷</div>
					<h3 className="mb-2 text-xl font-semibold">
						Оборудование не найдено
					</h3>
					<p className="text-gray-600">
						Попробуйте изменить параметры поиска или выберите другую категорию
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{equipment.map((item) => (
				<EquipmentCard
					key={item.id}
					id={item.id}
					title={item.title}
					description={item.description}
					pricePerDay={item.price_per_day}
					imageUrl={item.imageUrl || "/placeholder-equipment.jpg"}
					rating={item.rating || 4.5}
					reviewsCount={item.reviewsCount || 12}
					location="Москва"
					category={item.category}
					isAvailable={item.is_available}
					onBook={onBook}
					onViewDetails={onViewDetails}
				/>
			))}
		</div>
	);
}
