import { getCategoriesFromDb } from "@/actions/category-actions";
import { AppSidebarWrapper } from "@/components/layouts/AppSidebar/AppSidebarWrapper";

interface Props {
	isAdmin: boolean;
}

export async function AppSidebar({ isAdmin }: Props) {
	const categories = await getCategoriesFromDb();

	return <AppSidebarWrapper isAdmin={isAdmin} categories={categories} />;
}
