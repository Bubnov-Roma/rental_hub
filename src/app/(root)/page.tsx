import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { getBannersFromDb } from "@/actions/banner-actions";
import { getCategoriesFromDb } from "@/actions/category-actions";
import { getEquipment } from "@/actions/equipment-actions";
import { auth } from "@/auth";
import { CategoriesGrid } from "@/components/core/CategoriesGrid";
import { BannerCarousel } from "@/components/home/events-banner/BannerCarousel";
import { HowItWorks } from "@/components/home/how-it-works/HowItWorks";
import { EquipmentCard } from "@/components/shared/EquipmentCard";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
	const [banners, categories, featuredItems, session] = await Promise.all([
		getBannersFromDb(),
		getCategoriesFromDb(),
		// Берём isPrimary позиции для слайдера популярного
		getEquipment({ categorySlug: "all" }),
		auth(),
	]);

	// Популярные позиции — первые 8 isPrimary
	const popular = featuredItems.filter((i) => i.isPrimary).slice(0, 8);
	const isAdmin =
		session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER";

	return (
		<div className="flex flex-col gap-12 pb-20">
			{/* ── Hero + баннеры ── */}
			<section className="container mx-auto px-4 pt-8 md:pt-12">
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 items-start">
					{/* Левая колонка — текст + поиск */}
					<div className="space-y-6">
						<div className="space-y-4">
							<p className="text-xs font-bold uppercase tracking-wider sm:tracking-[0.2em] text-primary/70">
								Аренда фото-видео оборудования · Самара
							</p>
							<h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] uppercase italic pb-2">
								<span className="text-primary tracking-wider">LINZA</span>
								<br />
								<span className="text:2xl font-black text-foreground/60">
									техника для профи
								</span>
							</h1>
							<div className="flex flex:col sm:flex-row gap-8 items-baseline">
								<p className="text-muted-foreground text-xs sm:text-base max-w-md leading-relaxed">
									Камеры, объективы, свет, звук и многое другое.
									<br />
									Более 500 позиций от проверенных брендов.
								</p>
							</div>
						</div>

						{/* <div className="flex flex-wrap gap-3">
							<Button asChild size="lg" className="gap-2 font-bold">
								<Link href="/equipment">
									Смотреть каталог
									<ArrowRightIcon size={16} />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/equipment?category=cameras">Камеры</Link>
							</Button>
						</div> */}

						{/* Бейджи доверия */}
						{/* <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
							{[
								{ dot: "bg-green-500", text: "Мгновенное бронирование" },
								{ dot: "bg-blue-500", text: "Страхование включено" },
								{ dot: "bg-primary", text: "Техподдержка 24/7" },
							].map((b) => (
								<div key={b.text} className="flex items-center gap-1.5">
									<span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} />
									{b.text}
								</div>
							))}
						</div> */}
					</div>

					{/* Правая колонка — баннеры */}
					<div className="w-full">
						{banners.length > 0 ? (
							<BannerCarousel banners={banners} />
						) : isAdmin ? (
							<div className="rounded-2xl border border-dashed border-foreground/15 p-8 text-center text-sm text-muted-foreground">
								<p className="font-bold mb-1">Баннеры не добавлены</p>
								<p className="text-xs mb-3">
									Создайте новый баннер в панели администратора
								</p>
								<Button asChild size="sm" variant="outline">
									<Link href="/admin">Перейти в админку</Link>
								</Button>
							</div>
						) : null}
					</div>
				</div>
			</section>

			{/* ── Как это работает ── */}
			<HowItWorks />

			{/* ── Категории ── */}
			<CategoriesGrid categories={categories} />

			{/* ── Популярное оборудование ── */}
			{popular.length > 0 && (
				<section className="container mx-auto px-4 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-black uppercase italic tracking-tight">
							Популярное
						</h2>
						<Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
							<Link href="/equipment">
								Все позиции <ArrowRightIcon size={12} />
							</Link>
						</Button>
					</div>
					{/* Горизонтальный скролл на мобиле, сетка на десктопе */}
					<div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-4 md:overflow-visible">
						{popular.map((item) => (
							<div key={item.id} className="shrink-0 w-55 md:w-auto">
								<EquipmentCard item={item} />
							</div>
						))}
					</div>
				</section>
			)}

			{/* ── CTA Studio ── */}
			<section className="container mx-auto px-4">
				<div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-8 md:p-12">
					{/* Декоративный фон */}
					<div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)),transparent_60%)]" />
					<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
						<div className="space-y-2">
							<p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">
								Фотостудия Linza
							</p>
							<h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight leading-tight">
								Снять студию
								<br />
								для проекта?
							</h2>
							<p className="text-sm opacity-70 max-w-sm">
								Аренда оборудованной фотостудии с постоянным и импульсным
								светом, циклорамой и зоной ожидания.
							</p>
						</div>
						<div className="flex flex-col gap-3">
							<Button
								asChild
								variant="outline"
								size="lg"
								className="bg-transparent border-background/30 text-background hover:bg-background/10 font-bold"
							>
								<Link href="/equipment?category=studio">
									Студийное оборудование
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* ── Статистика ── */}
			<section className="container mx-auto px-4">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{[
						{ value: "500+", label: "Единиц техники" },
						{ value: "98%", label: "Положительных отзывов" },
						{ value: "1000+", label: "Успешных аренд" },
						{ value: "24/7", label: "Техподдержка" },
					].map((stat) => (
						<div
							key={stat.label}
							className="text-center p-6 rounded-2xl border border-foreground/8 bg-foreground/2"
						>
							<div className="text-3xl font-black text-primary">
								{stat.value}
							</div>
							<div className="text-xs text-muted-foreground mt-1">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
