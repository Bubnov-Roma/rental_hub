/**
 * use-cart-store.ts
 *
 * Strategy:
 * ─ Unauthenticated: items live only in localStorage (Zustand persist)
 * ─ On login:        client cart is merged with server cart, result saved to DB
 * ─ Authenticated:   all mutations hit the DB; localStorage is cleared
 * ─ On logout:       in-memory state is cleared (localStorage already empty)
 *
 * The store exposes `syncWithServer(userId)` which is called from AuthProvider
 * (or wherever you handle the auth state change).
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/client";

export interface CartItem {
	equipment: GroupedEquipment;
	quantity: number;
	insurance: boolean;
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

type DbCartRow = {
	equipment_id: string;
	quantity: number;
};

async function fetchServerCart(userId: string): Promise<DbCartRow[]> {
	const supabase = createClient();
	const { data } = await supabase
		.from("cart_items")
		.select("equipment_id, quantity")
		.eq("user_id", userId);
	return data ?? [];
}

async function upsertServerCartItem(
	userId: string,
	equipmentId: string,
	quantity: number
): Promise<void> {
	const supabase = createClient();
	await supabase
		.from("cart_items")
		.upsert(
			{ user_id: userId, equipment_id: equipmentId, quantity },
			{ onConflict: "user_id,equipment_id" }
		);
}

async function deleteServerCartItem(
	userId: string,
	equipmentId: string
): Promise<void> {
	const supabase = createClient();
	await supabase
		.from("cart_items")
		.delete()
		.eq("user_id", userId)
		.eq("equipment_id", equipmentId);
}

async function clearServerCart(userId: string): Promise<void> {
	const supabase = createClient();
	await supabase.from("cart_items").delete().eq("user_id", userId);
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface CartStore {
	items: CartItem[];
	/** Set when authenticated user is synced; null = guest */
	authenticatedUserId: string | null;

	addItem: (equipment: GroupedEquipment) => void;
	removeOne: (id: string) => void;
	removeAllByType: (id: string) => void;
	clearCart: () => void;

	/**
	 * Called on login:
	 * 1. Fetches server cart
	 * 2. Merges with current guest cart (server wins on quantity for conflicts)
	 * 3. Uploads merged cart to server
	 * 4. Clears localStorage
	 */
	syncWithServer: (
		userId: string,
		equipmentResolver: (ids: string[]) => Promise<GroupedEquipment[]>
	) => Promise<void>;

	/** Called on logout — clears memory, localStorage already empty */
	clearOnLogout: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],
			authenticatedUserId: null,

			// ── addItem ─────────────────────────────────────────────────────────
			addItem: (equipment) => {
				set((state) => {
					const exists = state.items.find(
						(i) => i.equipment.id === equipment.id
					);

					const updatedEquipment = exists
						? {
								...exists.equipment,
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
							}
						: equipment;

					let newItems: CartItem[];

					if (exists) {
						if (exists.quantity >= updatedEquipment.available_count) {
							// Already at max — just refresh equipment data
							newItems = state.items.map((i) =>
								i.equipment.id === equipment.id
									? { ...i, equipment: updatedEquipment }
									: i
							);
						} else {
							newItems = state.items.map((i) =>
								i.equipment.id === equipment.id
									? {
											...i,
											equipment: updatedEquipment,
											quantity: i.quantity + 1,
										}
									: i
							);
						}
					} else {
						newItems = [
							...state.items,
							{ equipment: updatedEquipment, quantity: 1, insurance: true },
						];
					}

					// Persist to server if authenticated
					const uid = state.authenticatedUserId;
					if (uid) {
						const item = newItems.find((i) => i.equipment.id === equipment.id);
						if (item) upsertServerCartItem(uid, equipment.id, item.quantity);
					}

					return { items: newItems };
				});
			},

			// ── removeOne ───────────────────────────────────────────────────────
			removeOne: (id) => {
				set((state) => {
					const newItems = state.items
						.map((i) =>
							i.equipment.id === id ? { ...i, quantity: i.quantity - 1 } : i
						)
						.filter((i) => i.quantity > 0);

					const uid = state.authenticatedUserId;
					if (uid) {
						const stillExists = newItems.find((i) => i.equipment.id === id);
						if (stillExists) {
							upsertServerCartItem(uid, id, stillExists.quantity);
						} else {
							deleteServerCartItem(uid, id);
						}
					}

					return { items: newItems };
				});
			},

			// ── removeAllByType ─────────────────────────────────────────────────
			removeAllByType: (id) => {
				set((state) => {
					const uid = state.authenticatedUserId;
					if (uid) deleteServerCartItem(uid, id);
					return { items: state.items.filter((i) => i.equipment.id !== id) };
				});
			},

			// ── clearCart ───────────────────────────────────────────────────────
			clearCart: () => {
				set((state) => {
					const uid = state.authenticatedUserId;
					if (uid) clearServerCart(uid);
					return { items: [] };
				});
			},

			// ── syncWithServer ──────────────────────────────────────────────────
			syncWithServer: async (userId, equipmentResolver) => {
				const state = get();

				// Already synced for this user
				if (state.authenticatedUserId === userId) return;

				// 1. Fetch server cart
				const serverRows = await fetchServerCart(userId);

				// 2. Build merged map: equipmentId → quantity
				//    Guest items + server items; server quantity wins on conflict
				const mergedMap = new Map<string, number>();

				// Start with guest cart
				for (const item of state.items) {
					mergedMap.set(item.equipment.id, item.quantity);
				}

				// Apply server cart (server wins)
				for (const row of serverRows) {
					const existing = mergedMap.get(row.equipment_id) ?? 0;
					// Merge: take max so neither side loses items
					mergedMap.set(row.equipment_id, Math.max(existing, row.quantity));
				}

				if (mergedMap.size === 0) {
					set({ authenticatedUserId: userId, items: [] });
					return;
				}

				// 3. Resolve equipment objects for all IDs
				const allIds = [...mergedMap.keys()];
				let equipmentObjects: GroupedEquipment[] = [];
				try {
					equipmentObjects = await equipmentResolver(allIds);
				} catch {
					// Resolver failed — keep guest cart items we already have
					equipmentObjects = state.items
						.filter((i) => allIds.includes(i.equipment.id))
						.map((i) => i.equipment);
				}

				const equipmentById = new Map(equipmentObjects.map((e) => [e.id, e]));

				const mergedItems: CartItem[] = [];
				for (const [id, quantity] of mergedMap) {
					const equipment = equipmentById.get(id);
					if (!equipment) continue; // Equipment deleted or unavailable
					mergedItems.push({
						equipment,
						quantity: Math.min(quantity, equipment.available_count),
						insurance: true,
					});
				}

				// 4. Persist merged cart to server
				for (const item of mergedItems) {
					await upsertServerCartItem(userId, item.equipment.id, item.quantity);
				}

				// 5. Update store — mark as authenticated, clear localStorage persist
				set({ authenticatedUserId: userId, items: mergedItems });
			},

			// ── clearOnLogout ───────────────────────────────────────────────────
			clearOnLogout: () => {
				set({ authenticatedUserId: null, items: [] });
			},
		}),
		{
			name: "photo-rent-cart",
			storage: createJSONStorage(() => localStorage),
			// Only persist for guests (authenticatedUserId === null)
			// When authenticated, items live on the server
			partialize: (state) =>
				state.authenticatedUserId === null
					? { items: state.items, authenticatedUserId: null }
					: { items: [], authenticatedUserId: null }, // Clear localStorage on auth
		}
	)
);
