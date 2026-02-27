import { UserMenu } from "@/components/layouts/UserMenu";
import { Sidebar, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebarClient } from "./AppSidebarClient";

interface Props {
	isAdmin: boolean;
	isLoggedIn: boolean;
}

export function AppSidebar({ isAdmin, isLoggedIn }: Props) {
	return (
		<Sidebar
			collapsible="icon"
			className="border-r-0 bg-background/60 backdrop-blur-2xl"
		>
			<AppSidebarClient isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
			<SidebarFooter className="p-4 border-t border-primary/5">
				<UserMenu />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
