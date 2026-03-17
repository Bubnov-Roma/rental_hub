import Link from "next/link";
import type { DbCategory } from "@/core/domain/entities/Equipment";

interface CategoriesGridProps {
	categories: DbCategory[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
	return (
		<section className="container mx-auto px-4">
			<h2 className="text-3xl font-bold mb-10 text-center">
				Категории техники
			</h2>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{categories.map((cat) => (
					<Link
						key={cat.id}
						href={`/equipment?category=${cat.slug}`}
						className="group relative h-48 rounded-3xl bg-white/5 border border-muted-foreground/20 overflow-hidden hover:border-primary/50 transition-all"
					>
						<div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
							<div className="mb-4 text-primary group-hover:scale-110 transition-transform text-4xl">
								📦
							</div>
							<h3 className="font-semibold uppercase tracking-wider">
								{cat.name}
							</h3>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
