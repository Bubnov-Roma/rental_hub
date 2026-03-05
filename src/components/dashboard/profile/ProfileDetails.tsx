"use client";

import {
	AlertTriangle,
	ArrowLeft,
	ExternalLink,
	FilePenLine,
	Globe,
	ImageOff,
	ImagePlus,
	Mail,
	MessageCircle,
	Pencil,
	Phone,
	Plus,
	Trash2,
	User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ApplicationDataEditor } from "@/components/dashboard/profile/ApplicationDataEditor";
import { VerificationBadge } from "@/components/forms";
import { ThemeCard } from "@/components/layouts/ThemeToggle";
import {
	ImageUploader,
	InlineEditField,
	SignOutButton,
} from "@/components/shared";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
	Input,
} from "@/components/ui";
import { SUPPORT_PHONE, SUPPORT_TELEGRAM } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { uploadAvatarImage } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import type { ClientFormValues } from "@/schemas";
import { useApplicationStore } from "@/store";
import { getClientDisplayData } from "@/utils/client-data.utils";

// ── Social helpers ────────────────────────────────────────────────────────────

function getSocialLabel(url: string): string {
	const lower = url.toLowerCase();
	if (lower.includes("t.me") || (lower.startsWith("@") && lower.length < 20))
		return "Telegram";
	if (lower.includes("vk.com") || lower.startsWith("vk.")) return "VK";
	if (lower.includes("wa.me") || lower.includes("whatsapp")) return "WhatsApp";
	if (lower.includes("instagram") || lower.includes("instagr.am"))
		return "Instagram";
	if (lower.includes("facebook") || lower.includes("fb.com")) return "Facebook";
	if (lower.includes("youtube") || lower.includes("youtu.be")) return "YouTube";
	return "Ссылка";
}

function getSocialBadgeColor(label: string): string {
	const map: Record<string, string> = {
		Telegram: "bg-sky-500/15 text-sky-400 border-sky-500/20",
		VK: "bg-blue-500/15 text-blue-400 border-blue-500/20",
		WhatsApp: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
		Instagram: "bg-pink-500/15 text-pink-400 border-pink-500/20",
		Facebook: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
		YouTube: "bg-red-500/15 text-red-400 border-red-500/20",
	};
	return (
		map[label] ?? "bg-foreground/5 text-foreground/60 border-foreground/10"
	);
}

// ─────────────────────────────────────────────────────────────────────────────

type ProfileTab = "profile" | "settings" | "update_data";

