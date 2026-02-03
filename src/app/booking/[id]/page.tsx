"use client";

import { Calendar, Check, Clock, MapPin, Shield } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DateTimeRangePicker } from "@/components/ui/dateTimeRangePicker";
import { useEquipmentDetails } from "@/hooks/useEquipmentDetails";

export default function BookingPage() {
	const params = useParams();
	const equipmentId = params.id as string;

	const { equipment, isLoading } = useEquipmentDetails(equipmentId);
	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
		null,
		null,
	]);
	const [startDate, endDate] = dateRange;

	const [insurance, setInsurance] = useState(true);

	const calculateTotal = () => {
		if (!startDate || !endDate || !equipment) return 0;

		const days =
			Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
			) + 1;

		const equipmentCost = days * equipment.price_per_day;
		const insuranceCost = insurance ? 500 * days : 0;

		return equipmentCost + insuranceCost;
	};

	const handleBook = async () => {
		// TODO: Booking logic here
		console.log("Booking:", {
			equipmentId,
			dates: dateRange,
			insurance,
			total: calculateTotal(),
		});
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!equipment) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<h2 className="text-2xl font-bold text-red-600">
					Оборудование не найдено
				</h2>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto">
					{/* Breadcrumbs */}
					<div className="text-sm text-gray-600 mb-8">
						<a href="/" className="hover:text-blue-600">
							Главная
						</a>
						<span className="mx-2">/</span>
						<a href="/equipment" className="hover:text-blue-600">
							Каталог
						</a>
						<span className="mx-2">/</span>
						<span className="text-gray-900 font-medium">{equipment.title}</span>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						{/* Left Column - Equipment Information */}
						<div>
							{/* Gallery */}
							<div className="mb-8">
								<div className="relative h-96 w-full rounded-2xl overflow-hidden bg-gray-100 mb-4">
									<Image
										src={equipment.imageUrl || "/placeholder-equipment.png"}
										alt={equipment.title}
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										fill
										className="object-cover"
									/>
								</div>
								<div className="grid grid-cols-4 gap-2">
									{[1, 2, 3, 4].map((i) => (
										<div
											key={i}
											className="relative h-24 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
										>
											<Image
												src={equipment.imageUrl || "/placeholder-equipment.jpg"}
												alt={`${equipment.title} ${i}`}
												fill
												className="object-cover hover:opacity-90"
											/>
										</div>
									))}
								</div>
							</div>

							{/* Description and Specifications */}
							<div className="bg-white rounded-2xl p-6 shadow-sm">
								<h2 className="text-2xl font-bold mb-4">Описание</h2>
								<p className="text-gray-600 mb-8">{equipment.description}</p>

								<h3 className="text-xl font-bold mb-4">Характеристики</h3>
								<div className="grid grid-cols-2 gap-4">
									{Object.entries(equipment.specifications).map(
										([key, value]) => (
											<div
												key={key}
												className="flex justify-between border-b pb-2"
											>
												<span className="text-gray-600">{key}:</span>
												<span className="font-medium">{value as string}</span>
											</div>
										)
									)}
								</div>
							</div>
						</div>

						{/* Right Column - Booking */}
						<div className="space-y-6">
							{/* Booking Card */}
							<div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
								<div className="flex justify-between items-start mb-6">
									<div>
										<h1 className="text-2xl font-bold mb-2">
											{equipment.title}
										</h1>
										<div className="flex items-center gap-2 text-gray-600">
											<MapPin className="w-4 h-4" />
											<span>Москва, Пункт выдачи №1</span>
										</div>
									</div>
									<div className="text-3xl font-bold text-blue-600">
										{equipment.price_per_day.toLocaleString("ru-RU")} ₽
										<span className="text-sm font-normal text-gray-500">
											{" "}
											/ день
										</span>
									</div>
								</div>

								{/* Date Selection */}
								<div className="mb-6">
									<div className="flex items-center gap-2 mb-4">
										<Calendar className="w-5 h-5 text-blue-600" />
										<h3 className="font-semibold">Выберите даты аренды</h3>
									</div>
									<DateTimeRangePicker
										startDate={startDate}
										endDate={endDate}
										onChange={(update) => setDateRange(update)}
									/>
								</div>

								{/* Insurance */}
								<div className="mb-6">
									<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
										<div className="flex items-center gap-3">
											<Shield className="w-5 h-5 text-blue-600" />
											<div>
												<h4 className="font-semibold">
													Страхование оборудования
												</h4>
												<p className="text-sm text-gray-600">
													500 ₽/день, покрытие до 100 000 ₽
												</p>
											</div>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												className="sr-only peer"
												checked={insurance}
												onChange={(e) => setInsurance(e.target.checked)}
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
										</label>
									</div>
								</div>

								{/* Total */}
								<div className="mb-6">
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-600">
												Аренда (
												{startDate && endDate
													? Math.ceil(
															(endDate.getTime() - startDate.getTime()) /
																(1000 * 60 * 60 * 24)
														) + 1
													: 0}{" "}
												дней)
											</span>
											<span className="font-medium">
												{startDate && endDate
													? (
															equipment.price_per_day *
															(Math.ceil(
																(endDate.getTime() - startDate.getTime()) /
																	(1000 * 60 * 60 * 24)
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
																	(endDate.getTime() - startDate.getTime()) /
																		(1000 * 60 * 60 * 24)
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
								</div>

								{/* Button for booking */}
								<Button
									size="lg"
									className="w-full py-6 text-lg font-semibold"
									onClick={handleBook}
									disabled={!startDate || !endDate}
								>
									<Check className="w-6 h-6 mr-2" />
									Забронировать сейчас
								</Button>

								{/* Additional Information */}
								<div className="mt-6 space-y-3 text-sm text-gray-600">
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4" />
										<span>Бесплатная отмена за 48 часов</span>
									</div>
									<p className="text-center">
										Оплата будет списана только после подтверждения владельца
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
