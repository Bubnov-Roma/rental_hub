import { Camera, Drone, Headphones, Mic, Video, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const categoryIcons = {
	cameras: Camera,
	lenses: Video,
	lighting: Zap,
	audio: Mic,
	accessories: Headphones,
	drones: Drone,
};

interface Category {
	id: string;
	name: string;
	icon: keyof typeof categoryIcons;
	count: number;
}

interface CategoriesGridProps {
	categories: Category[];
	onCategoryClick?: (categoryId: string) => void;
}

export function CategoriesGrid({ categories, onCategoryClick }: CategoriesGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
			{categories.map((category) => {
				const Icon = categoryIcons[category.icon] || Camera;
				return (
					<Button
						key={category.id}
						onClick={() => onCategoryClick?.(category.id)}
						className={cn(
							"group relative flex flex-col items-center justify-center rounded-xl border bg-white p-6 transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg",
							"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						)}
					>
						<div className="mb-3 rounded-full bg-blue-100 p-3 group-hover:bg-blue-200">
							<Icon className="h-6 w-6 text-blue-600" />
						</div>
						<h3 className="font-semibold text-gray-900">{category.name}</h3>
						<p className="mt-1 text-sm text-gray-600">{category.count} единиц</p>
						<div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200"></div>
					</Button>
				);
			})}
		</div>
	);
}
