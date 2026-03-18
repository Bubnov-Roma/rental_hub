"use client";

import type { Role } from "@prisma/client";
import {
	BadgePercent,
	Ban,
	ChevronDown,
	ClipboardList,
	Edit2,
	MoreVertical,
	Plus,
	Search,
	Shield,
	ShieldCheck,
	StickyNote,
	User,
	Users,
	X,
} from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	addUserAdminNoteAction,
	// createUserDiscountAction,
	toggleUserBlockAction,
	updateUserRoleAction,
} from "@/actions/client-application-actions";
import {
	Badge,
	Button,
	Card,
	CardContent,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Textarea,
} from "@/components/ui";
import type {
	ApplicationStatus,
	UserProfile,
} from "@/core/domain/entities/User";
import { cn } from "@/lib/utils";

// ─── Permission toggles ───────────────────────────────────────────────────────

const PERMISSIONS = [
	{ key: "bookings_approve", label: "Подтверждать брони" },
	{ key: "equipment_edit", label: "Редактировать технику" },
	{ key: "users_view", label: "Просматривать клиентов" },
	{ key: "finance_view", label: "Просматривать финансы" },
] as const;

// ─── Application status config ────────────────────────────────────────────────

const APP_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
	LOADING: {
		label: "...",
		color: "bg-foreground/8 text-foreground/40 border-foreground/10",
	},
	NO_APPLICATION: {
		label: "Нет анкеты",
		color: "bg-foreground/8 text-foreground/40 border-foreground/10",
	},
	DRAFT: {
		label: "Черновик",
		color: "bg-foreground/8 text-foreground/50 border-foreground/10",
	},
	PENDING: {
		label: "На проверке",
		color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
	},
	REVIEWING: {
		label: "Изучается",
		color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
	},
	CLARIFICATION: {
		label: "Уточнение",
		color: "bg-orange-500/15 text-orange-400 border-orange-500/20",
	},
	STANDARD: {
		label: "Стандарт",
		color: "bg-teal-500/15 text-teal-400 border-teal-500/20",
	},
	APPROVED: {
		label: "Одобрено",
		color: "bg-green-500/15 text-green-400 border-green-500/20",
	},
	REJECTED: {
		label: "Отклонено",
		color: "bg-red-500/15 text-red-400 border-red-500/20",
	},
	BLOCKED: {
		label: "Заблокирован",
		color: "bg-red-500/15 text-red-400 border-red-500/20",
	},
};

function AppStatusBadge({ status }: { status?: string | undefined }) {
	const s = status ?? "NO_APPLICATION";
	const cfg = APP_STATUS_CONFIG[s] ?? APP_STATUS_CONFIG.no_application;
	return (
		<Badge
			variant="outline"
			className={cn("text-[10px] border font-semibold", cfg?.color)}
		>
			{cfg?.label}
		</Badge>
	);
}

function RoleBadge({ role }: { role: string }) {
	const styles: Record<string, string> = {
		admin: "bg-purple-500/15 text-purple-400 border-purple-500/20",
		manager: "bg-green-500/15 text-green-400 border-green-500/20",
		partner: "bg-amber-500/15 text-amber-400 border-amber-500/20",
		user: "bg-blue-500/15 text-blue-400 border-blue-500/20",
	};
	const icons: Record<string, React.ReactNode> = {
		admin: <ShieldCheck size={11} />,
		manager: <Shield size={11} />,
	};
	return (
		<Badge
			variant="outline"
			className={cn(
				"text-[10px] font-bold gap-1",
				styles[role] ?? "bg-foreground/8"
			)}
		>
			{icons[role]}
			{role}
		</Badge>
	);
}

// ─── Application status changer ───────────────────────────────────────────────

const APP_STATUSES_CHANGEABLE = [
	"PENDING",
	"REVIEWING",
	"CLARIFICATION",
	"APPROVED",
	"STANDARD",
	"REJECTED",
] as const;

