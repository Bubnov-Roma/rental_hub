"use client";

import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

interface AddToCartButtonProps {
	item: GroupedEquipment;
	className?: string;
	/** ref на контейнер изображения — источник анимации полёта */
	sourceRef?: React.RefObject<HTMLElement | null>;
	size?: "sm" | "md" | "lg";
}

/**
 * Запускает анимацию «товар летит в корзину».
 * Корзина в хедере должна иметь атрибут data-cart-icon="true"
 */
function flyToCart(sourceEl: HTMLElement | null, imageUrl?: string) {
	if (!sourceEl || typeof document === "undefined") return;
	const cartEl = document.querySelector<HTMLElement>("[data-cart-icon]");
	if (!cartEl) return;

	const srcRect = sourceEl.getBoundingClientRect();
	const cartRect = cartEl.getBoundingClientRect();
	const SIZE = 44;

	const ghost = document.createElement("div");
	ghost.style.cssText = `
    position:fixed;
    width:${SIZE}px;height:${SIZE}px;
    border-radius:10px;overflow:hidden;
    background:var(--color-primary,#3b82f6);
    z-index:9999;pointer-events:none;
    left:${srcRect.left + srcRect.width / 2 - SIZE / 2}px;
    top:${srcRect.top + srcRect.height / 2 - SIZE / 2}px;
    box-shadow:0 8px 24px rgba(0,0,0,.4);
    transition:none;
  `;
	if (imageUrl) {
		const img = document.createElement("img");
		img.src = imageUrl;
		img.style.cssText = "width:100%;height:100%;object-fit:cover;";
		ghost.appendChild(img);
	}
	document.body.appendChild(ghost);

	const tx = cartRect.left + cartRect.width / 2 - SIZE / 2;
	const ty = cartRect.top + cartRect.height / 2 - SIZE / 2;

	// Двойной rAF чтобы браузер успел нарисовать начальный кадр
	requestAnimationFrame(() =>
		requestAnimationFrame(() => {
			ghost.style.transition =
				"left .6s cubic-bezier(.4,0,.2,1),top .6s cubic-bezier(.4,0,.2,1),transform .6s ease,opacity .35s ease .28s";
			ghost.style.left = `${tx}px`;
			ghost.style.top = `${ty}px`;
			ghost.style.transform = "scale(0.2)";
			ghost.style.opacity = "0";
		})
	);

	// Bounce корзины после прилёта
	setTimeout(() => {
		cartEl.animate(
			[
				{ transform: "scale(1)" },
				{ transform: "scale(1.45) rotate(-12deg)" },
				{ transform: "scale(0.88) rotate(6deg)" },
				{ transform: "scale(1.1)" },
				{ transform: "scale(1)" },
			],
			{ duration: 430, easing: "cubic-bezier(.34,1.56,.64,1)" }
		);
	}, 570);

	setTimeout(() => ghost.remove(), 1100);
}

export function AddToCartButton({
	item,
	className,
	sourceRef,
	size = "sm",
}: AddToCartButtonProps) {
	const { items, addItem, removeOne } = useCartStore();
	const cartItem = items.find((i) => i.equipment.id === item.id);
	const quantity = cartItem?.quantity || 0;
	const btnRef = useRef<HTMLButtonElement>(null);
	const [pulse, setPulse] = useState(false);

	const handleAdd = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			addItem(item);
			const src = (sourceRef?.current as HTMLElement | null) ?? btnRef.current;
			flyToCart(src, item.imageUrl);
			setPulse(true);
			setTimeout(() => setPulse(false), 600);
		},
		[addItem, item, sourceRef]
	);

	const handleRemove = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			removeOne(item.id);
		},
		[removeOne, item.id]
	);

	const s = {
		sm: { wrap: "h-10 min-w-[100px]", side: "w-8", text: "text-sm" },
		md: { wrap: "h-12 min-w-[120px]", side: "w-10", text: "text-base" },
		lg: { wrap: "h-14 min-w-[170px]", side: "w-12", text: "text-lg" },
	}[size];

	if (quantity === 0) {
		return (
			<button
				ref={btnRef}
				type="button"
				onClick={handleAdd}
				className={cn(
					"relative flex items-center justify-center gap-1.5 rounded-xl px-3",
					"bg-primary text-primary-foreground font-bold",
					"shadow-md shadow-primary/20 hover:shadow-primary/40",
					"hover:scale-[1.04] active:scale-95 transition-all duration-200",
					pulse && "scale-95 opacity-70",
					s.wrap,
					s.text,
					className
				)}
			>
				{size === "lg" ? "Добавить" : "В корзину"}
			</button>
		);
	}

	return (
		<div
			className={cn(
				"flex items-center rounded-xl overflow-hidden",
				"border border-primary/30 bg-background/10",
				"animate-in fade-in zoom-in-95 duration-200",
				s.wrap,
				className
			)}
		>
			{/* − */}
			<button
				type="button"
				onClick={handleRemove}
				className={cn(
					"flex items-center justify-center shrink-0 h-full",
					"hover:bg-primary/20 active:scale-90 transition-colors",
					s.side
				)}
			>
				<FontAwesomeIcon icon={faMinus} size="xs" />
			</button>

			{/* Количество + ссылка в корзину */}
			<Link
				href="/checkout"
				onClick={(e) => e.stopPropagation()}
				className="flex flex-col items-center justify-center flex-1 h-full hover:bg-primary/15 transition-colors group/c px-1"
			>
				<span className={cn("font-black leading-none text-primary", s.text)}>
					{quantity}
				</span>
				<span className="text-[6px] font-bold uppercase tracking-wide opacity-50 group-hover/c:opacity-90 transition-opacity leading-none mt-0.5">
					в корзине
				</span>
			</Link>

			{/* + */}
			<button
				ref={btnRef}
				type="button"
				onClick={handleAdd}
				disabled={quantity >= (item.available_count || 99)}
				className={cn(
					"flex items-center justify-center shrink-0 h-full text-primary",
					"hover:bg-primary/20 active:scale-90 transition-colors",
					"disabled:opacity-30 disabled:cursor-not-allowed",
					s.side
				)}
			>
				<FontAwesomeIcon icon={faPlus} size="xs" />
			</button>
		</div>
	);
}
