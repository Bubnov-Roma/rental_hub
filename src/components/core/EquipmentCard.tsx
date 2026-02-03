"use client";

import { AlertTriangle, Box, Info, Star } from "lucide-react";
import Image from "next/image";
import {
	Badge,
	Button,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui";
import type { Equipment } from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";

interface EquipmentCardProps {
	item: Equipment;
	onBook?: (id: string) => void;
}

export function EquipmentCard({ item, onBook }: EquipmentCardProps) {
	return (
		<div
			className={cn(
				"group relative glass-container rounded-[2rem] overflow-hidden bg-foreground/2 border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]"
			)}
		>
			{/* Изображение и Бейджи */}
			<div className="relative h-52 w-full overflow-hidden">
				<Image
					src={item.imageUrl || "/placeholder-equipment.png"}
					alt={item.title}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					className="object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				<div className="absolute top-3 left-3 flex flex-col gap-2">
					<Badge
						variant={item.status === "available" ? "default" : "destructive"}
						className="rounded-full backdrop-blur-md"
					>
						{item.status === "available" ? "Доступно" : "В аренде"}
					</Badge>
					{item.ownership_type === "sublease" && (
						<Badge
							variant="outline"
							className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 rounded-full backdrop-blur-md"
						>
							Субаренда
						</Badge>
					)}
				</div>

				{/* Быстрые индикаторы (Комплект и Дефекты) */}
				<div className="absolute top-3 right-3 flex gap-2">
					<TooltipProvider>
						{item.kit && (
							<Tooltip>
								<TooltipTrigger>
									<Box size={18} className="text-white/70 hover:text-white" />
								</TooltipTrigger>
								<TooltipContent>Комплектация: {item.kit}</TooltipContent>
							</Tooltip>
						)}
						{item.defects && (
							<Tooltip>
								<TooltipTrigger>
									<AlertTriangle
										size={18}
										className="text-yellow-500/70 hover:text-yellow-500"
									/>
								</TooltipTrigger>
								<TooltipContent>
									Есть особенности: {item.defects}
								</TooltipContent>
							</Tooltip>
						)}
					</TooltipProvider>
				</div>
			</div>

			{/* Контент */}
			<div className="p-5 space-y-4">
				<div>
					<div className="flex justify-between items-start">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-12">
										{item.title}
									</h3>
								</TooltipTrigger>
								<TooltipContent>
									<p>{item.title}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<div className="flex items-center gap-1 text-yellow-500">
							<Star size={14} fill="currentColor" />
							<span className="text-xs font-medium">{item.rating}</span>
						</div>
					</div>
					<p className="text-xs text-muted-foreground mt-1 line-clamp-1">
						{item.category}
					</p>
				</div>

				<div className="grid grid-cols-3 gap-1 p-1 bg-foreground/5 rounded-2xl border border-white/5">
					<PriceOption label="4 часа" price={item.price_4h} />
					<PriceOption label="8 часов" price={item.price_8h} />
					<PriceOption label="Сутки" price={item.price_per_day} isMain />
				</div>

				<div className="flex items-center gap-2 pt-2">
					<Button
						onClick={() => onBook?.(item.id)}
						className="flex-1 rounded-xl font-bold py-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
					>
						Забронировать
					</Button>
					<Button
						variant="secondary"
						size="icon"
						className="rounded-xl h-12 w-12 shrink-0"
					>
						<Info size={20} />
					</Button>
				</div>
			</div>
		</div>
	);
}

function PriceOption({
	label,
	price,
	isMain,
}: {
	label: string;
	price: number;
	isMain?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-2 rounded-xl transition-colors",
				isMain
					? "bg-background shadow-sm text-primary"
					: "text-muted-foreground"
			)}
		>
			<span className="text-[9px] uppercase font-black tracking-tighter opacity-60">
				{label}
			</span>
			<span className="text-[13px] font-bold">{price}₽</span>
		</div>
	);
}
