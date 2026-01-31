"use client";

import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const testimonials = [
	{
		id: 1,
		name: "Александр Петров",
		role: "Кинооператор",
		content:
			"Регулярно арендую камеры и объективы для съемок. Качество техники всегда на высоте, а поддержка помогает даже в нестандартных ситуациях. Надежный сервис!",
		rating: 5,
		avatar: "AP",
	},
	{
		id: 2,
		name: "Мария Иванова",
		role: "Фотограф на свадьбах",
		content:
			"Беру оборудование на каждую свадьбу. Всегда чистое, проверенное, с полным комплектом аксессуаров. Клиенты довольны качеством снимков!",
		rating: 5,
		avatar: "MI",
	},
	{
		id: 3,
		name: "Дмитрий Соколов",
		role: "Контент-мейкер",
		content:
			"Идеальное решение для стримов и YouTube. Свет, микрофоны, камеры — всё в одном месте. Экономлю время и деньги.",
		rating: 4,
		avatar: "ДС",
	},
	{
		id: 4,
		name: "Екатерина Новикова",
		role: "Event-организатор",
		content:
			"Для мероприятий арендуем постоянно. Техника работает без сбоев, доставка точно по графику. Рекомендую коллегам!",
		rating: 5,
		avatar: "ЕН",
	},
];

export function Testimonials() {
	const [currentIndex, setCurrentIndex] = useState(0);

	const next = () => {
		setCurrentIndex((prev) => (prev + 1) % testimonials.length);
	};

	const prev = () => {
		setCurrentIndex(
			(prev) => (prev - 1 + testimonials.length) % testimonials.length
		);
	};

	const currentTestimonial = testimonials[currentIndex];

	if (!currentTestimonial) return null;

	return (
		<section className="py-16 bg-linear-to-b from-gray-50 to-background">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-5xl">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold text-foreground/90 sm:text-4xl">
							Отзывы наших клиентов
						</h2>
						<p className="text-lg text-foreground/60">
							Более 1000 успешных аренд и 98% положительных отзывов
						</p>
					</div>

					<div className="relative">
						<div className="overflow-hidden rounded-2xl p-8 shadow-xs md:p-12 bg-white">
							<Quote className="mb-6 h-12 w-12 text-blue-200" />

							<div className="mb-8">
								<p className="text-lg italic text-gray-700 md:text-xl">
									"{currentTestimonial.content}"
								</p>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
										{currentTestimonial.avatar}
									</div>
									<div>
										<h4 className="font-semibold text-gray-800">
											{currentTestimonial?.name}
										</h4>
										<p className="text-sm text-gray-500">
											{currentTestimonial?.role}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-1">
									{[...Array(5)].map((_, i) => (
										<Star
											key={`${currentTestimonial.id}-star-${i}`}
											className={cn(
												"h-5 w-5",
												i < currentTestimonial.rating
													? "fill-yellow-400 text-yellow-400"
													: "fill-gray-200 text-gray-200"
											)}
										/>
									))}
								</div>
							</div>
						</div>

						{/* Навигация */}
						<div className="mt-8 flex items-center justify-center gap-4">
							<Button
								variant="outline"
								size="icon"
								onClick={prev}
								className="h-10 w-10 rounded-full"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>

							<div className="flex gap-2">
								{testimonials.map((item, index) => (
									<Button
										key={item.id}
										onClick={() => setCurrentIndex(index)}
										className={cn(
											"h-2 rounded-full transition-all",
											index === currentIndex
												? "w-8 bg-blue-600"
												: "w-2 bg-gray-300 hover:bg-gray-400"
										)}
									/>
								))}
							</div>

							<Button
								variant="outline"
								size="icon"
								onClick={next}
								className="h-10 w-10 rounded-full"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">1,000+</div>
							<div className="text-sm text-gray-600">Успешных аренд</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">98%</div>
							<div className="text-sm text-gray-600">Положительных отзывов</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">24/7</div>
							<div className="text-sm text-gray-600">Техподдержка</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">500+</div>
							<div className="text-sm text-gray-600">Единиц техники</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
