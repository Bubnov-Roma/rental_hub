import { CalendarCheck, CreditCard, Package, Search, Star } from "lucide-react";

const steps = [
	{
		icon: Search,
		title: "Найдите оборудование",
		description:
			"Ищите по категориям, фильтруйте по цене и характеристикам. У нас есть всё для профессиональных съемок.",
	},
	{
		icon: CalendarCheck,
		title: "Выберите даты",
		description:
			"Укажите удобные даты аренды. Календарь покажет доступность в реальном времени.",
	},
	{
		icon: CreditCard,
		title: "Быстрое бронирование",
		description:
			"Оплатите онлайн или при получении. Подтверждение приходит мгновенно.",
	},
	{
		icon: Package,
		title: "Получите оборудование",
		description:
			"Заберите заказ в пункте выдачи или закажите доставку. Все устройства проверены и готовы к работе.",
	},
	{
		icon: Star,
		title: "Верните и оцените",
		description:
			"После съемок верните технику и оставьте отзыв. Получайте скидки за активность!",
	},
];

export function HowItWorks() {
	return (
		<section className="py-16 bg-gradient-to-b from-white to-gray-50">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
						Как арендовать оборудование
					</h2>
					<p className="mb-12 text-lg text-gray-600">
						Весь процесс занимает меньше 5 минут — от поиска до бронирования
					</p>
				</div>

				<div className="relative">
					{/* Линия соединения */}
					<div className="absolute left-1/2 top-12 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-200 to-purple-200 md:left-1/2"></div>

					<div className="grid gap-8 md:grid-cols-5">
						{steps.map((step, index) => (
							<div key={step.title} className="relative">
								<div className="flex flex-col items-center text-center">
									<div className="relative mb-4">
										<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
											<step.icon className="h-8 w-8 text-blue-600" />
										</div>
										<div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
											{index + 1}
										</div>
									</div>
									<h3 className="mb-2 font-semibold text-gray-900">
										{step.title}
									</h3>
									<p className="text-sm text-gray-600">{step.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="mt-16 text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-6 py-3">
						<div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
						<span className="text-sm font-medium text-green-700">
							Среднее время бронирования — 3 минуты
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
