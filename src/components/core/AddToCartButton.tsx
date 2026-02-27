"use client";

import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

interface AddToCartButtonProps {
	item: GroupedEquipment;
	className?: string;
	sourceRef?: React.RefObject<HTMLElement | null>;
	size?: "sm" | "md" | "lg";
	/**
	 * "catalog" — no center link/counter; compact +/- sides after add (default)
	 * "details" — Ozon-style split: qty left | "в корзину →" right
	 * "icon"    — single icon button for SearchPanel
	 */
	variant?: "catalog" | "details" | "icon";
}

// ─── Cart fly animation ────────────────────────────────────────────────────────

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

// ─── Toast ────────────────────────────────────────────────────────────────────

function showCartToast(title: string) {
	toast.success(`«${title}» в корзине`, {
		action: {
			label: "Перейти →",
			onClick: () => {
				window.location.href = "/checkout";
			},
		},
		duration: 3500,
	});
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddToCartButton({
	item,
	className,
	sourceRef,
	size = "sm",
	variant = "catalog",
}: AddToCartButtonProps) {
	const { items, addItem, removeOne } = useCartStore();
	const cartItem = items.find((i) => i.equipment.id === item.id);
	const quantity = cartItem?.quantity || 0;
	const btnRef = useRef<HTMLButtonElement>(null);
	const [pulse, setPulse] = useState(false);

	const s = {
		sm: { h: "h-10", side: "w-8", text: "text-sm", min: "min-w-[100px]" },
		md: { h: "h-12", side: "w-10", text: "text-base", min: "min-w-[120px]" },
		lg: { h: "h-14", side: "w-12", text: "text-lg", min: "min-w-[170px]" },
	}[size];

	const handleAdd = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			addItem(item);
			const src = (sourceRef?.current as HTMLElement | null) ?? btnRef.current;
			flyToCart(src, item.imageUrl);
			setPulse(true);
			setTimeout(() => setPulse(false), 600);
			showCartToast(item.title);
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

	// ── Icon variant (SearchPanel) ─────────────────────────────────────────────
	if (variant === "icon") {
		const inCart = quantity > 0;
		return (
			<button
				ref={btnRef}
				type="button"
				onClick={inCart ? handleRemove : handleAdd}
				title={inCart ? "Убрать из корзины" : "В корзину"}
				className={cn(
					"flex items-center justify-center rounded-xl transition-all",
					"w-9 h-9",
					inCart
						? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
						: "bg-foreground/5 text-muted-foreground hover:bg-primary/10 hover:text-primary",
					className
				)}
			>
				<ShoppingCart size={14} />
			</button>
		);
	}

	// ── Details variant (Ozon-style split) ────────────────────────────────────
	if (variant === "details") {
		if (quantity === 0) {
			return (
				<button
					ref={btnRef}
					type="button"
					onClick={handleAdd}
					className={cn(
						"relative flex items-center justify-center gap-2 rounded-2xl px-5",
						"bg-primary text-primary-foreground font-bold",
						"shadow-md shadow-primary/20 hover:shadow-primary/40",
						"hover:scale-[1.02] active:scale-95 transition-all duration-200",
						pulse && "scale-95 opacity-70",
						s.h,
						s.text,
						s.min,
						className
					)}
				>
					<ShoppingCart size={18} />
					Добавить в корзину
				</button>
			);
		}

		return (
			<div className={cn("flex items-center gap-2", className)}>
				{/* Qty stepper */}
				<div
					className={cn(
						"flex items-center rounded-2xl overflow-hidden border border-foreground/20 backdrop-blur-md",
						s.h
					)}
				>
					<button
						type="button"
						onClick={handleRemove}
						className={cn(
							"flex items-center justify-center hover:bg-primary/20 active:scale-90 transition-colors",
							s.side,
							s.h
						)}
					>
						<FontAwesomeIcon icon={faMinus} size="xs" />
					</button>
					<span
						className={cn(
							"flex items-center justify-center font-black px-3",
							s.h,
							s.text
						)}
					>
						{quantity}
					</span>
					<button
						ref={btnRef}
						type="button"
						onClick={handleAdd}
						disabled={quantity >= (item.available_count || 99)}
						className={cn(
							"flex items-center justify-center hover:bg-primary/20 active:scale-90 transition-colors",
							"disabled:opacity-30 disabled:cursor-not-allowed",
							s.side,
							s.h
						)}
					>
						<FontAwesomeIcon icon={faPlus} size="xs" />
					</button>
				</div>

				{/* Go to cart */}
				<Link
					href="/checkout"
					className={cn(
						"flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold border border-yellow-500 backdrop-blur-md",
						"text-yellow-500 bg-primary/10 ",
						"hover:text-white hover:bg-primary-foreground",
						s.h,
						s.text
					)}
				>
					<ShoppingCart size={16} className="text-primary" />В корзину
				</Link>
			</div>
		);
	}

	// ── Catalog variant (default) — no center link ─────────────────────────────
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
					s.h,
					s.min,
					s.text,
					className
				)}
			>
				{size === "lg" ? "Добавить" : "В корзину"}
			</button>
		);
	}

	// In cart — compact +/- without the center link
	return (
		<div
			className={cn(
				"flex items-center rounded-xl overflow-hidden border border-foreground/30",
				"animate-in fade-in zoom-in-95 duration-200",
				s.h,
				s.min,
				className
			)}
		>
			<button
				type="button"
				onClick={handleRemove}
				className={cn(
					"flex items-center justify-center shrink-0 h-full hover:bg-primary/20 active:scale-90 transition-colors",
					s.side
				)}
			>
				<FontAwesomeIcon icon={faMinus} size="xs" />
			</button>

			{/* Just a number — no link in catalog mode */}
			<span
				className={cn(
					"flex items-center justify-center flex-1 font-black leading-none",
					s.text
				)}
			>
				{quantity}
			</span>

			<button
				ref={btnRef}
				type="button"
				onClick={handleAdd}
				disabled={quantity >= (item.available_count || 99)}
				className={cn(
					"flex items-center justify-center shrink-0 h-full",
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
