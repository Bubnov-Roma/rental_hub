import { CategoriesGrid } from "@/components/core/CategoriesGrid";
import { HeroSection } from "@/components/layouts/HeroSection";
import { HowItWorks } from "@/components/layouts/HowItWorks";
import { Testimonials } from "@/components/layouts/Testimonials";

export default function HomePage() {
	return (
		<div className="flex flex-col gap-20 pb-20">
			<HeroSection />
			<CategoriesGrid />
			<HowItWorks />
			<Testimonials />
		</div>
	);
}
