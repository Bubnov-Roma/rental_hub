import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";

export interface CartItem {
	equipment: GroupedEquipment;
	quantity: number;
	insurance: boolean;
}

export interface CartItem {
	equipment: GroupedEquipment;
	quantity: number;
	insurance: boolean;
}

interface CartStore {
	items: CartItem[];
	addItem: (equipment: GroupedEquipment) => void;
	removeOne: (id: string) => void;
	removeAllByType: (id: string) => void;
	clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
	persist(
		(set) => ({
			items: [],
			addItem: (equipment) =>
				set((state) => {
					const exists = state.items.find(
						(i) => i.equipment.id === equipment.id
					);
					if (exists) {
						// Если в группе еще есть доступные единицы
						if (exists.quantity < (equipment.available_count || 1)) {
							return {
								items: state.items.map((i) =>
									i.equipment.id === equipment.id
										? { ...i, quantity: i.quantity + 1 }
										: i
								),
							};
						}
						return state; // Больше нет в наличии
					}
					return {
						items: [
							...state.items,
							{ equipment, quantity: 1, insurance: true },
						],
					};
				}),
			removeOne: (id) =>
				set((state) => ({
					items: state.items
						.map((i) =>
							i.equipment.id === id ? { ...i, quantity: i.quantity - 1 } : i
						)
						.filter((i) => i.quantity > 0),
				})),
			removeAllByType: (id) =>
				set((state) => ({
					items: state.items.filter((i) => i.equipment.id !== id),
				})),
			clearCart: () => set({ items: [] }),
		}),
		{ name: "photo-rent-cart" }
	)
);