function AdminApplicationStatusChanger({
	applicationId,
	currentStatus,
	onUpdate,
}: {
	applicationId: string;
	currentStatus: string;
	onUpdate: (s: string) => void;
}) {
	const [rejectionReason, setRejectionReason] = useState("");
	const [isPending, startTransition] = useTransition();

	const handleChange = (newStatus: string) => {
		startTransition(async () => {
			// Dynamic import to avoid server/client mismatch
			const { createClient } = await import("@/lib/supabase/client");
			const supabase = createClient();
			const { error } = await supabase
				.from("client_applications")
				.update({
					status: newStatus,
					rejection_reason:
						newStatus === "rejected" ? rejectionReason || null : null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", applicationId);

			if (error) {
				toast.error(error.message);
			} else {
				toast.success(
					`Статус → ${APP_STATUS_CONFIG[newStatus]?.label ?? newStatus}`
				);
				onUpdate(newStatus);
			}
		});
	};

	return (
		<div className="space-y-2">
			<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
				Изменить статус
			</p>
			<div className="flex flex-wrap gap-1.5">
				{APP_STATUSES_CHANGEABLE.filter((s) => s !== currentStatus).map((s) => (
					<button
						key={s}
						type="button"
						disabled={isPending}
						onClick={() => handleChange(s)}
						className={cn(
							"text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-40 hover:opacity-80",
							APP_STATUS_CONFIG[s]?.color
						)}
					>
						{APP_STATUS_CONFIG[s]?.label ?? s}
					</button>
				))}
			</div>
			<Input
				value={rejectionReason}
				onChange={(e) => setRejectionReason(e.target.value)}
				placeholder='Причина (для статуса "Отклонено")'
				className="h-8 text-xs"
			/>
		</div>
	);
}

// ─── User detail drawer ───────────────────────────────────────────────────────

function UserDetailPanel({
	user,
	onClose,
	onUpdate,
}: {
	user: UserProfile;
	onClose: () => void;
	onUpdate: (updated: Partial<UserProfile>) => void;
}) {
	const [tab, setTab] = useState<"details" | "application">("details");
	const [note, setNote] = useState("");
	const [discountType, setDiscountType] = useState<
		"percent" | "fixed" | "promo"
	>("percent");
	const [discountValue, setDiscountValue] = useState("");
	const [discountDesc, setDiscountDesc] = useState("");
	const [promoCode, setPromoCode] = useState("");
	const [permissions, setPermissions] = useState<Record<string, boolean>>(
		user.permissions ?? {}
	);
	const [isPending, startTransition] = useTransition();

	const app = user.application;

	const handleAddNote = () => {
		if (!note.trim()) return;
		startTransition(async () => {
			const r = await addUserAdminNoteAction(user.id, note.trim());
			if (!r.success) toast.error(r.error);
			else {
				toast.success("Заметка добавлена");
				setNote("");
			}
		});
	};

	// const handleAddDiscount = () => {
	// 	if (!discountValue) return;
	// 	startTransition(async () => {
	// 		const r = await createUserDiscountAction({
	// 			userId: user.id,
	// 			type: discountType,
	// 			value: Number(discountValue),
	// 			description: discountDesc || undefined,
	// 			promoCode: promoCode || undefined,
	// 		});
	// 		if (!r.success) toast.error(r.error);
	// 		else {
	// 			toast.success("Скидка добавлена");
	// 			setDiscountValue("");
	// 			setDiscountDesc("");
	// 			setPromoCode("");
	// 		}
	// 	});
	// };

	const handlePermissionSave = () => {
		startTransition(async () => {
			const r = await updateUserRoleAction(
				user.id,
				user.role ?? "USER",
				permissions
			);
			if (!r.success) toast.error(r.error);
			else {
				toast.success("Права обновлены");
				onUpdate({ permissions });
			}
		});
	};

	const handleBlock = () => {
		const reason = user.isBlocked
			? undefined
			: (window.prompt("Причина блокировки:") ?? "");
		startTransition(async () => {
			const r = await toggleUserBlockAction(user.id, !user.isBlocked, reason);
			if (!r.success) toast.error(r.error);
			else {
				toast.success(user.isBlocked ? "Разблокирован" : "Заблокирован");
				onUpdate({
					isBlocked: !user.isBlocked,
					blockedReason: reason ?? null,
				});
			}
		});
	};

	return (
		<div className="fixed inset-y-0 right-0 w-105 bg-background border-l border-foreground/8 shadow-2xl z-50 flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-foreground/8 shrink-0">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-foreground/8 overflow-hidden flex items-center justify-center shrink-0">
						{user.avatarUrl ? (
							<Image
								src={user.avatarUrl}
								alt=""
								width={40}
								height={40}
								className="object-cover"
							/>
						) : (
							<User size={18} className="text-muted-foreground" />
						)}
					</div>
					<div>
						<p className="font-bold text-sm">{user.name || "Без имени"}</p>
						<p className="text-xs text-muted-foreground">{user.email}</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="p-1.5 rounded-lg hover:bg-foreground/8"
				>
					<X size={15} />
				</button>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-foreground/8 shrink-0">
				{[
					{ id: "details" as const, label: "Профиль", icon: User },
					{ id: "application" as const, label: "Анкета", icon: ClipboardList },
				].map(({ id, label, icon: Icon }) => (
					<button
						key={id}
						type="button"
						onClick={() => setTab(id)}
						className={cn(
							"flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-px",
							tab === id
								? "text-primary border-primary"
								: "text-muted-foreground border-transparent hover:text-foreground"
						)}
					>
						<Icon size={13} /> {label}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-y-auto divide-y divide-foreground/5">
				{/* ── ПРОФИЛЬ TAB ── */}
				{tab === "details" && (
					<>
						<div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
							<div>
								<p className="text-muted-foreground mb-0.5">Роль</p>
								<RoleBadge role={user.role ?? "USER"} />
							</div>
							<div>
								<p className="text-muted-foreground mb-0.5">Тип лица</p>
								<p className="font-medium">
									{user.entityType === "LEGAL" ? "Юр. лицо" : "Физ. лицо"}
								</p>
							</div>
							{user.phone && (
								<div className="col-span-2">
									<p className="text-muted-foreground mb-0.5">Телефон</p>
									<p className="font-medium">{user.phone}</p>
								</div>
							)}
							<div className="col-span-2">
								<p className="text-muted-foreground mb-0.5">Зарегистрирован</p>
								<p className="font-medium">
									{new Date(user.createdAt).toLocaleDateString("ru-RU", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</p>
							</div>
							{user.isBlocked && user.blockedReason && (
								<div className="col-span-2 p-2 rounded-lg bg-red-500/10 text-red-400 text-[11px]">
									<span className="font-bold">Причина блокировки: </span>
									{user.blockedReason}
								</div>
							)}
						</div>

						{/* Admin note */}
						<div className="p-4 space-y-2">
							<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
								<StickyNote size={11} /> Заметка
							</p>
							<Textarea
								value={note}
								onChange={(e) => setNote(e.target.value)}
								rows={2}
								placeholder="Внутренняя заметка..."
								className="text-xs resize-none"
							/>
							<Button
								size="sm"
								variant="outline"
								className="w-full"
								onClick={handleAddNote}
								disabled={!note.trim() || isPending}
							>
								<Plus size={12} className="mr-1" /> Добавить
							</Button>
						</div>

						{/* Discount */}
						<div className="p-4 space-y-2">
							<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
								<BadgePercent size={11} /> Скидка / Промокод
							</p>
							<div className="grid grid-cols-2 gap-2">
								<Select
									value={discountType}
									onValueChange={(v) =>
										setDiscountType(v as typeof discountType)
									}
								>
									<SelectTrigger className="h-8 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="percent">% от суммы</SelectItem>
										<SelectItem value="fixed">Фикс. ₽</SelectItem>
										<SelectItem value="promo">Промокод</SelectItem>
									</SelectContent>
								</Select>
								<Input
									value={discountValue}
									onChange={(e) => setDiscountValue(e.target.value)}
									placeholder={discountType === "percent" ? "10" : "500"}
									type="number"
									className="h-8 text-xs"
								/>
							</div>
							{discountType === "promo" && (
								<Input
									value={promoCode}
									onChange={(e) => setPromoCode(e.target.value)}
									placeholder="Код промо..."
									className="h-8 text-xs uppercase"
								/>
							)}
							<Input
								value={discountDesc}
								onChange={(e) => setDiscountDesc(e.target.value)}
								placeholder="Описание (опционально)"
								className="h-8 text-xs"
							/>
							<Button
								size="sm"
								variant="outline"
								className="w-full"
								// onClick={handleAddDiscount}
								disabled={!discountValue || isPending}
							>
								<Plus size={12} className="mr-1" /> Назначить
							</Button>
						</div>

						{/* Manager permissions */}
						{user.role === "MANAGER" && (
							<div className="p-4 space-y-2">
								<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
									<Shield size={11} /> Права менеджера
								</p>
								<div className="space-y-2">
									{PERMISSIONS.map((perm) => (
										<Label
											key={perm.key}
											className="flex items-center gap-2 cursor-pointer"
										>
											<Checkbox
												checked={!!permissions[perm.key]}
												onCheckedChange={(v) =>
													setPermissions((prev) => ({
														...prev,
														[perm.key]: !!v,
													}))
												}
											/>
											<span className="text-sm">{perm.label}</span>
										</Label>
									))}
								</div>
								<Button
									size="sm"
									variant="outline"
									className="w-full"
									onClick={handlePermissionSave}
									disabled={isPending}
								>
									<Shield size={12} className="mr-1" /> Сохранить права
								</Button>
							</div>
						)}
					</>
				)}

				{/* ── АНКЕТА TAB ── */}
				{tab === "application" && (
					<div className="p-4 space-y-4">
						{!app ? (
							<div className="py-10 text-center">
								<ClipboardList
									size={32}
									className="mx-auto text-muted-foreground/20 mb-3"
								/>
								<p className="text-sm text-muted-foreground">
									Анкета не заполнена
								</p>
							</div>
						) : (
							<>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
											Статус анкеты
										</p>
										<AppStatusBadge status={app.status} />
									</div>
									<div className="text-xs text-muted-foreground space-y-1">
										<p>
											Тип:{" "}
											<span className="font-medium text-foreground">
												{app.clientType}
											</span>
										</p>
										<p>
											Создана:{" "}
											<span className="font-medium text-foreground">
												{new Date(app.createdAt).toLocaleDateString("ru-RU")}
											</span>
										</p>
										<p>
											Обновлена:{" "}
											<span className="font-medium text-foreground">
												{new Date(app.updatedAt).toLocaleDateString("ru-RU")}
											</span>
										</p>
									</div>
								</div>

								{app.rejectionReason && (
									<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
										<p className="text-xs font-bold text-red-400 mb-1">
											Причина отклонения
										</p>
										<p className="text-xs text-foreground/70">
											{app.rejectionReason}
										</p>
									</div>
								)}

								<AdminApplicationStatusChanger
									applicationId={app.id}
									currentStatus={app.status}
									onUpdate={(newStatus) =>
										onUpdate({
											application: {
												...app,
												status: newStatus as ApplicationStatus,
											},
										})
									}
								/>
							</>
						)}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="p-4 border-t border-foreground/8 flex gap-2 shrink-0">
				<Button
					variant="outline"
					size="sm"
					className={cn(
						"flex-1 text-xs gap-1",
						user.isBlocked
							? "text-green-500 border-green-500/30 hover:bg-green-500/10"
							: "text-red-500 border-red-500/30 hover:bg-red-500/10"
					)}
					onClick={handleBlock}
					disabled={isPending}
				>
					<Ban size={12} />
					{user.isBlocked ? "Разблокировать" : "Заблокировать"}
				</Button>
			</div>
		</div>
	);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function UsersTable({
	initialUsers,
}: {
	initialUsers: UserProfile[];
}) {
	const [users, setUsers] = useState(initialUsers);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [appFilter, setAppFilter] = useState("all");
	const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
	const [_isPending, startTransition] = useTransition();

	const handleRoleChange = (userId: string, newRole: Role) => {
		startTransition(async () => {
			const r = await updateUserRoleAction(userId, newRole);
			if (r.success) {
				setUsers((prev) =>
					prev.map((u) =>
						u.id === userId ? { ...u, role: newRole as UserProfile["role"] } : u
					)
				);
				toast.success(`Роль → ${newRole}`);
			} else toast.error(r.error);
		});
	};

	const handleUserUpdate = (userId: string, updated: Partial<UserProfile>) => {
		setUsers((prev) =>
			prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
		);
		if (activeUser?.id === userId) {
			setActiveUser((u) => (u ? { ...u, ...updated } : u));
		}
	};

	const pendingCount = users.filter(
		(u) => u.application?.status === "PENDING"
	).length;

	const filtered = users.filter((u) => {
		const q = search.toLowerCase();
		const matchSearch =
			!q ||
			u.name?.toLowerCase().includes(q) ||
			u.email?.toLowerCase().includes(q) ||
			u.phone?.toLowerCase().includes(q);
		const matchRole = roleFilter === "all" || u.role === roleFilter;
		const matchApp =
			appFilter === "all" ||
			(appFilter === "none" && !u.application) ||
			u.application?.status === appFilter;
		return matchSearch && matchRole && matchApp;
	});

	return (
		<div className="space-y-4">
			{/* Filters */}
			<Card>
				<CardContent className="p-3 flex flex-col sm:flex-row gap-3 flex-wrap">
					<div className="relative flex-1 min-w-48">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
						<Input
							placeholder="Поиск по имени, email, телефону..."
							className="pl-9 h-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<Select value={roleFilter} onValueChange={setRoleFilter}>
						<SelectTrigger className="h-9 w-40">
							<SelectValue placeholder="Все роли" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все роли</SelectItem>
							<SelectItem value="admin">Админы</SelectItem>
							<SelectItem value="manager">Менеджеры</SelectItem>
							<SelectItem value="partner">Партнёры</SelectItem>
							<SelectItem value="user">Клиенты</SelectItem>
						</SelectContent>
					</Select>
					<Select value={appFilter} onValueChange={setAppFilter}>
						<SelectTrigger className="h-9 w-48">
							<SelectValue placeholder="Статус анкеты" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все анкеты</SelectItem>
							<SelectItem value="none">Без анкеты</SelectItem>
							<SelectItem value="pending">На проверке</SelectItem>
							<SelectItem value="approved">Одобрено</SelectItem>
							<SelectItem value="rejected">Отклонено</SelectItem>
							<SelectItem value="draft">Черновик</SelectItem>
							<SelectItem value="clarification">Уточнение</SelectItem>
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{/* Stats strip */}
			<div className="flex gap-4 text-sm text-muted-foreground px-1">
				<span>
					Всего: <strong className="text-foreground">{users.length}</strong>
				</span>
				<span>
					Показано:{" "}
					<strong className="text-foreground">{filtered.length}</strong>
				</span>
				{pendingCount > 0 && (
					<span className="text-amber-400 font-medium">
						⏳ {pendingCount} анкет ожидают проверки
					</span>
				)}
			</div>

			{/* Table */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow className="border-foreground/5">
							<TableHead>Пользователь</TableHead>
							<TableHead>Роль</TableHead>
							<TableHead>Анкета</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead>Регистрация</TableHead>
							<TableHead className="text-right">Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.map((user) => (
							<TableRow
								key={user.id}
								className={cn(
									"border-foreground/5 cursor-pointer hover:bg-foreground/3 transition-colors",
									user.isBlocked && "opacity-50",
									activeUser?.id === user.id && "bg-foreground/5"
								)}
								onClick={() => setActiveUser(user)}
							>
								<TableCell>
									<div className="flex items-center gap-3">
										<div className="h-9 w-9 rounded-full bg-foreground/8 flex items-center justify-center overflow-hidden shrink-0">
											{user.avatarUrl ? (
												<Image
													src={user.avatarUrl}
													alt=""
													width={36}
													height={36}
													className="object-cover"
												/>
											) : (
												<User className="h-4 w-4 text-muted-foreground" />
											)}
										</div>
										<div>
											<p className="font-medium text-sm">
												{user.name || "Без имени"}
											</p>
											<p className="text-xs text-muted-foreground">
												{user.email}
											</p>
										</div>
									</div>
								</TableCell>

								<TableCell onClick={(e) => e.stopPropagation()}>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button
												type="button"
												className="flex items-center gap-1 hover:opacity-80"
											>
												<RoleBadge role={user.role ?? "user"} />
												<ChevronDown
													size={10}
													className="text-muted-foreground"
												/>
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											{(["USER", "PARTNER", "MANAGER", "ADMIN"] as Role[]).map(
												(r) => (
													<DropdownMenuItem
														key={r}
														onClick={() => handleRoleChange(user.id, r)}
														className={user.role === r ? "font-bold" : ""}
													>
														{r}
													</DropdownMenuItem>
												)
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>

								<TableCell>
									<AppStatusBadge status={user.application?.status} />
								</TableCell>

								<TableCell>
									{user.isBlocked ? (
										<Badge
											variant="outline"
											className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20"
										>
											<Ban size={10} className="mr-1" /> Заблокирован
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20"
										>
											Активен
										</Badge>
									)}
								</TableCell>

								<TableCell className="text-xs text-muted-foreground">
									{new Date(user.createdAt).toLocaleDateString("ru-RU")}
								</TableCell>

								<TableCell
									className="text-right"
									onClick={(e) => e.stopPropagation()}
								>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => setActiveUser(user)}>
												<Edit2 className="w-4 h-4 mr-2" /> Редактировать
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className={
													user.isBlocked ? "text-green-500" : "text-red-500"
												}
												onClick={async () => {
													const reason = user.isBlocked
														? undefined
														: (window.prompt("Причина блокировки:") ?? "");
													const r = await toggleUserBlockAction(
														user.id,
														!user.isBlocked,
														reason
													);
													if (r.success) {
														handleUserUpdate(user.id, {
															isBlocked: !user.isBlocked,
															blockedReason: reason ?? null,
														});
														toast.success(
															user.isBlocked ? "Разблокирован" : "Заблокирован"
														);
													} else toast.error(r.error);
												}}
											>
												<Ban className="w-4 h-4 mr-2" />
												{user.isBlocked ? "Разблокировать" : "Заблокировать"}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{filtered.length === 0 && (
					<div className="py-16 text-center space-y-2">
						<Users size={32} className="mx-auto text-muted-foreground/20" />
						<p className="text-sm text-muted-foreground">
							{users.length === 0
								? "Нет пользователей в базе данных"
								: "Пользователи не найдены по фильтрам"}
						</p>
						{users.length === 0 && (
							<p className="text-xs text-muted-foreground/50 max-w-sm mx-auto mt-1">
								Убедитесь что применена миграция migration_admin_access_v3.sql —
								без политики «Admins can view all profiles» запрос вернёт пустой
								массив
							</p>
						)}
					</div>
				)}
			</Card>

			{activeUser && (
				<>
					<button
						type="button"
						className="fixed inset-0 bg-black/40 z-40"
						onClick={() => setActiveUser(null)}
					/>
					<UserDetailPanel
						user={activeUser}
						onClose={() => setActiveUser(null)}
						onUpdate={(updated) => handleUserUpdate(activeUser.id, updated)}
					/>
				</>
			)}
		</div>
	);
}
