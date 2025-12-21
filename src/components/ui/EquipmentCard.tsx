import { Calendar, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface EquipmentCardProps {
	id: string;
	title: string;
	description: string;
	pricePerDay: number;
	imageUrl: string;
	rating: number;
	reviewsCount: number;
	location: string;
	category: string;
	isAvailable: boolean;
	onBook: (id: string) => void;
	onViewDetails: (id: string) => void;
}

export function EquipmentCard({
	id,
	title,
	description,
	pricePerDay,
	imageUrl,
	rating,
	reviewsCount,
	location,
	category,
	isAvailable,
	onBook,
	onViewDetails,
}: EquipmentCardProps) {
	return (
		<div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
			{/* Статус доступности */}
			<div
				className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-sm font-medium ${isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
			>
				{isAvailable ? "Доступно" : "Занято"}
			</div>

			{/* Изображение */}
			<div className="relative h-56 w-full overflow-hidden bg-gray-100">
				<Image
					src={imageUrl || "/placeholder-equipment.jpg"}
					alt={title}
					fill
					className="object-cover group-hover:scale-105 transition-transform duration-300"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
				{/* Категория */}
				<div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
					{category}
				</div>
			</div>

			{/* Контент */}
			<div className="p-5">
				<div className="flex justify-between items-start mb-3">
					<h3 className="font-bold text-lg text-gray-900 line-clamp-1">
						{title}
					</h3>
					<div className="flex items-center gap-1">
						<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
						<span className="font-medium">{rating.toFixed(1)}</span>
						<span className="text-gray-500 text-sm">({reviewsCount})</span>
					</div>
				</div>

				<p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

				<div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
					<MapPin className="w-4 h-4" />
					<span>{location}</span>
				</div>

				<div className="flex items-center justify-between">
					<div>
						<div className="text-2xl font-bold text-gray-900">
							{pricePerDay.toLocaleString("ru-RU")} ₽
							<span className="text-sm font-normal text-gray-500"> / день</span>
						</div>
						<p className="text-sm text-gray-500">+ страховка от 500 ₽</p>
					</div>

					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onViewDetails(id)}
						>
							Подробнее
						</Button>
						<Button
							size="sm"
							disabled={!isAvailable}
							onClick={() => onBook(id)}
						>
							<Calendar className="w-4 h-4 mr-2" />
							Забронировать
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
