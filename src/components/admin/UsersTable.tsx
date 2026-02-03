"use client";

import { MoreVertical, Search, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
	Badge,
	Button,
	Card,
	CardContent,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui";
import type { UserProfile, UserRole } from "@/core/domain/entities/User";
import { createClient } from "@/lib/supabase/client";

export default function UsersTable({
	initialUsers,
}: {
	initialUsers: UserProfile[];
}) {
	const [users, setUsers] = useState(initialUsers);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const supabase = createClient();

	const handleUpdateRole = async (userId: string, newRole: UserRole) => {
		const { error } = await supabase
			.from("profiles")
			.update({ role: newRole })
			.eq("id", userId);

		if (error) {
			toast.error("Ошибка при смене роли");
		} else {
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
			);
			toast.success(`Роль изменена на ${newRole}`);
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name?.toLowerCase().includes(search.toLowerCase()) ||
			user.email?.toLowerCase().includes(search.toLowerCase());
		const matchesRole = roleFilter === "all" || user.role === roleFilter;
		return matchesSearch && matchesRole;
	});

	const getRoleBadge = (role: string) => {
		const styles: Record<string, string> = {
			admin: "bg-purple-100 text-purple-800",
			manager: "bg-green-100 text-green-800",
			partner: "bg-amber-100 text-amber-800",
			user: "bg-blue-100 text-blue-800",
		};
		return <Badge className={styles[role] || "bg-gray-100"}>{role}</Badge>;
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="p-4 flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Поиск по имени или email..."
							className="pl-10"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<select
						className="rounded-md border border-input bg-background px-3 py-2 text-sm"
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
					>
						<option value="all">Все роли</option>
						<option value="admin">Админы</option>
						<option value="manager">Менеджеры</option>
						<option value="partner">Партнеры</option>
						<option value="user">Клиенты</option>
					</select>
				</CardContent>
			</Card>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Пользователь</TableHead>
							<TableHead>Тип лица</TableHead>
							<TableHead>Роль</TableHead>
							<TableHead>Регистрация</TableHead>
							<TableHead className="text-right">Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredUsers.map((user) => (
							<TableRow key={user.id}>
								<TableCell>
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
											{user.avatar_url ? (
												<Image
													src={user.avatar_url}
													alt={user.name ?? "user avatar"}
													width={40}
													height={40}
												/>
											) : (
												<User className="h-5 w-5 text-slate-400" />
											)}
										</div>
										<div>
											<p className="font-medium">{user.name || "Без имени"}</p>
											<p className="text-xs text-gray-500">{user.email}</p>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="secondary">
										{user.entity_type === "legal_entity"
											? "Юр. лицо"
											: "Физ. лицо"}
									</Badge>
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button className="hover:opacity-80 transition">
												{getRoleBadge(user.role)}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem
												onClick={() => handleUpdateRole(user.id, "user")}
											>
												User
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleUpdateRole(user.id, "partner")}
											>
												Partner
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleUpdateRole(user.id, "manager")}
											>
												Manager
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleUpdateRole(user.id, "admin")}
											>
												Admin
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
								<TableCell className="text-sm text-gray-500">
									{new Date(user.created_at).toLocaleDateString("ru-RU")}
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>Просмотреть детали</DropdownMenuItem>
											<DropdownMenuItem className="text-red-600">
												Заблокировать
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
}
