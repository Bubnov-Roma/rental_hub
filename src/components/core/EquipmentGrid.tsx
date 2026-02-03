"use client";

import { Box } from "lucide-react";
import { Progress, Skeleton } from "@/components/ui";
import type { Equipment } from "@/core/domain/entities/Equipment";
import { EquipmentCard } from "./EquipmentCard";

interface EquipmentGridProps {
	items: Equipment[];
	isLoading: boolean;
}

export function EquipmentGrid({ items, isLoading }: EquipmentGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
				<div className="fixed top-16 left-0 w-full z-50">
					<Progress
						value={undefined}
						className="h-1 rounded-none bg-PRIMARY/20"
					/>
				</div>
				{[...Array(8)].map(() => {
					const uniqueKey = crypto.randomUUID();
					return (
						<Skeleton
							key={uniqueKey}
							className="h-105 rounded-[2rem] bg-foreground/5 animate-pulse"
						/>
					);
				})}
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<div className="w-20 h-20 mb-4 bg-foreground/5 rounded-full flex items-center justify-center">
					<Box size={40} className="text-muted-foreground opacity-20" />
				</div>
				<h3 className="text-xl font-bold">Ничего не найдено</h3>
				<p className="text-muted-foreground">
					Попробуйте изменить фильтры или категорию
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
			{items.map((item) => (
				<EquipmentCard
					key={item.id}
					item={item}
					onBook={(id) => console.log("Book", id)}
				/>
			))}
		</div>
	);
}
