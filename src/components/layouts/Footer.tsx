import { Camera, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t bg-gray-50">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					{/* Brand */}
					<div>
						<Link href="/" className="flex items-center gap-2">
							<Camera className="h-8 w-8 text-blue-600" />
							<span className="text-xl font-bold">Rentacamera</span>
						</Link>
						<p className="mt-4 text-gray-600">
							Платформа для аренды профессионального фото-видео оборудования
						</p>
					</div>

					{/* Quick links */}
					<div>
						<h3 className="text-lg font-semibold">Каталог</h3>
						<ul className="mt-4 space-y-2">
							<li>
								<Link
									href="/equipment?category=cameras"
									className="text-gray-600 hover:text-blue-600"
								>
									Камеры
								</Link>
							</li>
							<li>
								<Link
									href="/equipment?category=lenses"
									className="text-gray-600 hover:text-blue-600"
								>
									Объективы
								</Link>
							</li>
							<li>
								<Link
									href="/equipment?category=lighting"
									className="text-gray-600 hover:text-blue-600"
								>
									Свет
								</Link>
							</li>
							<li>
								<Link
									href="/equipment?category=audio"
									className="text-gray-600 hover:text-blue-600"
								>
									Аудио
								</Link>
							</li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="text-lg font-semibold">Компания</h3>
						<ul className="mt-4 space-y-2">
							<li>
								<Link
									href="/about"
									className="text-gray-600 hover:text-blue-600"
								>
									О нас
								</Link>
							</li>
							<li>
								<Link
									href="/blog"
									className="text-gray-600 hover:text-blue-600"
								>
									Блог
								</Link>
							</li>
							<li>
								<Link
									href="/careers"
									className="text-gray-600 hover:text-blue-600"
								>
									Вакансии
								</Link>
							</li>
							<li>
								<Link
									href="/press"
									className="text-gray-600 hover:text-blue-600"
								>
									Пресса
								</Link>
							</li>
						</ul>
					</div>

					{/* Contacts */}
					<div>
						<h3 className="text-lg font-semibold">Контакты</h3>
						<ul className="mt-4 space-y-3">
							<li className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-gray-400" />
								<a
									href="tel:+79999999999"
									className="text-gray-600 hover:text-blue-600"
								>
									+7 (999) 999-99-99
								</a>
							</li>
							<li className="flex items-center gap-2">
								<Mail className="h-4 w-4 text-gray-400" />
								<a
									href="mailto:info@rentalhub.com"
									className="text-gray-600 hover:text-blue-600"
								>
									info@rentalhub.com
								</a>
							</li>
							<li className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-gray-400" />
								<span className="text-gray-600">
									Москва, ул. Примерная, 123
								</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-8 border-t pt-8">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<p className="text-sm text-gray-600">
							© {new Date().getFullYear()} RentalHub. Все права защищены.
						</p>
						<div className="flex gap-6">
							<Link
								href="/privacy"
								className="text-sm text-gray-600 hover:text-blue-600"
							>
								Политика конфиденциальности
							</Link>
							<Link
								href="/terms"
								className="text-sm text-gray-600 hover:text-blue-600"
							>
								Условия использования
							</Link>
							<Link
								href="/cookies"
								className="text-sm text-gray-600 hover:text-blue-600"
							>
								Cookies
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
