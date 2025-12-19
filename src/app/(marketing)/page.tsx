"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoriesGrid, type categoryIcons } from "@/components/core/CategoriesGrid";
import { EquipmentGrid } from "@/components/core/EquipmentGrid";
import { Filters } from "@/components/core/Filters/Filters";
import { HeroSection } from "@/components/layouts/HeroSection";
import { HowItWorks } from "@/components/layouts/HowItWorks";
import { Testimonials } from "@/components/layouts/Testimonials";
import { useEquipment } from "@/hooks/useEquipment";

type CategoryIcon = keyof typeof categoryIcons;

interface Category {
	id: string;
	name: string;
	icon: CategoryIcon;
	count: number;
}

const categories: Category[] = [
	{ id: "cameras", name: "Камеры", icon: "cameras", count: 42 },
	{ id: "lenses", name: "Объективы", icon: "lenses", count: 28 },
	{ id: "lighting", name: "Свет", icon: "lighting", count: 35 },
	{ id: "audio", name: "Аудио", icon: "audio", count: 19 },
	{ id: "accessories", name: "Аксессуары", icon: "accessories", count: 67 },
	{ id: "drones", name: "Дроны", icon: "drones", count: 15 },
];

export default function HomePage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

	const { equipment, isLoading, error } = useEquipment({
		search: searchQuery,
		category: selectedCategory,
		minPrice: priceRange[0],
		maxPrice: priceRange[1],
	});

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const handleCategoryChange = (categoryId: string) => {
		setSelectedCategory(categoryId);
	};

	const handlePriceRangeChange = (min: number, max: number) => {
		setPriceRange([min, max]);
	};

	const handleBookEquipment = (id: string) => {
		router.push(`/booking/${id}`);
	};

	const handleViewDetails = (id: string) => {
		router.push(`/equipment/${id}`);
	};

	const handleCategoryClick = (categoryId: string) => {
		setSelectedCategory(categoryId);
		router.push(`/equipment?category=${categoryId}`);
	};

	return (
		<div className="min-h-screen">
			{/* HeroSection */}
			<HeroSection />

			{/* Categories */}
			<section className="py-12 bg-gray-50">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-10">Популярные категории</h2>
					<CategoriesGrid categories={categories} onCategoryClick={handleCategoryClick} />
				</div>
			</section>

			{/* Equipment container */}
			<section className="py-12">
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center mb-8">
						<h2 className="text-3xl font-bold">Доступное оборудование</h2>
						<p className="text-gray-600">
							Найдено <span className="font-bold text-blue-600">{equipment.length}</span> единиц
							техники
						</p>
					</div>

					{/* Filters */}
					<Filters
						categories={categories}
						onSearch={handleSearch}
						onCategoryChange={handleCategoryChange}
						onPriceRangeChange={handlePriceRangeChange}
					/>

					{/* Equipment grid */}
					{isLoading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-4 text-gray-600">Загружаем оборудование...</p>
						</div>
					) : error ? (
						<div className="text-center py-12 text-red-600">Ошибка загрузки оборудования</div>
					) : (
						<EquipmentGrid
							equipment={equipment}
							onBook={handleBookEquipment}
							onViewDetails={handleViewDetails}
						/>
					)}
				</div>
			</section>
			{/* How it works */}
			<HowItWorks />
			{/* Testimonials */}
			<Testimonials />
		</div>
	);
}
