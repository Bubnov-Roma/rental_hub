"use client";

import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
	return (
		<section className="relative overflow-hidden text-(--text-main)">
			<div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
			<div className="container relative mx-auto px-4">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground-900 sm:text-6xl md:text-7xl">
						Аренда профессионального{" "}
						<span className="bg-linear-to-r from-blue-200 to-primary bg-clip-text text-transparent">
							фото-видео оборудования
						</span>
					</h1>
					<p className="mb-10 text-lg text-foreground-600 sm:text-xl">
						Более 500 единиц техники от проверенных брендов. Бронируйте онлайн,
						получайте в день аренды. Идеальное решение для съемок, мероприятий и
						творческих проектов.
					</p>

					<div className="mx-auto mb-8 max-w-2xl">
						<div className="flex flex-col gap-4 sm:flex-row">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/30 z-1" />
								<Input
									placeholder="Что ввм нужно? (камера, объектив, свет, микрофон...)"
									className="h-12 pl-10 text-base"
								/>
							</div>
							<Button size="lg" className="h-12 gap-2 px-8">
								Найти оборудование
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="flex flex-wrap justify-center gap-6 text-sm text-foreground-600">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-green-500"></div>
							<span>Мгновенное бронирование</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-blue-500"></div>
							<span>Страхование включено</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-purple-500"></div>
							<span>Техническая поддержка 24/7</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
