import { getCategoriesFromDb } from "@/actions/category-actions";
import { CategoriesGrid } from "@/components/core/CategoriesGrid";
import { HeroSection } from "@/components/layouts/HeroSection";
import { HowItWorks } from "@/components/layouts/HowItWorks";
import { Testimonials } from "@/components/layouts/Testimonials";

export default async function HomePage() {
	const categories = await getCategoriesFromDb();
	return (
		<div className="flex flex-col gap-20 pb-20">
			<HeroSection />
			<CategoriesGrid categories={categories} />
			<HowItWorks />
			<Testimonials />
		</div>
	);
}
