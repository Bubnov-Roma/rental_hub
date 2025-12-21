import { Calendar, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
		<Card className="group relative overflow-hidden border shadow-sm transition-all hover:shadow-lg">
			{/* Статус доступности */}
			<div className="absolute left-3 top-3 z-10">
				<div
					className={`rounded-full px-3 py-1 text-sm font-medium ${
						isAvailable
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{isAvailable ? "Доступно" : "Занято"}
				</div>
			</div>

			{/* Изображение */}
			<div className="relative aspect-square overflow-hidden bg-gray-100">
				<Image
					src={imageUrl}
					alt={title}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
				{/* Категория */}
				<div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
					{category}
				</div>
			</div>

			<CardContent className="p-4">
				<div className="mb-2 flex items-start justify-between">
					<h3 className="line-clamp-1 font-semibold text-gray-900">{title}</h3>
					<div className="flex items-center gap-1">
						<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
						<span className="font-medium">{rating.toFixed(1)}</span>
						<span className="text-sm text-gray-500">({reviewsCount})</span>
					</div>
				</div>

				<p className="mb-3 line-clamp-2 text-sm text-gray-600">{description}</p>

				<div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
					<MapPin className="h-4 w-4" />
					<span>{location}</span>
				</div>

				<div className="text-2xl font-bold text-gray-900">
					{pricePerDay.toLocaleString("ru-RU")} ₽
					<span className="text-sm font-normal text-gray-500"> / день</span>
				</div>
			</CardContent>

			<CardFooter className="flex gap-2 p-4 pt-0">
				<Button
					variant="outline"
					className="flex-1"
					onClick={() => onViewDetails(id)}
				>
					Подробнее
				</Button>
				<Button
					className="flex-1 gap-2"
					disabled={!isAvailable}
					onClick={() => onBook(id)}
				>
					<Calendar className="h-4 w-4" />
					Забронировать
				</Button>
			</CardFooter>
		</Card>
	);
}
