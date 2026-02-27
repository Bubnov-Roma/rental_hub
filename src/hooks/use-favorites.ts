"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/app/actions/favorites.action";
import { createClient } from "@/lib/supabase/client";

// ─── Global favorites cache ───────────────────────────────────────────────────
// Один fetch на всю страницу. Все EquipmentCard подписываются на один Set.

let favoritesCache: Set<string> | null = null;
let fetchPromise: Promise<Set<string>> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
	for (const fn of listeners) fn();
}

async function loadFavorites(): Promise<Set<string>> {
	// Уже загружено
	if (favoritesCache !== null) return favoritesCache;
	// Уже идёт запрос — возвращаем тот же Promise (дедупликация)
	if (fetchPromise) return fetchPromise;

	fetchPromise = (async () => {
		const supabase = createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			favoritesCache = new Set();
			fetchPromise = null;
			return favoritesCache;
		}

		const { data } = await supabase
			.from("favorites")
			.select("equipment_id")
			.eq("user_id", user.id);

		favoritesCache = new Set((data ?? []).map((r) => r.equipment_id as string));
		fetchPromise = null;
		return favoritesCache;
	})();

	return fetchPromise;
}

export function invalidateFavoritesCache() {
	favoritesCache = null;
	fetchPromise = null;
}

// ─── useFavorite — single card ────────────────────────────────────────────────

export function useFavorite(equipmentId: string, initialState = false) {
	const [favoriteIds, setFavoriteIds] = useState<Set<string> | null>(
		favoritesCache
	);
	const [isLoading, setIsLoading] = useState(favoritesCache === null);

	const optimisticOverride = useRef<boolean | null>(null);
	const [, forceUpdate] = useState(0);

	// Флаг: уже подписались — не подписываться повторно в Strict Mode.
	const subscribedRef = useRef(false);

	useEffect(() => {
		// React Strict Mode в dev дважды монтирует компоненты.
		// Без этой защиты — каждая карточка добавляет listener дважды
		// → notifyListeners вызывает setState вдвое больше раз → CPU spike.
		if (subscribedRef.current) return;
		subscribedRef.current = true;

		const refresh = () => {
			optimisticOverride.current = null;
			setFavoriteIds(favoritesCache ? new Set(favoritesCache) : null);
		};
		listeners.add(refresh);

		if (favoritesCache === null) {
			loadFavorites().then((ids) => {
				setFavoriteIds(new Set(ids));
				setIsLoading(false);
				// Не вызываем notifyListeners здесь — refresh уже у всех в Set,
				// setFavoriteIds каждый сделает сам через свой loadFavorites.then
			});
		} else {
			setIsLoading(false);
		}

		return () => {
			listeners.delete(refresh);
			subscribedRef.current = false;
		};
	}, []); // нет deps — эффект только при монтировании/размонтировании

	const isFavorite =
		optimisticOverride.current !== null
			? optimisticOverride.current
			: (favoriteIds?.has(equipmentId) ?? initialState);

	const toggle = useCallback(
		async (e?: React.MouseEvent) => {
			e?.preventDefault();
			e?.stopPropagation();

			const prev = isFavorite;
			const next = !prev;

			// Optimistic update
			if (favoritesCache) {
				if (prev) favoritesCache.delete(equipmentId);
				else favoritesCache.add(equipmentId);
				notifyListeners();
			} else {
				optimisticOverride.current = next;
				forceUpdate((n) => n + 1);
			}

			const result = await toggleFavoriteAction(equipmentId);

			// Rollback on error
			if (result.error) {
				if (favoritesCache) {
					if (prev) favoritesCache.add(equipmentId);
					else favoritesCache.delete(equipmentId);
					notifyListeners();
				} else {
					optimisticOverride.current = prev;
					forceUpdate((n) => n + 1);
				}
				if (result.error === "Unauthorized") {
					toast.error("Войдите в аккаунт, чтобы сохранять избранное");
				} else {
					toast.error("Не удалось обновить избранное");
				}
				return;
			}

			// Reconcile with server truth
			if (favoritesCache) {
				if (result.isFavorite) favoritesCache.add(equipmentId);
				else favoritesCache.delete(equipmentId);
				notifyListeners();
			} else {
				optimisticOverride.current = result.isFavorite;
				forceUpdate((n) => n + 1);
			}

			if (result.isFavorite) {
				toast.success("Добавлено в избранное", {
					action: {
						label: "Избранное →",
						onClick: () => {
							window.location.href = "/favorites";
						},
					},
				});
			} else {
				toast.success("Удалено из избранного");
			}
		},
		[equipmentId, isFavorite]
	);

	return { isFavorite, isLoading, toggle };
}

// ─── useFavorites — full id set ───────────────────────────────────────────────

export function useFavorites() {
	const [favoriteIds, setFavoriteIds] = useState<Set<string> | null>(
		favoritesCache
	);
	const subscribedRef = useRef(false);

	useEffect(() => {
		if (subscribedRef.current) return;
		subscribedRef.current = true;

		const refresh = () =>
			setFavoriteIds(favoritesCache ? new Set(favoritesCache) : null);
		listeners.add(refresh);

		if (favoritesCache === null) {
			loadFavorites().then((ids) => {
				setFavoriteIds(new Set(ids));
			});
		}

		return () => {
			listeners.delete(refresh);
			subscribedRef.current = false;
		};
	}, []);

	return favoriteIds;
}
