"use client";

import {
	ClipboardTextIcon,
	NoteBlankIcon,
	PlusIcon,
	ProhibitIcon,
	SealPercentIcon,
	ShieldCheckIcon,
	ShieldIcon,
	UserIcon,
	XIcon,
} from "@phosphor-icons/react";
import { ClipboardIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	addUserAdminNoteAction,
	createUserDiscountAction,
	toggleUserBlockAction,
	updateUserRoleAction,
} from "@/actions/client-application-actions";
import { RoleBadge } from "@/components/admin/users/RoleBadge";
import { StatusChanger } from "@/components/admin/users/StatusChanger";
import { VerificationBadge } from "@/components/forms";
import {
	Button,
	Checkbox,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from "@/components/ui";
import type {
	ApplicationStatus,
	UserProfile,
} from "@/core/domain/entities/User";
import { cn } from "@/lib/utils";

const PERMISSIONS = [
	{ key: "bookings_approve", label: "Подтверждать брони" },
	{ key: "equipment_edit", label: "Редактировать технику" },
	{ key: "users_view", label: "Просматривать клиентов" },
	{ key: "finance_view", label: "Просматривать финансы" },
] as const;

export function UserDetailPanel({
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

	const handleAddDiscount = () => {
		if (!discountValue) return;

		if (discountType === "promo" && !promoCode.trim()) {
			toast.error("Введите промокод");
			return;
		}

		startTransition(async () => {
			const r = await createUserDiscountAction({
				userId: user.id,
				type: discountType,
				value: Number(discountValue),
				description: discountDesc ?? "",
				promoCode: promoCode ?? "",
			});

			if (!r.success) {
				toast.error(r.error);
			} else {
				toast.success("Скидка успешно добавлена");
				setDiscountValue("");
				setDiscountDesc("");
				setPromoCode("");
			}
		});
	};

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
							<UserIcon size={18} className="text-muted-foreground" />
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
					<XIcon size={15} />
				</button>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-foreground/8 shrink-0">
				{[
					{ id: "details" as const, label: "Профиль", icon: UserIcon },
					{
						id: "application" as const,
						label: "Анкета",
						icon: ClipboardTextIcon,
					},
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
								<NoteBlankIcon size={11} /> Заметка
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
								<PlusIcon size={12} className="mr-1" /> Добавить
							</Button>
						</div>

						{/* Discount */}
						<div className="p-4 space-y-2">
							<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
								<SealPercentIcon size={11} /> Скидка / Промокод
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
									placeholder="КОД ПРОМО..."
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
								onClick={handleAddDiscount}
								disabled={!discountValue || isPending}
							>
								<PlusIcon size={12} className="mr-1" /> Назначить
							</Button>
						</div>

						{/* Manager permissions */}
						{user.role === "MANAGER" && (
							<div className="p-4 space-y-2">
								<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
									<ShieldCheckIcon size={11} /> Права менеджера
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
									<ShieldIcon size={12} className="mr-1" /> Сохранить права
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
								<ClipboardIcon
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
										<VerificationBadge />
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

								<StatusChanger
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
					<ProhibitIcon size={12} />
					{user.isBlocked ? "Разблокировать" : "Заблокировать"}
				</Button>
			</div>
		</div>
	);
}