export function ProfileDetails({ data }: { data: ClientFormValues | null }) {
	const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
	const [showAvatarUploader, setShowAvatarUploader] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");

	const { user, refreshProfile } = useAuth();
	const router = useRouter();
	const status = useApplicationStore((s) => s.status);
	const displayData = getClientDisplayData(data);

	const nickname = user?.user_metadata?.nickname as string | undefined;
	const fullName =
		displayData?.name ??
		(user?.user_metadata?.name as string | undefined) ??
		null;
	const displayName = nickname ?? fullName ?? user?.email?.split("@")[0] ?? "—";
	const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

	const tabs: { id: ProfileTab; label: string }[] = [
		{ id: "profile", label: "Профиль" },
		{ id: "settings", label: "Настройки" },
	];

	// ── Avatar ────────────────────────────────────────────────────────────────
	const handleAvatarFile = async (file: File | null) => {
		if (!file) return;
		setUploading(true);
		try {
			await uploadAvatarImage(file);
			await refreshProfile(); // → UserMenu + hero re-render without reload
			toast.success("Аватар обновлён");
			setShowAvatarUploader(false);
		} catch {
			toast.error("Не удалось загрузить аватар");
		} finally {
			setUploading(false);
		}
	};

	// ── Avatar delete ─────────────────────────────────────────────────────────
	const handleAvatarDelete = async () => {
		if (!user || !avatarUrl) return;
		setUploading(true);
		try {
			const supabase = createClient();

			const baseUrl = avatarUrl.split("?")[0];

			if (!baseUrl) return;
			// Remove file from storage (path: <userId>/<userId>.*)
			const urlPath = new URL(baseUrl).pathname;
			const storagePath = urlPath.split("/avatars/")[1];
			if (storagePath) {
				await supabase.storage.from("avatars").remove([storagePath]);
			}
			// Clear from auth metadata and profiles table
			await Promise.all([
				supabase.auth.updateUser({ data: { avatar_url: null } }),
				supabase
					.from("profiles")
					.update({ avatar_url: null })
					.eq("id", user.id),
			]);
			await refreshProfile();
			toast.success("Аватар удалён");
			setShowAvatarUploader(false);
		} catch {
			toast.error("Не удалось удалить аватар");
		} finally {
			setUploading(false);
		}
	};

	// ── Generic profile saver ─────────────────────────────────────────────────
	// Writes to profiles table + auth metadata simultaneously, then refreshes.
	const saveProfileField = async (
		dbField: string,
		value: string,
		metaKey?: string
	) => {
		if (!user) return;
		const supabase = createClient();
		const payload = value.trim() || null;

		// Supabase query builders are "thenable" but not Promise<T>, so we
		// await them individually to keep TypeScript happy.
		const { error: dbError } = await supabase
			.from("profiles")
			.update({ [dbField]: payload })
			.eq("id", user.id);
		if (dbError) throw new Error(dbError.message);

		if (metaKey) {
			const { error: authError } = await supabase.auth.updateUser({
				data: { [metaKey]: payload },
			});
			if (authError) throw new Error(authError.message);
		}

		await refreshProfile(); // live update everywhere (UserMenu, hero, etc.)
	};

	// ── Delete (soft) ─────────────────────────────────────────────────────────
	const handleDeleteAccount = async () => {
		if (deleteConfirmText !== "УДАЛИТЬ" || !user) return;
		const supabase = createClient();
		try {
			const deletionDate = new Date();
			deletionDate.setDate(deletionDate.getDate() + 7);
			await supabase
				.from("profiles")
				.update({
					status: "pending_deletion",
					deletion_scheduled_at: deletionDate.toISOString(),
				})
				.eq("id", user.id);
			await supabase.auth.signOut();
			toast.info(
				"Аккаунт будет удалён через 7 дней. Войдите снова для отмены."
			);
			router.push("/auth");
		} catch {
			toast.error("Ошибка при удалении аккаунта");
		}
	};

	return (
		<div className="max-w-xl mx-auto px-4 py-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
			{/* ── Hero ───────────────────────────────────────────────────────── */}
			<div className="card-hero">
				<div className="flex flex-col sm:flex-row items-center gap-5 p-5 sm:p-6">
					<div className="relative group shrink-0">
						<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl avatar-container">
							{avatarUrl ? (
								<Image
									key={avatarUrl}
									src={avatarUrl}
									alt={displayName}
									width={96}
									height={96}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="avatar-placeholder text-3xl">
									{displayName.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						{/* biome-ignore lint/a11y/useSemanticElements: Nested buttons are illegal in HTML, so we use a div with ARIA roles */}
						<div
							role="button"
							tabIndex={0}
							aria-disabled={uploading}
							onClick={
								!uploading ? () => setShowAvatarUploader((v) => !v) : undefined
							}
							onKeyDown={(e) => {
								if (uploading) return;
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setShowAvatarUploader((v) => !v);
								}
							}}
							className={`avatar-edit-overlay rounded-2xl ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
						>
							{uploading ? (
								<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							) : avatarUrl ? (
								<div className="flex-col items-center gap-3">
									<Button
										variant="brand"
										className="flex flex-col items-center gap-1 group/btn w-full hover:bg-background/50"
									>
										<Pencil size={14} className="text-foreground/80" />
										<span className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
											Изменить
										</span>
									</Button>
									<div className="w-full h-px my-0.5 bg-foreground/10" />
									<Button
										variant="brand"
										onClick={(e) => {
											e.stopPropagation();
											handleAvatarDelete();
										}}
										disabled={uploading}
										className="flex flex-col items-center gap-1 w-full hover:bg-background/50"
									>
										<ImageOff size={14} className="text-destructive/80" />
										<span className="text-[9px] font-bold uppercase tracking-wider text-destructive/60">
											Удалить
										</span>
									</Button>
								</div>
							) : (
								<div className="flex flex-col items-center gap-1">
									<ImagePlus size={16} className="text-foreground" />
									<span className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
										Загрузить
									</span>
								</div>
							)}
						</div>
					</div>
					<div className="flex-1 text-center sm:text-left min-w-0">
						<div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
							<span className="text-xl sm:text-2xl font-black tracking-tight">
								{displayName}
							</span>
						</div>
						{nickname && fullName && (
							<p className="text-xs text-muted-foreground/50 mt-0.5">
								{fullName}
							</p>
						)}
						<p className="text-sm text-muted-foreground mt-0.5 truncate">
							{user?.email}
						</p>
					</div>
				</div>

				{showAvatarUploader && (
					<div className="border-t border-foreground/5 p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
						<div className="flex items-center justify-between mb-1">
							<p className="card-section-label">
								{avatarUrl ? "Заменить аватар" : "Загрузить аватар"}
							</p>
							<button
								type="button"
								onClick={() => setShowAvatarUploader(false)}
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								Отмена
							</button>
						</div>
						<ImageUploader
							currentImageUrl={avatarUrl ?? ""}
							onFileSelect={handleAvatarFile}
							aspectRatio={1}
						/>
					</div>
				)}
			</div>

			{/* ── Tabs ───────────────────────────────────────────────────────── */}
			<div className="flex w-full items-center justify-between">
				<div className="tabs-group">
					{tabs.map(({ id, label }) => (
						<button
							key={id}
							type="button"
							onClick={() => setActiveTab(id)}
							className={cn(
								"px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
								activeTab === id
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							{label}
						</button>
					))}
				</div>
				<VerificationBadge isClientPartner={displayData?.isPartner ?? false} />
			</div>

			{/* ── Profile tab ────────────────────────────────────────────────── */}
			{activeTab === "profile" && (
				<div className="space-y-4 animate-in fade-in duration-200">
					<SectionCard title="Контакты">
						<DetailRow
							icon={<Mail size={14} />}
							label="Email"
							value={user?.email || ""}
						/>
						<DetailRow
							icon={<Phone size={14} />}
							label="Телефон"
							value={displayData?.phone || ""}
						/>
					</SectionCard>

					{displayData && (
						<SectionCard title="Личные данные">
							<DetailRow
								icon={<UserIcon size={14} />}
								label="ФИО"
								value={displayData.name}
							/>
							<DetailRow
								icon={<UserIcon size={14} />}
								label="Дата рождения"
								value={displayData.birth}
							/>
						</SectionCard>
					)}

					<ProfileSocialsCard data={data} onUpdated={refreshProfile} />

					<SectionCard title="Поддержка">
						<a
							href={SUPPORT_TELEGRAM}
							target="_blank"
							rel="noopener noreferrer"
							className="detail-row hover:bg-foreground/5 transition-colors group"
						>
							<div className="flex items-center gap-3">
								<MessageCircle size={14} className="text-muted-foreground/40" />
								<span className="text-sm text-muted-foreground">Telegram</span>
							</div>
							<ExternalLink
								size={12}
								className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors"
							/>
						</a>
						<a
							href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
							className="detail-row hover:bg-foreground/5 transition-colors"
						>
							<div className="flex items-center gap-3">
								<Phone size={14} className="text-muted-foreground/40" />
								<span className="text-sm text-muted-foreground">
									{SUPPORT_PHONE}
								</span>
							</div>
						</a>
					</SectionCard>
				</div>
			)}

			{/* ── Settings tab ───────────────────────────────────────────────── */}
			{activeTab === "settings" && (
				<div className="space-y-4 animate-in fade-in duration-200">
					<SectionCard title="Оформление">
						<div className="p-5">
							<p className="text-sm text-muted-foreground mb-4">
								Тема интерфейса
							</p>
							<ThemeCard />
						</div>
					</SectionCard>

					{/* Nickname */}
					<SectionCard title="Никнейм">
						<div className="px-5 py-4">
							<InlineEditField
								value={nickname ?? ""}
								placeholder="@nickname или отображаемое имя"
								icon={<UserIcon size={14} />}
								onSave={async (val) => {
									await saveProfileField("nickname", val, "nickname");
									toast.success(
										val.trim() ? "Никнейм сохранён" : "Никнейм удалён"
									);
								}}
								onCancel={() => {}}
							/>
						</div>
						<p className="px-5 pb-3 text-[11px] text-muted-foreground/40">
							Отображается вместо полного имени по всему сайту
						</p>
					</SectionCard>

					{/* Email change */}
					<SectionCard title="Email-адрес">
						<div className="detail-row">
							<div className="flex items-center gap-3 min-w-0">
								<Mail size={14} className="text-muted-foreground/40 shrink-0" />
								<span className="text-sm truncate">{user?.email}</span>
							</div>
							<span className="text-[10px] uppercase font-bold tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
								Основной
							</span>
						</div>
						<div className="px-5 pb-4">
							<InlineEditField
								value=""
								placeholder="Новый email"
								type="email"
								icon={<Mail size={14} />}
								onSave={async (val) => {
									if (!val.includes("@")) throw new Error("Некорректный email");
									const { error } = await createClient().auth.updateUser({
										email: val,
									});
									if (error) throw error;
									toast.success("Письмо с подтверждением отправлено");
								}}
								onCancel={() => {}}
							/>
						</div>
					</SectionCard>

					{/* Extra phone */}
					<SectionCard title="Дополнительный телефон">
						<div className="px-5 py-4">
							<InlineEditField
								value={(user?.user_metadata?.extra_phone as string) ?? ""}
								placeholder="+7 (___) ___-__-__"
								type="tel"
								icon={<Phone size={14} />}
								onSave={async (val) => {
									await saveProfileField("extra_phone", val, "extra_phone");
									toast.success(
										val.trim() ? "Доп. телефон сохранён" : "Доп. телефон удалён"
									);
								}}
								onCancel={() => {}}
							/>
						</div>
					</SectionCard>

					{/* Logout */}
					<SignOutButton />

					{/* Update application data — only for verified clients */}
					{(status === "approved" || status === "standard") && (
						<button
							type="button"
							onClick={() => setActiveTab("update_data")}
							className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border border-primary/10 bg-secondary/30 text-primary-accent/60 hover:text-primary-accent hover:bg-secondary/60 transition-colors"
						>
							<FilePenLine size={16} />
							<span className="text-md font-medium">Обновить данные</span>
						</button>
					)}

					{/* Delete */}
					<button
						type="button"
						onClick={() => setShowDeleteDialog(true)}
						className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
					>
						<Trash2 size={16} />
						<span className="text-md font-medium">Удалить аккаунт</span>
					</button>
				</div>
			)}

			{/* ── Update data tab ─────────────────────────────────────────────── */}
			{activeTab === "update_data" && (
				<div className="space-y-4 animate-in fade-in duration-200">
					<div className="card-surface">
						<div className="card-section-header">
							<p className="card-section-label">Данные анкеты</p>
						</div>
						<div className="p-5">
							<ApplicationDataEditor data={data} />
						</div>
					</div>
					<Button
						variant="ghost"
						onClick={() => setActiveTab("settings")}
						className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft size={14} /> Вернуться к общим настройкам
					</Button>
				</div>
			)}

			{/* ── Delete dialog ── */}
			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={(o) => {
					setShowDeleteDialog(o);
					if (!o) setDeleteConfirmText("");
				}}
			>
				<AlertDialogContent className="border-destructive/20 bg-background/90 backdrop-blur-xl">
					<AlertDialogHeader>
						<div className="flex items-center gap-3 mb-2">
							<div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
								<AlertTriangle size={18} className="text-destructive" />
							</div>
							<AlertDialogTitle className="text-destructive">
								Удалить аккаунт?
							</AlertDialogTitle>
						</div>
						<AlertDialogDescription className="space-y-2 text-left">
							<span>
								Аккаунт будет помечен к удалению. У вас есть{" "}
								<strong>7 дней</strong> чтобы передумать — просто войдите снова.
							</span>
							<span className="text-destructive block py-2">
								По истечении срока все данные уничтожаются безвозвратно.
								Повторная регистрация потребует нового анкетирования.
							</span>
							<span className="pt-3 block">
								<span className="text-xs text-muted-foreground pb-2 block">
									Введите <strong>УДАЛИТЬ</strong> для подтверждения:
								</span>
								<Input
									value={deleteConfirmText}
									onChange={(e) => setDeleteConfirmText(e.target.value)}
									placeholder="УДАЛИТЬ"
									className="glass-input"
								/>
							</span>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							className="bg-primary/90 hover:bg-primary disabled:opacity-40 rounded-xl p-2 text-sm cursor-pointer"
							onClick={() => setDeleteConfirmText("")}
						>
							Отмена
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteAccount}
							disabled={deleteConfirmText !== "УДАЛИТЬ"}
							className="bg-destructive hover:bg-destructive/90 disabled:opacity-30 rounded-xl p-2 text-sm cursor-pointer"
						>
							Удалить аккаунт
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileSocialsCard — view + edit socials directly from profile tab
// ─────────────────────────────────────────────────────────────────────────────

type SocialEntry = { url: string };

function ProfileSocialsCard({
	data,
	onUpdated,
}: {
	data: ClientFormValues | null;
	onUpdated: () => Promise<void>;
}) {
	const { user } = useAuth();
	const displayData = getClientDisplayData(data);
	const [socials, setSocials] = useState<SocialEntry[]>(
		displayData?.socials ?? []
	);
	const [adding, setAdding] = useState(false);
	const [saving, setSaving] = useState(false);

	const persist = async (updated: SocialEntry[]) => {
		if (!data || !user) return;
		setSaving(true);
		try {
			const supabase = createClient();
			const { error } = await supabase
				.from("client_applications")
				.update({
					application_data: {
						...(data as Record<string, unknown>),
						applicationData: {
							...(data.applicationData as Record<string, unknown>),
							contacts: { socials: updated },
						},
					},
				})
				.eq("user_id", user.id);
			if (error) throw error;
			setSocials(updated);
			await onUpdated();
		} catch {
			toast.error("Ошибка сохранения");
		} finally {
			setSaving(false);
		}
	};

	const handleUpdate = async (index: number, url: string) => {
		await persist(socials.map((s, i) => (i === index ? { url } : s)));
	};

	const handleDelete = async (index: number) => {
		if (socials.length <= 1) {
			toast.info("Должна остаться хотя бы одна ссылка");
			return;
		}
		await persist(socials.filter((_, i) => i !== index));
	};

	const handleAdd = async (url: string) => {
		if (!url.trim()) return;
		await persist([...socials, { url: url.trim() }]);
		setAdding(false);
	};

	if (!data) return null; // no application yet — nothing to show

	return (
		<SectionCard title="Соцсети и мессенджеры">
			{socials.map((s, i) => {
				const label = getSocialLabel(s.url);
				const color = getSocialBadgeColor(label);
				return (
					<div
						key={`${s}` + `${i}`}
						className="px-5 py-3 border-b border-foreground/5 last:border-b-0 space-y-2 gap-2 flex items-center"
					>
						<InlineEditField
							value={s.url}
							placeholder="@username или https://..."
							icon={
								<span
									className={cn(
										"text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0",
										color
									)}
								>
									{label}
								</span>
							}
							onSave={(val) => handleUpdate(i, val)}
							onCancel={() => {}}
						/>
						{socials.length > 1 && (
							<Button
								variant="ghost"
								onClick={() => handleDelete(i)}
								disabled={saving}
								className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
							>
								<Trash2 size={12} />
							</Button>
						)}
					</div>
				);
			})}

			{adding ? (
				<div className="px-5 py-3">
					<InlineEditField
						value=""
						placeholder="@username или https://..."
						icon={<Globe size={14} />}
						autoFocus
						onSave={handleAdd}
						onCancel={() => setAdding(false)}
					/>
				</div>
			) : (
				socials.length < 5 && (
					<button
						type="button"
						onClick={() => setAdding(true)}
						className="detail-row w-full text-left hover:bg-foreground/5 transition-colors"
					>
						<div className="flex items-center gap-3">
							<Plus size={14} className="text-muted-foreground/40" />
							<span className="text-sm text-muted-foreground">
								Добавить ссылку
							</span>
						</div>
					</button>
				)
			)}
		</SectionCard>
	);
}

// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="card-surface">
			<div className="card-section-header">
				<p className="card-section-label">{title}</p>
			</div>
			<div className="divide-y divide-foreground/5">{children}</div>
		</div>
	);
}

function DetailRow({
	icon,
	label,
	value,
}: {
	icon: React.ReactElement;
	label: string;
	value?: string | null;
}) {
	return (
		<div className="detail-row">
			<div className="flex items-center gap-3 min-w-0 shrink-0">
				<span className="text-muted-foreground/40 shrink-0">{icon}</span>
				<span className="text-sm text-muted-foreground whitespace-nowrap">
					{label}
				</span>
			</div>
			<span className="text-sm font-medium truncate text-right">
				{value || "—"}
			</span>
		</div>
	);
}
