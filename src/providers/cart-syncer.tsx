"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { getRelatedEquipmentAction } from "@/actions/equipment-actions";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { useCartStore } from "@/store/use-cart-store";

async function adaptRelatedEquipment(
	ids: string[]
): Promise<GroupedEquipment[]> {
	const result = await getRelatedEquipmentAction(ids);
	return result.filter((item): item is GroupedEquipment => item !== undefined);
}

export function CartSync() {
	const { data: session, status } = useSession();
	const { syncWithServer, clearOnLogout, authenticatedUserId } = useCartStore();

	useEffect(() => {
		// Ждем, пока сессия загрузится
		if (status === "loading") return;

		if (session?.user?.id) {
			// Если юзер залогинился (и мы еще не синхронизировали его)
			if (authenticatedUserId !== session.user.id) {
				// Вызываем синхронизацию. getRelatedEquipmentAction отлично подходит
				// как resolver, так как он принимает массив ID и отдает GroupedEquipment[]
				syncWithServer(session.user.id, adaptRelatedEquipment).catch(
					console.error
				);
			}
		} else {
			// Если юзера нет (разлогинился)
			if (authenticatedUserId !== null) {
				clearOnLogout();
			}
		}
	}, [session, status, authenticatedUserId, syncWithServer, clearOnLogout]);

	return null; // Ничего не рендерит
}
