"use client";

import { ChevronDown, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface FiltersProps {
	categories: Array<{ id: string; name: string }>;
	onSearch: (query: string) => void;
	onCategoryChange: (categoryId: string) => void;
	onPriceRangeChange: (min: number, max: number) => void;
}

export function Filters({
	categories,
	onSearch,
	onCategoryChange,
	onPriceRangeChange,
}: FiltersProps) {
	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Search */}
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<Input
							placeholder="Искать оборудование (камера, объектив, свет...)"
							className="pl-10"
							onChange={(e) => onSearch(e.target.value)}
						/>
					</div>
				</div>

				{/* Categories */}
				<div className="w-full md:w-64">
					<Select onValueChange={onCategoryChange}>
						<SelectTrigger>
							<SelectValue placeholder="Все категории" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все категории</SelectItem>
							{categories.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Price */}
				<div className="w-full md:w-64">
					<Select
						onValueChange={(value) => {
							const [min, max] = value.split("-").map(Number);
							onPriceRangeChange(min ?? 0, max ?? Infinity);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder="Любая цена" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="0-5000">До 5 000 ₽</SelectItem>
							<SelectItem value="5000-15000">5 000 - 15 000 ₽</SelectItem>
							<SelectItem value="15000-30000">15 000 - 30 000 ₽</SelectItem>
							<SelectItem value="30000-100000">От 30 000 ₽</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Sub filters */}
				<Button variant="outline" className="whitespace-nowrap">
					<Filter className="mr-2 h-4 w-4" />
					Фильтры
					<ChevronDown className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
