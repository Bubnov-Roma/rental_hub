import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbEntry {
	label: string;
	href?: string;
}

interface DashboardBreadcrumbProps {
	items: BreadcrumbEntry[];
}

const crumbLinkClass =
	"text-muted-foreground hover:text-foreground transition-colors border-bottom hover:border-b";

export function DashboardBreadcrumb({ items }: DashboardBreadcrumbProps) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<Link href="/dashboard" className={crumbLinkClass}>
						Дашборд
					</Link>
				</BreadcrumbItem>

				{items.map((item, idx) => (
					<div key={`${item.label}`} className="flex items-center gap-2">
						<BreadcrumbSeparator key={`${item}`} />
						<BreadcrumbItem key={`${item}` + `${idx}`}>
							{item.href ? (
								<Link href={item.href} className={crumbLinkClass}>
									{item.label}
								</Link>
							) : (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
