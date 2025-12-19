"use client";

import { Calendar, Check, ChevronLeft, Clock, MapPin, Shield, Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateTimeRangePicker } from "@/components/ui/dateTimeRangePicker";
import { useEquipmentDetails } from "@/hooks/useEquipmentDetails";

export default function EquipmentDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const equipmentId = params.id as string;

	const { equipment, isLoading } = useEquipmentDetails(equipmentId);
	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
	const [startDate, endDate] = dateRange;
	const [insurance, setInsurance] = useState(true);
	const [selectedImage, setSelectedImage] = useState(0);

	const calculateTotal = () => {
		if (!startDate || !endDate || !equipment) return 0;

		const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

		return days * equipment.price_per_day + (insurance ? 500 * days : 0);
	};

	const handleBook = () => {
		router.push(`/booking/${equipmentId}`);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!equipment) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<h2 className="text-2xl font-bold text-red-600">Оборудование не найдено</h2>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4">
				<Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
					<ChevronLeft className="h-4 w-4" />
					Назад к каталогу
				</Button>

				<div className="grid gap-8 lg:grid-cols-2">
					{/* Левая колонка */}
					<div>
						{/* Главное изображение */}
						<div className="mb-4 overflow-hidden rounded-xl bg-white p-2 shadow-sm">
							<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
								<Image
									src={equipment.images?.[selectedImage] || equipment.imageUrl}
									alt={equipment.title}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
							</div>
						</div>

						{/* Галерея */}
						{equipment.images && equipment.images.length > 1 && (
							<div className="mb-6 grid grid-cols-4 gap-2">
								{equipment.images.map((img: string, index: number) => (
									<Button
										key={img}
										onClick={() => setSelectedImage(index)}
										className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 ${
											selectedImage === index ? "border-blue-500" : "border-transparent"
										}`}
									>
										<Image
											src={img}
											alt={`${equipment.title} ${index + 1}`}
											fill
											className="object-cover"
										/>
									</Button>
								))}
							</div>
						)}

						{/* Description */}
						<Card className="mb-6">
							<CardContent className="p-6">
								<h3 className="mb-4 text-xl font-bold">Описание</h3>
								<p className="text-gray-700">{equipment.description}</p>
							</CardContent>
						</Card>

						{/* Specifications */}
						<Card>
							<CardContent className="p-6">
								<h3 className="mb-4 text-xl font-bold">Характеристики</h3>
								<div className="grid gap-3">
									{Object.entries(equipment.specifications || {}).map(([key, value]) => (
										<div key={key} className="flex justify-between border-b pb-2">
											<span className="text-gray-600">{key}:</span>
											<span className="font-medium">{value as string}</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column */}
					<div className="space-y-6">
						<div className="sticky top-6 space-y-6">
							{/* Booking Card */}
							<Card>
								<CardContent className="p-6">
									<div className="mb-6">
										<h1 className="mb-2 text-2xl font-bold">{equipment.title}</h1>
										<div className="flex items-center gap-2 text-gray-600">
											<MapPin className="h-4 w-4" />
											<span>Москва, Пункт выдачи №1</span>
										</div>
									</div>

									<div className="mb-6">
										<div className="mb-4 flex items-center gap-2">
											<Calendar className="h-5 w-5 text-blue-600" />
											<h3 className="font-semibold">Даты аренды</h3>
										</div>
										<DateTimeRangePicker
											startDate={startDate}
											endDate={endDate}
											onChange={(update) => setDateRange(update)}
										/>
									</div>

									{/* Insurance */}
									<div className="mb-6 rounded-lg bg-blue-50 p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Shield className="h-5 w-5 text-blue-600" />
												<div>
													<h4 className="font-semibold">Страхование</h4>
													<p className="text-sm text-gray-600">500 ₽/день</p>
												</div>
											</div>
											<label className="relative inline-flex cursor-pointer items-center">
												<input
													type="checkbox"
													className="peer sr-only"
													checked={insurance}
													onChange={(e) => setInsurance(e.target.checked)}
												/>
												<div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
											</label>
										</div>
									</div>

									{/* Total */}
									<div className="mb-6 space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-600">Аренда</span>
											<span className="font-medium">
												{startDate && endDate
													? (
															equipment.price_per_day *
															(Math.ceil(
																(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
															) +
																1)
														).toLocaleString("ru-RU")
													: 0}{" "}
												₽
											</span>
										</div>
										{insurance && (
											<div className="flex justify-between">
												<span className="text-gray-600">Страхование</span>
												<span className="font-medium">
													{startDate && endDate
														? (
																500 *
																(Math.ceil(
																	(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
																) +
																	1)
															).toLocaleString("ru-RU")
														: 0}{" "}
													₽
												</span>
											</div>
										)}
										<div className="border-t pt-3">
											<div className="flex justify-between text-lg font-bold">
												<span>Итого</span>
												<span className="text-blue-600">
													{calculateTotal().toLocaleString("ru-RU")} ₽
												</span>
											</div>
										</div>
									</div>

									<Button
										size="lg"
										className="w-full gap-2 py-6 text-lg"
										onClick={handleBook}
										disabled={!startDate || !endDate}
									>
										<Check className="h-6 w-6" />
										Забронировать
									</Button>

									<div className="mt-4 space-y-2 text-sm text-gray-600">
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4" />
											<span>Бесплатная отмена за 48 часов</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Информация о рейтинге */}
							<Card>
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<div className="mb-2 flex items-center gap-2">
												{[...Array(5)].map((_, i) => (
													<Star
														key={`${equipment.id}-star-${i}`}
														className={`h-5 w-5 ${
															i < Math.floor(equipment.rating)
																? "fill-yellow-400 text-yellow-400"
																: "fill-gray-200 text-gray-200"
														}`}
													/>
												))}
												<span className="font-bold">{equipment.rating.toFixed(1)}</span>
											</div>
											<p className="text-sm text-gray-600">{equipment.reviewsCount} отзывов</p>
										</div>
										<Button variant="outline">Оставить отзыв</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
