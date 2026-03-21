"use client";

import { UserMenu } from "@/components/layouts/UserMenu";
import { Sidebar, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import type { DbCategory } from "@/core/domain/entities/Equipment";
import { AppSidebarClient } from "./AppSidebarClient";

interface Props {
	isAdmin: boolean;
	categories: DbCategory[];
}

export function AppSidebarWrapper({ isAdmin, categories }: Props) {
	return (
		<Sidebar
			collapsible="icon"
			className="border-r-0 bg-background/60 backdrop-blur-2xl"
		>
			<AppSidebarClient isAdmin={isAdmin} categories={categories} />
			<SidebarFooter className="p-4 border-t border-primary/5">
				<UserMenu />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
