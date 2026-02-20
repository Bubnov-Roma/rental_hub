import { notFound } from "next/navigation";
import EquipmentDetails from "@/components/core/EquipmentDetails";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CATEGORIES } from "@/constants";
import type { GroupedEquipment } from "@/core/domain/entities/Equipment";
import { getEquipmentBySlug } from "@/lib/api/equipment";

export default async function EquipmentDetailsPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const equipment = await getEquipmentBySlug(slug);

	if (!equipment) notFound();

	// Находим категорию для хлебных крошек
	const currentCategory = CATEGORIES.find(
		(c) => c.id === equipment.category || c.name === equipment.category
	);

	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			{/* Хлебные крошки */}
			<div className="container mx-auto px-6 py-4">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">Главная</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href="/equipment">Каталог</BreadcrumbLink>
						</BreadcrumbItem>
						{currentCategory && (
							<>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink
										href={`/equipment?category=${currentCategory.slug}`}
									>
										{currentCategory.name}
									</BreadcrumbLink>
								</BreadcrumbItem>
							</>
						)}
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage className="max-w-50 truncate">
								{equipment.title}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<EquipmentDetails equipment={equipment as unknown as GroupedEquipment} />
		</div>
	);
}
