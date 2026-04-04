import { auth } from "@/auth";
import UsersTable from "@/components/admin/users/UsersTable";
import type { UserProfile } from "@/core/domain/entities/User";
import { prisma } from "@/lib/prisma";
import { formatPlural } from "@/utils";

export default async function AdminUsersPage() {
	const session = await auth();
	const users = await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			clientApplication: true,
		},
	});

	const enriched: UserProfile[] = users.map((u) => ({
		id: u.id,
		name: u.name,
		email: u.email,
		phone: u.phone,
		avatarUrl: u.image,
		role: u.role as UserProfile["role"],
		entityType: u.entityType as UserProfile["entityType"],
		companyName: u.companyName,
		tin: u.tin,
		createdAt: u.createdAt.toISOString(),
		isBlocked: u.isBlocked,
		blockedReason: u.blockedReason,
		permissions: (u.permissions ?? {}) as Record<string, boolean>,
		isVerified: u.isVerified,
		application: u.clientApplication
			? {
					id: u.clientApplication.id,
					userId: u.clientApplication.userId,
					status: u.clientApplication.status,
					clientType: u.clientApplication.clientType,
					createdAt: u.clientApplication.createdAt.toISOString(),
					updatedAt: u.clientApplication.updatedAt.toISOString(),
					rejectionReason: u.clientApplication.rejectionReason,
				}
			: null,
	}));

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-black italic uppercase tracking-tight">
					Клиенты
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Управление профилми · {formatPlural(enriched.length, "users")}
				</p>
			</div>
			<UsersTable
				initialUsers={enriched}
				currentUserRole={session?.user?.role}
			/>
		</div>
	);
}
