"use client";

import {
	Check,
	Mail,
	Pencil,
	Phone,
	Plus,
	User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ClientForm, VerificationBadge } from "@/components/forms";
import { ThemeCard } from "@/components/layouts/ThemeToggle";
import { ImageUploader } from "@/components/shared";
import { Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ClientFormValues } from "@/schemas";
import { useApplicationStore } from "@/store";
import { getClientDisplayData, isPartner } from "@/utils";

type ProfileTab = "profile" | "settings" | "edit";

export function ProfileDetails({ data }: { data: ClientFormValues | null }) {
	const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
	const [showAvatarUploader, setShowAvatarUploader] = useState(false);
	const [uploading, setUploading] = useState(false);
	const { user } = useAuth();
	const status = useApplicationStore((s) => s.status);
	const isClientPartner = isPartner(data);
	const displayData = getClientDisplayData(data);

	const name =
		displayData?.name ??
		user?.user_metadata?.name ??
		user?.email?.split("@")[0] ??
		"—";
	const avatarUrl = user?.user_metadata?.avatar_url ?? null;

	const tabs: { id: ProfileTab; label: string }[] = [
		{ id: "profile", label: "Профиль" },
		{ id: "settings", label: "Настройки" },
		...(status === "approved"
			? [{ id: "edit" as ProfileTab, label: "Редактировать" }]
			: []),
	];

	const handleAvatarFile = async (file: File | null) => {
		if (!file || !user) return;
		setUploading(true);
		try {
			const supabase = createClient();
			const ext = file.name.split(".").pop() ?? "webp";
			const path = `avatars/${user.id}.${ext}`;
			const { error: upErr } = await supabase.storage
				.from("public-assets")
				.upload(path, file, { upsert: true });
			if (upErr) throw upErr;
			const {
				data: { publicUrl },
			} = supabase.storage.from("public-assets").getPublicUrl(path);
			await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
			toast.success("Аватар обновлён");
			setShowAvatarUploader(false);
		} catch {
			toast.error("Не удалось загрузить аватар");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="max-w-xl mx-auto px-4 py-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
			{/* ── Avatar + identity hero ── */}
			<div className="rounded-3xl border border-foreground/5 bg-card/40 overflow-hidden">
				<div className="flex flex-col sm:flex-row items-center gap-5 p-5 sm:p-6">
					{/* Avatar */}
					<div className="relative group shrink-0">
						<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-foreground/5 border border-foreground/10">
							{avatarUrl ? (
								<Image
									src={avatarUrl}
									alt={name}
									width={96}
									height={96}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-3xl font-black">
									{name.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						<button
							type="button"
							onClick={() => setShowAvatarUploader(true)}
							disabled={uploading}
							className="absolute inset-0 rounded-2xl flex items-center justify-center bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
						>
							{uploading ? (
								<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							) : (
								<Pencil size={16} className="text-foreground" />
							)}
						</button>
					</div>

					<div className="flex-1 text-center sm:text-left min-w-0">
						<div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
							<span className="text-xl sm:text-2xl font-black tracking-tight">
								{name}
							</span>
							<VerificationBadge isClientPartner={isClientPartner} />
						</div>
						<p className="text-sm text-muted-foreground mt-0.5 truncate">
							{user?.email}
						</p>
						{displayData?.category && (
							<p className="text-[11px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider">
								{displayData.category === "legal"
									? "Юридическое лицо"
									: "Физическое лицо"}
							</p>
						)}
					</div>
				</div>

				{/* Avatar uploader panel */}
				{showAvatarUploader && (
					<div className="border-t border-foreground/5 p-5 space-y-3">
						<div className="flex items-center justify-between mb-1">
							<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
								Обновить аватар
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
							currentImageUrl={avatarUrl ?? undefined}
							onFileSelect={handleAvatarFile}
							aspectRatio={1}
						/>
					</div>
				)}
			</div>

			{/* ── Tabs ── */}
			<div className="flex gap-1 p-1 bg-foreground/5 rounded-2xl w-fit">
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

			{/* ── Profile tab ── */}
			{activeTab === "profile" && (
				<div className="space-y-4 animate-in fade-in duration-200">
					<SectionCard title="Контакты">
						<DetailRow
							icon={<Mail size={14} />}
							label="Email"
							value={displayData?.email || ""}
						/>
						<DetailRow
							icon={<Phone size={14} />}
							label="Телефон"
							value={displayData?.phone || ""}
						/>
					</SectionCard>

					<SectionCard
						title={
							displayData?.category === "legal" ? "Компания" : "Личные данные"
						}
					>
						{displayData?.category === "legal" ? (
							<>
								<DetailRow
									icon={<UserIcon size={14} />}
									label="Компания"
									value={displayData?.companyName}
								/>
								<DetailRow
									icon={<UserIcon size={14} />}
									label="ИНН"
									value={displayData?.inn}
								/>
							</>
						) : (
							<DetailRow
								icon={<UserIcon size={14} />}
								label="Дата рождения"
								value={displayData?.birth || ""}
							/>
						)}
					</SectionCard>
				</div>
			)}

			{/* ── Settings tab ── */}
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
					<EmailCard currentEmail={user?.email || ""} />
				</div>
			)}

			{/* ── Edit tab (inline ClientForm) ── */}
			{activeTab === "edit" && (
				<div className="animate-in fade-in duration-200">
					<ClientForm />
				</div>
			)}
		</div>
	);
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-foreground/5 bg-card/30 overflow-hidden">
			<div className="px-5 py-2.5 border-b border-foreground/5">
				<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
					{title}
				</p>
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
		<div className="flex items-center justify-between gap-3 px-5 py-3.5">
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

// ─── Email card ───────────────────────────────────────────────────────────────

function EmailCard({ currentEmail }: { currentEmail?: string }) {
	const [adding, setAdding] = useState(false);
	const [newEmail, setNewEmail] = useState("");
	const [saving, setSaving] = useState(false);

	const handleAdd = async () => {
		if (!newEmail.includes("@")) {
			toast.error("Некорректный email");
			return;
		}
		setSaving(true);
		try {
			const { error } = await createClient().auth.updateUser({
				email: newEmail,
			});
			if (error) throw error;
			toast.success("Письмо с подтверждением отправлено");
			setAdding(false);
			setNewEmail("");
		} catch (e: unknown) {
			toast.error((e as Error).message ?? "Ошибка");
		} finally {
			setSaving(false);
		}
	};

	return (
		<SectionCard title="Email-адреса">
			<div className="flex items-center justify-between px-5 py-3.5">
				<div className="flex items-center gap-3 min-w-0">
					<Mail size={14} className="text-muted-foreground/40 shrink-0" />
					<span className="text-sm truncate">{currentEmail}</span>
				</div>
				<span className="text-[10px] uppercase font-bold tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
					Основной
				</span>
			</div>

			{adding ? (
				<div className="px-5 py-4 flex gap-2">
					<Input
						type="email"
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						placeholder="Новый email"
						className="flex-1 bg-foreground/5 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 min-w-0"
						autoFocus
					/>
					<button
						type="button"
						onClick={handleAdd}
						disabled={saving}
						className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0"
					>
						{saving ? (
							<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
						) : (
							<Check size={14} />
						)}
					</button>
					<button
						type="button"
						onClick={() => {
							setAdding(false);
							setNewEmail("");
						}}
						className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-foreground/10 text-muted-foreground transition-colors shrink-0"
					>
						✕
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setAdding(true)}
					className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-foreground/5 transition-colors"
				>
					<Plus size={14} className="text-muted-foreground/40" />
					<span className="text-sm text-muted-foreground">Добавить email</span>
				</button>
			)}
		</SectionCard>
	);
}
