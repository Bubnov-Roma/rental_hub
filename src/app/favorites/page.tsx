import { Suspense } from "react";
import ClientFavoritesPage from "@/components/layouts/favorites";
import type {
	EquipmentSet,
	FavoriteItem,
} from "@/components/layouts/favorites/types";
import UnauthenticatedFavorites from "@/components/layouts/favorites/UnauthFavorites";
import { createClient } from "@/lib/supabase/server";

// Skeleton shown during Suspense / while streaming
function FavoritesPageSkeleton() {
	return (
		<div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
			<div className="h-10 w-48 rounded-2xl bg-foreground/5 animate-pulse" />
			<div className="h-10 w-56 rounded-2xl bg-foreground/5 animate-pulse" />
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						key={i}
						className="rounded-2xl border border-foreground/5 overflow-hidden"
					>
						<div className="aspect-square w-full bg-foreground/5 animate-pulse" />
						<div className="p-3 space-y-2">
							<div className="h-3.5 w-3/4 rounded bg-foreground/5 animate-pulse" />
							<div className="h-3 w-1/3 rounded bg-foreground/5 animate-pulse" />
							<div className="h-8 w-full rounded-xl bg-foreground/5 animate-pulse" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

async function FavoritesContent() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return <UnauthenticatedFavorites />;
	}

	const [favResult, setsResult] = await Promise.all([
		supabase
			.from("favorites")
			.select(
				`id, equipment_id, equipment (*, equipment_image_links(images(id, url)))`
			)
			.order("created_at", { ascending: false }),
		supabase
			.from("equipment_sets")
			.select("*")
			.order("created_at", { ascending: false }),
	]);

	const initialFavorites = (favResult.data ?? []) as unknown as FavoriteItem[];
	const initialSets = (setsResult.data ?? []) as EquipmentSet[];

	return (
		<ClientFavoritesPage
			initialFavorites={initialFavorites}
			initialSets={initialSets}
		/>
	);
}

export default function FavoritesPage() {
	return (
		<Suspense fallback={<FavoritesPageSkeleton />}>
			<FavoritesContent />
		</Suspense>
	);
}
