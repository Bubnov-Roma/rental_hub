import { Suspense } from "react";
import { auth } from "@/auth";
import ClientFavoritesPage from "@/components/layouts/favorites";
import UnauthenticatedFavorites from "@/components/layouts/favorites/UnauthFavorites";

// Skeleton shown during Suspense / while streaming
function FavoritesPageSkeleton() {
	return (
		<div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
			<div className="h-10 w-48 rounded-2xl bg-foreground/5 animate-pulse" />
			<div className="h-10 w-56 rounded-2xl bg-foreground/5 animate-pulse" />
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<div
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
	const session = await auth();
	if (!session?.user?.id) return <UnauthenticatedFavorites />;
	return <ClientFavoritesPage />;
}

export default function FavoritesPage() {
	return (
		<Suspense fallback={<FavoritesPageSkeleton />}>
			<FavoritesContent />
		</Suspense>
	);
}
