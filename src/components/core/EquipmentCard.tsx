"use client";

import {
	faHeart as faHeartReg,
	faShareFromSquare,
} from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AddToCartButton } from "@/components/core/AddToCartButton";
import { PriceSelector } from "@/components/core/PriceSelector";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";
import { slugify } from "@/utils";

export function EquipmentCard({ item }: { item: GroupedEquipment }) {
	const [isFavorite, setIsFavorite] = useState(false);
	const imageRef = useRef<HTMLDivElement>(null);
	const slug = slugify(item.title);
	const isAvailable = item.available_count > 0;

	const handleShare = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		navigator.clipboard
			.writeText(`${window.location.origin}/equipment/item/${slug}`)
			.then(() => toast.success("Ссылка скопирована"))
			.catch(() => {});
	};

	const handleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsFavorite((v) => !v);
		if (!isFavorite) toast.success("Добавлено в избранное");
	};

	return (
		<article className="group flex flex-col bg-transparent">
			{/* ── Изображение ── */}
			<div
				ref={imageRef}
				className="relative aspect-4/3 rounded-xl overflow-hidden bg-foreground/5 mb-2.5 shrink-0"
			>
				<Link href={`/equipment/item/${slug}`} className="absolute inset-0">
					<Image
						src={item.imageUrl || "/placeholder.png"}
						alt={item.title}
						fill
						sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,20vw"
						className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
					/>
				</Link>

				{/* Бейдж доступности */}
				<span
					className={cn(
						"absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wider",
						"bg-black/55 backdrop-blur-sm rounded-full px-2 py-0.5",
						isAvailable ? "text-emerald-400" : "text-rose-400"
					)}
				>
					{isAvailable ? `${item.available_count} шт.` : "Нет в наличии"}
				</span>

				{/* Кнопки share/favorite */}
				<div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<button
						type="button"
						onClick={handleShare}
						aria-label="Поделиться"
						className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
					>
						<FontAwesomeIcon
							icon={faShareFromSquare}
							className="w-3 h-3 text-white"
						/>
					</button>
					<button
						type="button"
						onClick={handleFavorite}
						aria-label="В избранное"
						className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
					>
						<FontAwesomeIcon
							icon={isFavorite ? faHeartSolid : faHeartReg}
							className={cn(
								"w-3 h-3 transition-colors",
								isFavorite ? "text-primary" : "text-white"
							)}
						/>
					</button>
				</div>
			</div>

			{/* ── Контент ── */}
			<div className="flex flex-col flex-1 px-0.5 min-w-0 gap-y-2">
				{/* Название: строго 2 строки, без выпадения за границы */}
				<Link href={`/equipment/item/${slug}`} className="block mb-2">
					<h3
						className="text-sm font-bold leading-snug hover:text-primary transition-colors"
						style={{
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
							overflow: "hidden",
							// Фиксируем высоту ровно на 2 строки чтобы избежать выпадения третьей
							minHeight: "2.6em",
							maxHeight: "2.6em",
						}}
					>
						{item.title}
					</h3>
				</Link>

				{/* PriceSelector с AddToCartButton */}
				<div className="mt-auto">
					<PriceSelector
						prices={{
							day: item.price_per_day,
							h4: item.price_4h,
							h8: item.price_8h,
						}}
						compact
						action={
							<AddToCartButton
								item={item}
								sourceRef={imageRef as React.RefObject<HTMLElement | null>}
								size="sm"
								className="w-full flex flex-1"
							/>
						}
					/>
				</div>
			</div>
		</article>
	);
}
