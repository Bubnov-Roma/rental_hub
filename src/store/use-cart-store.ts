import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";

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
						// всегда обновляем equipment данные при addItem.
						// Это гарантирует что available_count в корзине актуален,
						// даже если старый объект был сохранён из EquipmentDetails
						// (где available_count мог быть = 1 вместо реального значения).
						const updatedEquipment = {
							...exists.equipment,
							// Берём свежий available_count из нового вызова
							available_count: Math.max(
								exists.equipment.available_count,
								equipment.available_count
							),
							total_count: Math.max(
								exists.equipment.total_count,
								equipment.total_count
							),
							all_unit_ids:
								equipment.all_unit_ids.length >
								exists.equipment.all_unit_ids.length
									? equipment.all_unit_ids
									: exists.equipment.all_unit_ids,
						};

						// Можно ли добавить ещё?
						if (exists.quantity < updatedEquipment.available_count) {
							return {
								items: state.items.map((i) =>
									i.equipment.id === equipment.id
										? {
												...i,
												equipment: updatedEquipment,
												quantity: i.quantity + 1,
											}
										: i
								),
							};
						}
						// Достигли максимума — обновляем данные но не количество
						return {
							items: state.items.map((i) =>
								i.equipment.id === equipment.id
									? { ...i, equipment: updatedEquipment }
									: i
							),
						};
					}

					// Новый товар
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
