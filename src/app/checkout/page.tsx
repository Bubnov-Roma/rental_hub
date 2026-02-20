"use client";

import { addHours, format, startOfHour } from "date-fns";
import { ru } from "date-fns/locale";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	CheckLine,
	ChevronDown,
	List,
	Loader2,
	Lock,
	Mail,
	Minus,
	Package,
	Plus,
	ShieldCheck,
	X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
	checkAvailabilityAction,
	createBookingAction,
} from "@/app/actions/booking";
import { RainbowSpinner } from "@/components/shared";
import { ApplicationStatusBadge } from "@/components/shared/ApplicationStatusBadge";
import { SuccessScreen } from "@/components/shared/SuccessView";
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
	Calendar,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	Input,
	Separator,
} from "@/components/ui";
import { useApplicationStatus } from "@/hooks/use-application-status";
import { useAuth } from "@/hooks/useAuth";
import { useOtpAuth } from "@/hooks/useOtpAuth";
import { calculateItemPrice, cn, combineDateAndTime } from "@/lib/utils";
import { type CartItem, useCartStore } from "@/store/use-cart-store";
import { formatPlural } from "@/utils";

// ─── Рабочие часы ────────────────────────────────────────────────────────────
const WORK_START = 10;
const WORK_END = 20;

function buildDropdownSlots(): string[] {
	const slots: string[] = [];
	for (let h = WORK_START; h < WORK_END; h++) {
		slots.push(`${String(h).padStart(2, "0")}:00`);
		slots.push(`${String(h).padStart(2, "0")}:30`);
	}
	slots.push(`${String(WORK_END).padStart(2, "0")}:00`);
	return slots;
}
const DROPDOWN_SLOTS = buildDropdownSlots();

function clampTime(time: string): string {
	const parts = time.split(":");
	let h = Number.parseInt(parts[0] ?? "10", 10);
	let m = Number.parseInt(parts[1] ?? "0", 10);
	if (Number.isNaN(h)) h = WORK_START;
	if (Number.isNaN(m)) m = 0;
	if (h < WORK_START) {
		h = WORK_START;
		m = 0;
	}
	if (h > WORK_END || (h === WORK_END && m > 0)) {
		h = WORK_END;
		m = 0;
	}
	m = Math.round(m / 10) * 10;
	if (m === 60) {
		h++;
		m = 0;
	}
	if (h > WORK_END) {
		h = WORK_END;
		m = 0;
	}
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── TimeInput ────────────────────────────────────────────────────────────────
function TimeInput({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function onOut(e: MouseEvent) {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
				setOpen(false);
		}
		document.addEventListener("mousedown", onOut);
		return () => document.removeEventListener("mousedown", onOut);
	}, []);

	return (
		<div className="flex-1 min-w-0" ref={wrapRef}>
			<p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 mb-1 ml-0.5">
				{label}
			</p>
			<button
				type="button"
				className={cn(
					"relative flex items-center gap-2 bg-background/80 rounded-xl px-2.5 py-2 border transition-colors w-full",
					open ? "border-primary/50" : "border-white/8 hover:border-white/20"
				)}
				onClick={(e) => {
					e.stopPropagation();
					setOpen((v) => !v);
				}}
			>
				<div className="flex-1 font-black text-sm select-none">{value}</div>
				<ChevronDown
					size={11}
					className={cn(
						"shrink-0 transition-transform duration-200 text-muted-foreground/40",
						open && "-rotate-180 text-primary"
					)}
				/>
				{open && (
					<div className="absolute z-50 bottom-full mb-1 left-0 right-0 bg-background/98 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
						<div className="max-h-40 overflow-y-auto p-1 no-scrollbar">
							{DROPDOWN_SLOTS.map((slot) => (
								<button
									key={slot}
									type="button"
									onClick={() => {
										onChange(slot);
										setOpen(false);
									}}
									className={cn(
										"w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
										value === slot
											? "bg-primary/20 text-primary"
											: "hover:bg-foreground/8 text-foreground/80"
									)}
								>
									{slot}
								</button>
							))}
						</div>
					</div>
				)}
			</button>
		</div>
	);
}

// ─── OTP Auth Modal ──────────────────────────────────────────────────────────
function AuthModal({
	open,
	onOpenChange,
	onSuccess,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onSuccess: () => void;
}) {
	const [step, setStep] = useState<"email" | "otp">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
	const { sendOtpCode, verifyOtpCode, isSendingCode, isVerifyingCode } =
		useOtpAuth();
	const [isDesktop, setIsDesktop] = useState(true);

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 768px)");
		setIsDesktop(mq.matches);
		const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mq.addEventListener("change", h);
		return () => mq.removeEventListener("change", h);
	}, []);

	const handleSend = async () => {
		if (!email.includes("@")) {
			toast.error("Введите корректный email");
			return;
		}
		const ok = await sendOtpCode(email, "email");
		if (ok) setStep("otp");
	};

	const handleVerify = async () => {
		const code = otp.join("");
		if (code.length < 6) return;
		const ok = await verifyOtpCode(email, code, "email");
		if (ok) {
			onSuccess();
			onOpenChange(false);
		}
	};

	const handleOtpInput = (i: number, val: string) => {
		const d = val.replace(/\D/g, "").slice(-1);
		const next = [...otp];
		next[i] = d;
		setOtp(next);
		if (d && i < 5) otpRefs.current[i + 1]?.focus();
	};

	const content = (
		<div className="space-y-5">
			{step === "email" ? (
				<>
					<div className="relative">
						<Mail
							size={15}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
						/>
						<Input
							type="email"
							placeholder="your@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSend()}
							className="pl-9 h-12 rounded-xl bg-white/5 border-white/10"
						/>
					</div>
					<Button
						onClick={handleSend}
						disabled={isSendingCode}
						className="w-full h-12 rounded-2xl font-black uppercase italic"
					>
						{isSendingCode ? (
							<Loader2 className="animate-spin" />
						) : (
							"Получить код →"
						)}
					</Button>
					<p className="text-[11px] text-center text-muted-foreground/50">
						Отправим одноразовый код — никакого пароля
					</p>
				</>
			) : (
				<>
					<p className="text-sm text-center text-muted-foreground">
						Код отправлен на{" "}
						<span className="font-bold text-foreground">{email}</span>
					</p>
					<div className="flex gap-2 justify-center">
						{otp.map((digit, i) => (
							<input
								key={`${digit}` + `${i}`}
								ref={(el) => {
									otpRefs.current[i] = el;
								}}
								type="text"
								inputMode="numeric"
								maxLength={1}
								value={digit}
								onChange={(e) => handleOtpInput(i, e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Backspace" && !digit && i > 0)
										otpRefs.current[i - 1]?.focus();
								}}
								className="w-10 h-12 rounded-xl text-center text-xl font-black bg-foreground/5 border border-white/10 outline-none focus:border-primary/60 focus:bg-primary/5 transition-colors"
							/>
						))}
					</div>
					<Button
						onClick={handleVerify}
						disabled={isVerifyingCode || otp.join("").length < 6}
						className="w-full h-12 rounded-2xl font-black uppercase italic"
					>
						{isVerifyingCode ? (
							<Loader2 className="animate-spin" />
						) : (
							"Подтвердить"
						)}
					</Button>
					<button
						type="button"
						onClick={() => setStep("email")}
						className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
					>
						← Изменить email
					</button>
				</>
			)}
		</div>
	);

	const title = "Войдите для бронирования";
	const desc = "Введите ваш email";

	if (isDesktop)
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-95 rounded-xl border-white/10 space-y-4">
					<DialogHeader>
						<DialogTitle className="text-xl font-black uppercase italic">
							{title}
						</DialogTitle>
						<DialogDescription>{desc}</DialogDescription>
					</DialogHeader>
					{content}
				</DialogContent>
			</Dialog>
		);

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="px-4 pb-8">
				<DrawerHeader className="text-left px-0 pt-6">
					<DrawerTitle className="text-xl font-black uppercase italic">
						{title}
					</DrawerTitle>
					<DrawerDescription>{desc}</DrawerDescription>
				</DrawerHeader>
				{content}
				<DrawerFooter className="px-0 pt-2">
					<DrawerClose asChild>
						<Button variant="outline" className="rounded-2xl">
							Отмена
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

// ─── AlertDialog — предупреждение при уходе со страницы ───────────────────────
/**
 * Показывается когда пользователь кликает по ссылке "Заполнить анкету"
 * внутри DepositModal. Предлагает сначала сохранить бронь.
 */
function NavigateAwayAlert({
	open,
	onOpenChange,
	onBook,
	onLeave,
	isPending,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onBook: () => void;
	onLeave: () => void;
	isPending: boolean;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="rounded-2xl border-white/10 max-w-sm">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-lg font-black uppercase italic">
						Сохранить бронь?
					</AlertDialogTitle>
					<AlertDialogDescription className="text-sm text-muted-foreground">
						Пока вы заполняете анкету, другие клиенты могут занять эту технику.
						Забронируйте сейчас — мы сохраним ваш заказ.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="gap-2 flex-col sm:flex-col space-y-2 pt-6">
					<AlertDialogAction
						onClick={onBook}
						disabled={isPending}
						className="w-full rounded-2xl font-black h-11 bg-primary text-white"
					>
						{isPending ? (
							<Loader2 size={16} className="animate-spin" />
						) : (
							<>Забронировать и перейти</>
						)}
					</AlertDialogAction>
					<AlertDialogCancel
						onClick={onLeave}
						className="w-full rounded-2xl h-11 border-white/1 border border-foreground-10"
					>
						Перейти без брони
					</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

// ─── Deposit Modal ────────────────────────────────────────────────────────────
function DepositModal({
	open,
	onOpenChange,
	deposit,
	onConfirm,
	pending,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	deposit: number;
	onConfirm: () => Promise<boolean>;
	pending: boolean;
}) {
	const [isDesktop, setIsDesktop] = useState(true);
	const [showLeaveAlert, setShowLeaveAlert] = useState(false);
	const router = useRouter();
	const { status, config } = useApplicationStatus();

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 768px)");
		setIsDesktop(mq.matches);
		const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mq.addEventListener("change", h);
		return () => mq.removeEventListener("change", h);
	}, []);

	// Клик по ссылке анкеты — показываем AlertDialog
	const handleActionLinkClick = () => {
		if (config.action?.href === "/dashboard/profile") {
			setShowLeaveAlert(true);
		} else if (config.action?.href) {
			router.push(config.action.href);
		}
	};

	// Забронировать и уйти
	const handleBookThenLeave = async () => {
		const success = await onConfirm();
		if (success) {
			router.push("/dashboard/profile");
		}
		setShowLeaveAlert(false);
	};

	// Уйти без брони
	const handleLeaveWithoutBook = () => {
		setShowLeaveAlert(false);
		onOpenChange(false);
		if (config.action?.href) router.push(config.action.href);
	};

	// standard = полный залог, остальные (no_application, pending, reviewing...) = тоже залог
	const showDeposit = status !== "approved";

	const content = (
		<div className="space-y-4">
			{/* Блок залога */}
			<div
				className={cn(
					"p-4 rounded-2xl border flex gap-3",
					showDeposit
						? "bg-yellow-500/10 border-yellow-500/25"
						: "bg-emerald-500/10 border-emerald-500/25"
				)}
			>
				<ShieldCheck
					size={20}
					className={cn(
						"shrink-0 mt-0.5",
						showDeposit ? "text-yellow-500" : "text-emerald-500"
					)}
				/>
				<div>
					<p className="font-bold text-sm mb-1">
						{showDeposit
							? "Залог при получении техники"
							: "Аренда без залога 🎉"}
					</p>
					<p className="text-muted-foreground text-sm">
						{showDeposit
							? "При выдаче потребуется залог:"
							: "Ваш профиль верифицирован — залог не нужен."}
					</p>
					{showDeposit && (
						<p className="text-3xl font-black text-yellow-500 mt-1">
							{deposit.toLocaleString("ru")} ₽
						</p>
					)}
					<p className="text-[11px] text-muted-foreground mt-1">
						{showDeposit
							? "Возвращается при сдаче техники в целости"
							: "Спасибо за доверие!"}
					</p>
				</div>
			</div>

			{/* Статус анкеты + ссылка-действие (только если не approved) */}
			{showDeposit && (
				<div className="p-3 rounded-2xl bg-primary/5 border border-primary/20">
					<ApplicationStatusBadge variant="full" />
					{/* Ссылка-действие из конфига — при клике показывает AlertDialog */}
					{config.action && (
						<button
							type="button"
							onClick={handleActionLinkClick}
							className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2 ml-1"
						>
							{config.action.label}
							<ArrowRight size={11} />
						</button>
					)}
				</div>
			)}

			{/* Кнопки */}
			<div className="flex gap-3">
				<Button
					variant="outline"
					onClick={() => onOpenChange(false)}
					className="flex-1 rounded-2xl"
				>
					Отмена
				</Button>
				<Button
					onClick={() => onConfirm()}
					disabled={pending}
					className="flex-1 rounded-2xl font-black"
				>
					{pending ? (
						<Loader2 className="animate-spin" size={16} />
					) : (
						<>
							<CheckCircle2 size={15} className="mr-1.5" />
							{showDeposit ? "Понятно, продолжить" : "Забронировать"}
						</>
					)}
				</Button>
			</div>

			{/* AlertDialog — уход со страницы */}
			<NavigateAwayAlert
				open={showLeaveAlert}
				onOpenChange={setShowLeaveAlert}
				onBook={handleBookThenLeave}
				onLeave={handleLeaveWithoutBook}
				isPending={pending}
			/>
		</div>
	);

	const title = "Подтверждение брони";
	const desc = showDeposit
		? "Ознакомьтесь с условиями аренды"
		: "Всё готово — подтвердите бронирование";

	if (isDesktop)
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-105 rounded-3xl border-white/10">
					<DialogHeader>
						<DialogTitle className="text-xl font-black uppercase italic">
							{title}
						</DialogTitle>
						<DialogDescription>{desc}</DialogDescription>
					</DialogHeader>
					{content}
				</DialogContent>
			</Dialog>
		);

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="px-4 pb-8">
				<DrawerHeader className="text-left px-0 pt-6">
					<DrawerTitle className="text-xl font-black uppercase italic">
						{title}
					</DrawerTitle>
					<DrawerDescription>{desc}</DrawerDescription>
				</DrawerHeader>
				{content}
			</DrawerContent>
		</Drawer>
	);
}

// ─── OrderRow ─────────────────────────────────────────────────────────────────
function OrderRow({
	item,
	isBusy,
	isChecking,
	hours,
	onAdd,
	onRemove,
}: {
	item: CartItem;
	isBusy: boolean;
	isChecking: boolean;
	hours: number;
	onAdd: () => void;
	onRemove: () => void;
}) {
	const isGhost = item.quantity === 0;
	const price =
		hours > 0
			? Math.round(
					calculateItemPrice(item.equipment, hours) * Math.max(item.quantity, 1)
				)
			: 0;

	return (
		<button
			type="button"
			onClick={isGhost ? onAdd : undefined}
			title={isGhost ? "Нажмите, чтобы вернуть в бронь" : undefined}
			className={cn(
				"flex items-center gap-2 py-1.5 px-2 rounded-xl transition-all w-full",
				isGhost
					? "opacity-35 cursor-pointer hover:opacity-60 hover:bg-primary/5"
					: "hover:bg-foreground/5",
				isBusy &&
					!isGhost &&
					"bg-amber-400/5 ring-1 ring-amber-400/25 ring-inset"
			)}
		>
			<div className="w-7 h-7 rounded-lg overflow-hidden bg-foreground/10 relative shrink-0">
				<Image
					src={item.equipment.imageUrl || "/placeholder-equipment.png"}
					alt={item.equipment.title}
					fill
					className="object-cover"
				/>
			</div>
			<div className="flex-1 min-w-0">
				<p
					className={cn(
						"text-xs font-medium leading-tight truncate",
						isGhost ? "line-through opacity-50" : "text-foreground/80"
					)}
				>
					{item.equipment.title}
				</p>
				{isGhost && (
					<p className="text-[9px] text-primary/50 font-bold">
						нажать → вернуть
					</p>
				)}
				{isBusy && !isGhost && (
					<div className="flex items-center gap-1">
						<AlertCircle size={9} className="text-amber-400" />
						<span className="text-[9px] text-amber-400 font-bold">Занято</span>
					</div>
				)}
			</div>
			{isGhost ? (
				<Plus size={12} className="text-primary/40 shrink-0" />
			) : (
				<div className="flex items-center gap-1 shrink-0">
					<Button
						asChild
						variant="outline"
						size="icon"
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						className="p-1 w-5 h-5 rounded-full border border-foreground/15 flex items-center justify-center hover:bg-foreground/10 transition-colors"
					>
						{item.quantity === 1 ? (
							<X size={9} className="text-destructive" />
						) : (
							<Minus size={9} />
						)}
					</Button>
					<span className="text-xs font-black w-3.5 text-center">
						{item.quantity}
					</span>
					<Button
						asChild
						variant="outline"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
							onAdd();
						}}
						disabled={item.quantity >= (item.equipment.available_count ?? 99)}
						className={cn(
							"w-5 h-5 p-1 rounded-full border border-foreground/15 flex items-center justify-center hover:bg-foreground/10 transition-colors disabled:opacity-30",
							item.quantity >= (item.equipment.available_count ?? 99) &&
								"cursor-not-allowed opacity-30"
						)}
					>
						<Plus size={4} />
					</Button>
				</div>
			)}
			{!isGhost && (
				<div className="shrink-0 min-w-10 text-right">
					{isChecking ? (
						<div className="h-3 w-9 rounded bg-foreground/10 animate-pulse ml-auto" />
					) : (
						<span className="text-[11px] font-black text-primary italic">
							{price.toLocaleString("ru")}₽
						</span>
					)}
				</div>
			)}
		</button>
	);
}

// ─── OrderList ─────────────────────────────────────────────────────────────────
function OrderList({
	items,
	hours,
	busyIds,
	isChecking,
	onAdd,
	onRemove,
}: {
	items: CartItem[];
	hours: number;
	busyIds: string[];
	isChecking: boolean;
	onAdd: (eq: CartItem["equipment"]) => void;
	onRemove: (id: string) => void;
}) {
	const [mobileOpen, setMobileOpen] = useState(true);
	const activeCount = items.filter((i) => i.quantity > 0).length;
	const hasAnyBusy = busyIds.some((id) =>
		items.find((i) => i.equipment.id === id && i.quantity > 0)
	);

	const header = (
		<div className="flex items-center gap-1.5">
			<span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">
				Техника
			</span>
			<span className="text-primary font-black text-sm leading-none">
				{activeCount}
			</span>
			{isChecking && (
				<span
					className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0"
					title="Проверяем доступность…"
				/>
			)}
		</div>
	);

	const listContent = (
		<div className="space-y-0.5 w-full">
			{items.length === 0 ? (
				<p className="text-xs text-muted-foreground/30 text-center py-6">
					Нет позиций
				</p>
			) : (
				items.map((item) => (
					<OrderRow
						key={item.equipment.id}
						item={item}
						isBusy={busyIds.includes(item.equipment.id)}
						isChecking={isChecking}
						hours={hours}
						onAdd={() => onAdd(item.equipment)}
						onRemove={() => onRemove(item.equipment.id)}
					/>
				))
			)}
			{hasAnyBusy && !isChecking && (
				<div className="mt-1.5 p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center gap-2">
					<AlertCircle size={10} className="text-amber-400 shrink-0" />
					<p className="text-[10px] font-bold text-amber-400">
						{busyIds.length} {formatPlural(busyIds.length, "items")} недоступно
					</p>
				</div>
			)}
		</div>
	);

	return (
		<>
			<div className="hidden md:flex flex-col h-full">
				<div className="mb-1.5 shrink-0">{header}</div>
				<div className="overflow-y-auto flex-1 no-scrollbar">{listContent}</div>
			</div>
			<Collapsible
				open={mobileOpen}
				onOpenChange={setMobileOpen}
				className="md:hidden w-full"
			>
				<CollapsibleTrigger asChild>
					<Button
						variant="ghost"
						type="button"
						className="flex items-center justify-between w-full py-2.5 px-1 text-left"
					>
						{header}
						<ChevronDown
							size={13}
							className={cn(
								"rounded-xl text-muted-foreground transition-transform duration-200",
								mobileOpen && "rotate-180"
							)}
						/>
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
					<div className="pb-2">{listContent}</div>
				</CollapsibleContent>
			</Collapsible>
		</>
	);
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────
function SummaryRow({
	label,
	value,
	isYellow,
	color,
}: {
	label: string;
	value: React.ReactNode;
	isYellow?: boolean;
	color?: string;
}) {
	return (
		<div className="flex justify-between items-center">
			<span className="text-xs font-bold uppercase opacity-40">{label}</span>
			<div className="flex-1 border-b border-dotted border-foreground/10 mx-3 mb-1" />
			<span
				className={cn(
					"text-sm font-black italic",
					isYellow ? "text-yellow-500" : color || "text-foreground"
				)}
			>
				{value}
			</span>
		</div>
	);
}

// ─── Основная страница ────────────────────────────────────────────────────────
export default function CheckoutPage() {
	const router = useRouter();
	const { items, addItem, removeOne, clearCart } = useCartStore();
	const { user } = useAuth();
	const { status } = useApplicationStatus();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isChecking, setIsChecking] = useState(false);
	const [busyIds, setBusyIds] = useState<string[]>([]);
	const [showAuth, setShowAuth] = useState(false);
	const [showDeposit, setShowDeposit] = useState(false);
	const [bookingDone, setBookingDone] = useState(false);

	const defaultStart = useMemo(() => {
		const d = addHours(startOfHour(new Date()), 1);
		const h = d.getHours();
		if (h < WORK_START) d.setHours(WORK_START, 0, 0, 0);
		if (h >= WORK_END) {
			d.setDate(d.getDate() + 1);
			d.setHours(WORK_START, 0, 0, 0);
		}
		return d;
	}, []);
	const defaultEnd = useMemo(() => addHours(defaultStart, 4), [defaultStart]);

	const [date, setDate] = useState<DateRange | undefined>({
		from: defaultStart,
		to: defaultEnd,
	});
	const [startTime, setStartTime] = useState(
		clampTime(format(defaultStart, "HH:mm"))
	);
	const [endTime, setEndTime] = useState(
		clampTime(format(defaultEnd, "HH:mm"))
	);

	const math = useMemo(() => {
		const empty = {
			totalRental: 0,
			days: 0,
			hours: 0,
			totalDeposit: 0,
			totalRV: 0,
			startFull: null as Date | null,
			endFull: null as Date | null,
		};
		if (!date?.from || !date?.to) return empty;
		const start = combineDateAndTime(date.from, startTime);
		const end = combineDateAndTime(date.to, endTime);
		if (!start || !end) return empty;
		const ms = end.getTime() - start.getTime();
		const totalHours = Math.max(0, ms / (1000 * 60 * 60));
		const active = items.filter((i) => i.quantity > 0);
		return {
			totalRental: active.reduce(
				(s, i) => s + calculateItemPrice(i.equipment, totalHours) * i.quantity,
				0
			),
			totalDeposit: active.reduce(
				(s, i) => s + (i.equipment.deposit || 0) * i.quantity,
				0
			),
			totalRV: active.reduce(
				(s, i) => s + (i.equipment.replacement_value || 0) * i.quantity,
				0
			),
			hours: totalHours,
			days: Math.floor(totalHours / 24),
			startFull: start,
			endFull: end,
		};
	}, [date, startTime, endTime, items]);

	// Фоновая проверка доступности
	useEffect(() => {
		let cancelled = false;
		async function check() {
			const ids = items
				.filter((i) => i.quantity > 0)
				.map((i) => i.equipment.id);
			if (!math.startFull || !math.endFull || ids.length === 0) {
				setBusyIds([]);
				return;
			}
			setIsChecking(true);
			NProgress.start();
			try {
				const r = await checkAvailabilityAction(
					ids,
					math.startFull.toISOString(),
					math.endFull.toISOString()
				);
				if (!cancelled) setBusyIds(r.busyIds ?? []);
			} finally {
				if (!cancelled) {
					setIsChecking(false);
					NProgress.done();
				}
			}
		}
		check();
		return () => {
			cancelled = true;
		};
	}, [math.startFull, math.endFull, items]);

	const activeItems = items.filter((i) => i.quantity > 0);
	const hasAnyBusy = busyIds.length > 0;
	const isCanBook =
		math.totalRental > 0 && !hasAnyBusy && !!math.startFull && !!math.endFull;
	const isLoggedIn = !!user;

	// Общая функция создания брони — возвращает true при успехе
	const doCreateBooking = async (): Promise<boolean> => {
		if (!isCanBook || !math.startFull || !math.endFull) return false;
		setIsSubmitting(true);
		try {
			const r = await createBookingAction({
				items: activeItems.map((i) => ({
					id: i.equipment.id,
					price_to_pay: calculateItemPrice(i.equipment, math.hours),
					quantity: i.quantity,
				})),
				startDate: math.startFull.toISOString(),
				endDate: math.endFull.toISOString(),
				totalPrice: math.totalRental,
				hasInsurance: true,
				totalReplacementValue: math.totalRV,
			});
			if (r.success) {
				setShowDeposit(false);
				clearCart();
				setBookingDone(true);
				return true;
			}
			toast.error(r.error || "Ошибка брони");
			return false;
		} catch {
			toast.error("Непредвиденная ошибка");
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBookClick = () => {
		if (!isCanBook) return;
		if (!isLoggedIn) {
			setShowAuth(true);
			return;
		}

		// approved → бронируем сразу, без диалогового окна
		if (status === "approved") {
			doCreateBooking();
			return;
		}

		// standard / no_application / pending / reviewing / clarification / rejected → показываем DepositModal
		setShowDeposit(true);
	};

	const durationLabel = useMemo(() => {
		const d = math.days;
		const remH = Math.round(math.hours % 24);
		const parts: string[] = [];
		if (d > 0) parts.push(formatPlural(d, "days"));
		if (remH > 0) parts.push(`${remH} ч.`);
		return parts.join(" ") || "—";
	}, [math]);

	if (bookingDone) {
		return (
			<SuccessScreen
				title="Заказ оформлен!"
				description="Переходим в личный кабинет…"
				redirectTo="/dashboard"
				delay={2000}
			/>
		);
	}

	if (items.length === 0) {
		return (
			<div className="container mx-auto py-40 text-center space-y-6">
				<h1 className="text-6xl font-black uppercase italic opacity-10">
					Пусто
				</h1>
				<Button
					onClick={() => router.push("/equipment")}
					variant="outline"
					className="rounded-full"
				>
					Вернуться в каталог
				</Button>
			</div>
		);
	}

	const bookButton = (
		<Button
			className={cn(
				"inline-flex items-center justify-center gap-2",
				"w-full h-14 rounded-2xl text-base font-black uppercase italic shadow-md",
				"bg-primary text-primary-foreground duration-300",
				"hover:scale-[1.01] active:scale-95 transition-all will-change-transform",
				"whitespace-nowrap overflow-hidden"
			)}
			onClick={handleBookClick}
			disabled={!isCanBook || isSubmitting}
		>
			{isSubmitting ? (
				<RainbowSpinner size={16} />
			) : !isLoggedIn ? (
				<>
					<Lock size={14} className="mr-2" />
					Войти и забронировать
				</>
			) : (
				<>
					Забронировать <ArrowRight className="ml-2" size={16} />
				</>
			)}
		</Button>
	);

	return (
		<div className="min-h-screen pb-28 md:pb-20">
			<div className="container mx-auto px-4 lg:px-6 pt-8">
				<div className="flex-col gap-2 mb-8">
					<h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
						Оформление{" "}
					</h1>
					<span className="pl-2 text-primary text-md not-italic">
						{formatPlural(activeItems.length, "items")}
					</span>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:items-stretch">
					{/* ── ЛЕВАЯ СЕКЦИЯ ──────────────────────────────────── */}
					<section className="relative glass-card bg-muted-foreground/10 lg:col-span-3 p-4 md:p-6 rounded-[2rem] border border-white/10 backdrop-blur-3xl flex flex-col">
						<div className="hidden md:flex items-end gap-4 mb-4 shrink-0">
							<div className="shrink-0">
								<div className="flex items-center gap-2 text-primary">
									<Package size={13} />
									<h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-50">
										Период аренды
									</h3>
								</div>
							</div>
							<div className="flex-1 flex items-center gap-2 text-primary">
								<List size={13} />
								<h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-50">
									Список техники
								</h3>
							</div>
						</div>

						<div className="md:hidden flex items-center gap-2 text-primary mb-3 shrink-0">
							<Package size={13} />
							<h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-50">
								Детали заказа
							</h3>
						</div>

						<div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 min-h-0">
							<div className="md:w-auto shrink-0">
								<div className="rounded-xl overflow-hidden bg-foreground/10 border border-white/10 w-fit mx-auto">
									<Calendar
										mode="range"
										captionLayout="dropdown"
										selected={date}
										onSelect={setDate}
										modifiersClassNames={{
											booked: "[&>button]:line-through opacity-100",
										}}
										locale={ru}
										disabled={(d) =>
											d < new Date(new Date().setHours(0, 0, 0, 0))
										}
										className="p-3"
									/>
									<div className="flex gap-2 p-2 pt-0">
										<TimeInput
											label="Начало"
											value={startTime}
											onChange={(v) => setStartTime(clampTime(v))}
										/>
										<TimeInput
											label="Конец"
											value={endTime}
											onChange={(v) => setEndTime(clampTime(v))}
										/>
									</div>
								</div>
							</div>

							<div className="flex-1 min-w-0 min-h-0 flex flex-col">
								<OrderList
									items={items}
									hours={math.hours}
									busyIds={busyIds}
									isChecking={isChecking}
									onAdd={(eq) => addItem(eq)}
									onRemove={(id) => removeOne(id)}
								/>
							</div>
						</div>

						<p className="relative text-[9px] px-5 py-0.5 text-muted-foreground/50 font-bold uppercase flex items-center gap-1 mt-2 md:mt-4 rounded-xl bg-background/50 shadow-inset w-full justify-center text-center z-10 backdrop-blur-2xl">
							Забрать или вернуть заказ можно в любой день с {WORK_START}:00 ·
							до {WORK_END}:00
						</p>
					</section>

					{/* ── ПРАВАЯ СЕКЦИЯ ─────────────────────────────────── */}
					<section className="h-full glass-card bg-muted-foreground/10 lg:col-span-2 p-5 rounded-[2rem] border border-white/10 backdrop-blur-3xl flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
						<div className="flex items-center gap-2 text-primary">
							<CheckLine size={13} />
							<h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-50">
								Сверка
							</h3>
						</div>

						<div className="space-y-2">
							{date?.from && date?.to ? (
								<>
									<SummaryRow
										label="Начало аренды"
										value={`${format(date.from, "d MMM", { locale: ru })} · ${startTime}`}
									/>
									<Separator className="bg-foreground/0 my-1!" />
									<SummaryRow
										label="Конец аренды"
										value={`${format(date.to, "d MMM", { locale: ru })} · ${endTime}`}
									/>
								</>
							) : (
								<div className="p-4 rounded-2xl bg-background/50 border border-white/5 flex items-center justify-center">
									<p className="text-xs text-muted-foreground">Выберите даты</p>
								</div>
							)}
						</div>

						<Separator className="bg-foreground/8" />

						<div className="space-y-2">
							<SummaryRow label="Время" value={durationLabel} />
							<Separator className="bg-foreground/0 my-1!" />
							<SummaryRow
								label="Аренда"
								value={`${Math.round(math.totalRental).toLocaleString("ru")}₽`}
							/>
							<Separator className="bg-foreground/0 my-1!" />
							<SummaryRow label="Страховка" value="0₽" color="text-green-400" />
							{math.totalDeposit > 0 && status !== "approved" && (
								<SummaryRow
									label="Залог"
									value={`${math.totalDeposit.toLocaleString("ru")}₽`}
									isYellow
								/>
							)}
						</div>

						<div className="my-4">
							<div className="flex justify-between items-end space-y-2">
								<span className="text-[10px] uppercase font-black opacity-40">
									К оплате
								</span>
								<span className="text-4xl font-black italic text-primary tracking-tighter">
									{Math.round(math.totalRental).toLocaleString("ru")}₽
								</span>
							</div>
						</div>

						<div className="hidden md:block">{bookButton}</div>

						{isChecking && !hasAnyBusy && (
							<p className="text-[10px] text-muted-foreground/35 text-center font-bold uppercase flex items-center justify-center gap-1.5">
								<span className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
								Проверяем доступность…
							</p>
						)}
					</section>
				</div>
			</div>

			{/* ── МОБИЛЬНЫЙ FAB ─────────────────────────────────────────── */}
			<div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/85 backdrop-blur-xl border-t border-foreground/10 overflow-hidden">
				<div className="w-full px-4 py-3 box-border">
					{bookButton}
					{isChecking && !hasAnyBusy && (
						<p className="text-[9px] text-muted-foreground/30 text-center font-bold uppercase flex items-center justify-center gap-1 mt-1.5">
							<span className="w-1 h-1 rounded-full bg-primary/30 animate-pulse" />
							Проверяем доступность…
						</p>
					)}
				</div>
			</div>

			{/* Диалоги */}
			<AuthModal
				open={showAuth}
				onOpenChange={setShowAuth}
				onSuccess={() => setShowDeposit(true)}
			/>
			<DepositModal
				open={showDeposit}
				onOpenChange={setShowDeposit}
				deposit={math.totalDeposit}
				onConfirm={doCreateBooking}
				pending={isSubmitting}
			/>
		</div>
	);
}

// "use client";

// import { addHours, format, startOfHour } from "date-fns";
// import { ru } from "date-fns/locale";
// import {
// 	AlertCircle,
// 	ArrowRight,
// 	CheckCircle2,
// 	CheckLine,
// 	ChevronDown,
// 	List,
// 	Loader2,
// 	Lock,
// 	Mail,
// 	Minus,
// 	Package,
// 	Plus,
// 	ShieldCheck,
// 	X,
// } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import NProgress from "nprogress";
// import { useEffect, useMemo, useRef, useState } from "react";
// import type { DateRange } from "react-day-picker";
// import { toast } from "sonner";
// import {
// 	checkAvailabilityAction,
// 	createBookingAction,
// } from "@/app/actions/booking";
// import { RainbowSpinner } from "@/components/shared";
// import { ApplicationStatusBadge } from "@/components/shared/ApplicationStatusBadge";
// import { SuccessScreen } from "@/components/shared/SuccessView";
// import {
// 	Button,
// 	Calendar,
// 	Collapsible,
// 	CollapsibleContent,
// 	CollapsibleTrigger,
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogHeader,
// 	DialogTitle,
// 	Drawer,
// 	DrawerClose,
// 	DrawerContent,
// 	DrawerDescription,
// 	DrawerFooter,
// 	DrawerHeader,
// 	DrawerTitle,
// 	Input,
// 	Separator,
// } from "@/components/ui";
// import { useAuth } from "@/hooks/useAuth";
// import { useOtpAuth } from "@/hooks/useOtpAuth";
// import { calculateItemPrice, cn, combineDateAndTime } from "@/lib/utils";
// import { type CartItem, useCartStore } from "@/store/use-cart-store";
// import { useApplicationStore } from "@/store/useApplicationStore";
// import { formatPlural } from "@/utils";

// // ─── Рабочие часы ────────────────────────────────────────────────────────────
// const WORK_START = 10;
// const WORK_END = 20;

// function buildDropdownSlots(): string[] {
// 	const slots: string[] = [];
// 	for (let h = WORK_START; h < WORK_END; h++) {
// 		slots.push(`${String(h).padStart(2, "0")}:00`);
// 		slots.push(`${String(h).padStart(2, "0")}:30`);
// 	}
// 	slots.push(`${String(WORK_END).padStart(2, "0")}:00`);
// 	return slots;
// }
// const DROPDOWN_SLOTS = buildDropdownSlots();

// function clampTime(time: string): string {
// 	const parts = time.split(":");
// 	let h = Number.parseInt(parts[0] ?? "10", 10);
// 	let m = Number.parseInt(parts[1] ?? "0", 10);
// 	if (Number.isNaN(h)) h = WORK_START;
// 	if (Number.isNaN(m)) m = 0;
// 	if (h < WORK_START) {
// 		h = WORK_START;
// 		m = 0;
// 	}
// 	if (h > WORK_END || (h === WORK_END && m > 0)) {
// 		h = WORK_END;
// 		m = 0;
// 	}
// 	m = Math.round(m / 10) * 10;
// 	if (m === 60) {
// 		h++;
// 		m = 0;
// 	}
// 	if (h > WORK_END) {
// 		h = WORK_END;
// 		m = 0;
// 	}
// 	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// }

// // ─── TimeInput ────────────────────────────────────────────────────────────────
// function TimeInput({
// 	label,
// 	value,
// 	onChange,
// }: {
// 	label: string;
// 	value: string;
// 	onChange: (v: string) => void;
// }) {
// 	const [open, setOpen] = useState(false);
// 	const wrapRef = useRef<HTMLDivElement>(null);

// 	useEffect(() => {
// 		function onOut(e: MouseEvent) {
// 			if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
// 				setOpen(false);
// 		}
// 		document.addEventListener("mousedown", onOut);
// 		return () => document.removeEventListener("mousedown", onOut);
// 	}, []);

// 	return (
// 		<div className="flex-1 min-w-0" ref={wrapRef}>
// 			<p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40 mb-1 ml-0.5">
// 				{label}
// 			</p>
// 			<button
// 				type="button"
// 				className={cn(
// 					"relative flex items-center gap-2 bg-background/80 rounded-xl px-2.5 py-2 border transition-colors w-full",
// 					open ? "border-primary/50" : "border-white/8 hover:border-white/20"
// 				)}
// 				onClick={(e) => {
// 					e.stopPropagation();
// 					setOpen((v) => !v);
// 				}}
// 			>
// 				<div className="flex-1 font-black text-sm select-none">{value}</div>
// 				<ChevronDown
// 					size={11}
// 					className={cn(
// 						"shrink-0 transition-transform duration-200 text-muted-foreground/40",
// 						open && "-rotate-180 text-primary"
// 					)}
// 				/>
// 				{open && (
// 					<div className="absolute z-50 bottom-full mb-1 left-0 right-0 bg-background/98 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
// 						<div className="max-h-40 overflow-y-auto p-1 no-scrollbar">
// 							{DROPDOWN_SLOTS.map((slot) => (
// 								<button
// 									key={slot}
// 									type="button"
// 									onClick={() => {
// 										onChange(slot);
// 										setOpen(false);
// 									}}
// 									className={cn(
// 										"w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
// 										value === slot
// 											? "bg-primary/20 text-primary"
// 											: "hover:bg-foreground/8 text-foreground/80"
// 									)}
// 								>
// 									{slot}
// 								</button>
// 							))}
// 						</div>
// 					</div>
// 				)}
// 			</button>
// 		</div>
// 	);
// }

// // ─── OTP Auth Modal ──────────────────────────────────────────────────────────
// function AuthModal({
// 	open,
// 	onOpenChange,
// 	onSuccess,
// }: {
// 	open: boolean;
// 	onOpenChange: (v: boolean) => void;
// 	onSuccess: () => void;
// }) {
// 	const [step, setStep] = useState<"email" | "otp">("email");
// 	const [email, setEmail] = useState("");
// 	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
// 	const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
// 	const { sendOtpCode, verifyOtpCode, isSendingCode, isVerifyingCode } =
// 		useOtpAuth();
// 	const [isDesktop, setIsDesktop] = useState(true);

// 	useEffect(() => {
// 		const mq = window.matchMedia("(min-width: 768px)");
// 		setIsDesktop(mq.matches);
// 		const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
// 		mq.addEventListener("change", h);
// 		return () => mq.removeEventListener("change", h);
// 	}, []);

// 	const handleSend = async () => {
// 		if (!email.includes("@")) {
// 			toast.error("Введите корректный email");
// 			return;
// 		}
// 		const ok = await sendOtpCode(email, "email");
// 		if (ok) setStep("otp");
// 	};

// 	const handleVerify = async () => {
// 		const code = otp.join("");
// 		if (code.length < 6) return;
// 		const ok = await verifyOtpCode(email, code, "email");
// 		if (ok) {
// 			onSuccess();
// 			onOpenChange(false);
// 		}
// 	};

// 	const handleOtpInput = (i: number, val: string) => {
// 		const d = val.replace(/\D/g, "").slice(-1);
// 		const next = [...otp];
// 		next[i] = d;
// 		setOtp(next);
// 		if (d && i < 5) otpRefs.current[i + 1]?.focus();
// 	};

// 	const content = (
// 		<div className="space-y-5">
// 			{step === "email" ? (
// 				<>
// 					<div className="relative">
// 						<Mail
// 							size={15}
// 							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
// 						/>
// 						<Input
// 							type="email"
// 							placeholder="your@email.com"
// 							value={email}
// 							onChange={(e) => setEmail(e.target.value)}
// 							onKeyDown={(e) => e.key === "Enter" && handleSend()}
// 							className="pl-9 h-12 rounded-xl bg-white/5 border-white/10"
// 						/>
// 					</div>
// 					<Button
// 						onClick={handleSend}
// 						disabled={isSendingCode}
// 						className="w-full h-12 rounded-2xl font-black uppercase italic"
// 					>
// 						{isSendingCode ? (
// 							<Loader2 className="animate-spin" />
// 						) : (
// 							"Получить код →"
// 						)}
// 					</Button>
// 					<p className="text-[11px] text-center text-muted-foreground/50">
// 						Отправим одноразовый код — никакого пароля
// 					</p>
// 				</>
// 			) : (
// 				<>
// 					<p className="text-sm text-center text-muted-foreground">
// 						Код отправлен на{" "}
// 						<span className="font-bold text-foreground">{email}</span>
// 					</p>
// 					<div className="flex gap-2 justify-center">
// 						{otp.map((digit, i) => (
// 							<input
// 								key={`${digit}` + `${i}`}
// 								ref={(el) => {
// 									otpRefs.current[i] = el;
// 								}}
// 								type="text"
// 								inputMode="numeric"
// 								maxLength={1}
// 								value={digit}
// 								onChange={(e) => handleOtpInput(i, e.target.value)}
// 								onKeyDown={(e) => {
// 									if (e.key === "Backspace" && !digit && i > 0)
// 										otpRefs.current[i - 1]?.focus();
// 								}}
// 								className="w-10 h-12 rounded-xl text-center text-xl font-black bg-foreground/5 border border-white/10 outline-none focus:border-primary/60 focus:bg-primary/5 transition-colors"
// 							/>
// 						))}
// 					</div>
// 					<Button
// 						onClick={handleVerify}
// 						disabled={isVerifyingCode || otp.join("").length < 6}
// 						className="w-full h-12 rounded-2xl font-black uppercase italic"
// 					>
// 						{isVerifyingCode ? (
// 							<Loader2 className="animate-spin" />
// 						) : (
// 							"Подтвердить"
// 						)}
// 					</Button>
// 					<button
// 						type="button"
// 						onClick={() => setStep("email")}
// 						className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
// 					>
// 						← Изменить email
// 					</button>
// 				</>
// 			)}
// 		</div>
// 	);

// 	const title = "Войдите для бронирования";
// 	const desc = "Введите ваш email";

// 	if (isDesktop)
// 		return (
// 			<Dialog open={open} onOpenChange={onOpenChange}>
// 				<DialogContent className="sm:max-w-95 rounded-xl border-white/10 space-y-4">
// 					<DialogHeader>
// 						<DialogTitle className="text-xl font-black uppercase italic">
// 							{title}
// 						</DialogTitle>
// 						<DialogDescription>{desc}</DialogDescription>
// 					</DialogHeader>
// 					{content}
// 				</DialogContent>
// 			</Dialog>
// 		);

// 	return (
// 		<Drawer open={open} onOpenChange={onOpenChange}>
// 			<DrawerContent className="px-4 pb-8">
// 				<DrawerHeader className="text-left px-0 pt-6">
// 					<DrawerTitle className="text-xl font-black uppercase italic">
// 						{title}
// 					</DrawerTitle>
// 					<DrawerDescription>{desc}</DrawerDescription>
// 				</DrawerHeader>
// 				{content}
// 				<DrawerFooter className="px-0 pt-2">
// 					<DrawerClose asChild>
// 						<Button variant="outline" className="rounded-2xl">
// 							Отмена
// 						</Button>
// 					</DrawerClose>
// 				</DrawerFooter>
// 			</DrawerContent>
// 		</Drawer>
// 	);
// }

// // ─── Deposit Modal ────────────────────────────────────────────────────────────
// function DepositModal({
// 	open,
// 	onOpenChange,
// 	deposit,
// 	onConfirm,
// 	pending,
// 	applicationStatus,
// }: {
// 	open: boolean;
// 	onOpenChange: (v: boolean) => void;
// 	deposit: number;
// 	onConfirm: () => void;
// 	pending: boolean;
// 	applicationStatus: string;
// }) {
// 	const [isDesktop, setIsDesktop] = useState(true);
// 	useEffect(() => {
// 		const mq = window.matchMedia("(min-width: 768px)");
// 		setIsDesktop(mq.matches);
// 		const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
// 		mq.addEventListener("change", h);
// 		return () => mq.removeEventListener("change", h);
// 	}, []);

// 	const canSkipDeposit = applicationStatus === "approved";

// 	const content = (
// 		<div className="space-y-4">
// 			<div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex gap-3">
// 				<ShieldCheck size={20} className="text-yellow-500 shrink-0 mt-0.5" />
// 				<div>
// 					<p className="font-bold text-sm mb-1">
// 						{canSkipDeposit
// 							? "Аренда без залога 🎉"
// 							: "Залог при получении техники"}
// 					</p>
// 					<p className="text-muted-foreground text-sm">
// 						{canSkipDeposit
// 							? "Ваш профиль верифицирован — залог не нужен."
// 							: "При выдаче потребуется залог:"}
// 					</p>
// 					{!canSkipDeposit && (
// 						<p className="text-3xl font-black text-yellow-500 mt-1">
// 							{deposit.toLocaleString("ru")} ₽
// 						</p>
// 					)}
// 					<p className="text-[11px] text-muted-foreground mt-1">
// 						{canSkipDeposit
// 							? "Спасибо за доверие!"
// 							: "Возвращается при сдаче техники в целости"}
// 					</p>
// 				</div>
// 			</div>
// 			{!canSkipDeposit && (
// 				<div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
// 					<ApplicationStatusBadge variant="full" />
// 				</div>
// 			)}
// 			<div className="flex gap-3">
// 				<Button
// 					variant="outline"
// 					onClick={() => onOpenChange(false)}
// 					className="flex-1 rounded-2xl"
// 				>
// 					Отмена
// 				</Button>
// 				<Button
// 					onClick={onConfirm}
// 					disabled={pending}
// 					className="flex-1 rounded-2xl font-black"
// 				>
// 					{pending ? (
// 						<Loader2 className="animate-spin" size={16} />
// 					) : (
// 						<>
// 							<CheckCircle2 size={15} className="mr-1.5" />
// 							{canSkipDeposit ? "Забронировать" : "Понятно, продолжить"}
// 						</>
// 					)}
// 				</Button>
// 			</div>
// 		</div>
// 	);

// 	const title = "Подтверждение брони";
// 	const desc = canSkipDeposit
// 		? "Всё готово — подтвердите бронирование"
// 		: "Ознакомьтесь с условиями аренды";

// 	if (isDesktop)
// 		return (
// 			<Dialog open={open} onOpenChange={onOpenChange}>
// 				<DialogContent className="sm:max-w-105 rounded-3xl border-white/10">
// 					<DialogHeader>
// 						<DialogTitle className="text-xl font-black uppercase italic">
// 							{title}
// 						</DialogTitle>
// 						<DialogDescription>{desc}</DialogDescription>
// 					</DialogHeader>
// 					{content}
// 				</DialogContent>
// 			</Dialog>
// 		);

// 	return (
// 		<Drawer open={open} onOpenChange={onOpenChange}>
// 			<DrawerContent className="px-4 pb-8">
// 				<DrawerHeader className="text-left px-0 pt-6">
// 					<DrawerTitle className="text-xl font-black uppercase italic">
// 						{title}
// 					</DrawerTitle>
// 					<DrawerDescription>{desc}</DrawerDescription>
// 				</DrawerHeader>
// 				{content}
// 			</DrawerContent>
// 		</Drawer>
// 	);
// }

// // ─── OrderRow — одна строка позиции с фото, счётчиком, ценой, ghost ───────────
// // Компактная — помещается в узкую колонку рядом с календарём.
// // На десктопе ширина ограничена доступным пространством, длинные
// // названия обрезаются. На мобиле — полная ширина.
// function OrderRow({
// 	item,
// 	isBusy,
// 	isChecking,
// 	hours,
// 	onAdd,
// 	onRemove,
// }: {
// 	item: CartItem;
// 	isBusy: boolean;
// 	isChecking: boolean;
// 	hours: number;
// 	onAdd: () => void;
// 	onRemove: () => void;
// }) {
// 	const isGhost = item.quantity === 0;
// 	const price =
// 		hours > 0
// 			? Math.round(
// 					calculateItemPrice(item.equipment, hours) * Math.max(item.quantity, 1)
// 				)
// 			: 0;

// 	return (
// 		<button
// 			type="button"
// 			onClick={isGhost ? onAdd : undefined}
// 			title={isGhost ? "Нажмите, чтобы вернуть в бронь" : undefined}
// 			className={cn(
// 				"flex items-center gap-2 py-1.5 px-2 rounded-xl transition-all w-full",
// 				isGhost
// 					? "opacity-35 cursor-pointer hover:opacity-60 hover:bg-primary/5"
// 					: "hover:bg-foreground/5",
// 				isBusy &&
// 					!isGhost &&
// 					"bg-amber-400/5 ring-1 ring-amber-400/25 ring-inset"
// 			)}
// 		>
// 			{/* Миниатюра */}
// 			<div className="w-7 h-7 rounded-lg overflow-hidden bg-foreground/10 relative shrink-0">
// 				<Image
// 					src={item.equipment.imageUrl || "/placeholder-equipment.png"}
// 					alt={item.equipment.title}
// 					fill
// 					className="object-cover"
// 				/>
// 			</div>

// 			{/* Название + статус — flex-1 + min-w-0 обрезает длинный текст */}
// 			<div className="flex-1 min-w-0">
// 				<p
// 					className={cn(
// 						"text-xs font-medium leading-tight truncate",
// 						isGhost ? "line-through opacity-50" : "text-foreground/80"
// 					)}
// 				>
// 					{item.equipment.title}
// 				</p>
// 				{isGhost && (
// 					<p className="text-[9px] text-primary/50 font-bold">
// 						нажать → вернуть
// 					</p>
// 				)}
// 				{isBusy && !isGhost && (
// 					<div className="flex items-center gap-1">
// 						<AlertCircle size={9} className="text-amber-400" />
// 						<span className="text-[9px] text-amber-400 font-bold">Занято</span>
// 					</div>
// 				)}
// 			</div>

// 			{/* Счётчик / ghost-плюс */}
// 			{isGhost ? (
// 				<Plus size={12} className="text-primary/40 shrink-0" />
// 			) : (
// 				<div className="flex items-center gap-1 shrink-0">
// 					<Button
// 						asChild
// 						variant="outline"
// 						size="icon"
// 						type="button"
// 						onClick={(e) => {
// 							e.stopPropagation();
// 							onRemove();
// 						}}
// 						className="p-1 w-5 h-5 rounded-full border border-foreground/15 flex items-center justify-center hover:bg-foreground/10 transition-colors"
// 					>
// 						{item.quantity === 1 ? (
// 							<X size={9} className="text-destructive" />
// 						) : (
// 							<Minus size={9} />
// 						)}
// 					</Button>
// 					<span className="text-xs font-black w-3.5 text-center">
// 						{item.quantity}
// 					</span>
// 					<Button
// 						asChild
// 						variant="outline"
// 						size="icon"
// 						onClick={(e) => {
// 							e.stopPropagation();
// 							onAdd();
// 						}}
// 						disabled={item.quantity >= (item.equipment.available_count ?? 99)}
// 						className={cn(
// 							"w-5 h-5 p-1 rounded-full border border-foreground/15 flex items-center justify-center hover:bg-foreground/10 transition-colors disabled:opacity-30",
// 							item.quantity >= (item.equipment.available_count ?? 99) &&
// 								"cursor-not-allowed opacity-30"
// 						)}
// 					>
// 						<Plus size={4} />
// 					</Button>
// 				</div>
// 			)}

// 			{/* Цена (только для активных) */}
// 			{!isGhost && (
// 				<div className="shrink-0 min-w-10 text-right">
// 					{isChecking ? (
// 						<div className="h-3 w-9 rounded bg-foreground/10 animate-pulse ml-auto" />
// 					) : (
// 						<span className="text-[11px] font-black text-primary italic">
// 							{price.toLocaleString("ru")}₽
// 						</span>
// 					)}
// 				</div>
// 			)}
// 		</button>
// 	);
// }

// // ─── OrderList ─────────────────────────────────────────────────────────────────
// // Десктоп: inline, h-full (растягивается на высоту родителя), скролл если много
// // Мобиль: Collapsible — можно свернуть чтобы сэкономить место
// function OrderList({
// 	items,
// 	hours,
// 	busyIds,
// 	isChecking,
// 	onAdd,
// 	onRemove,
// }: {
// 	items: CartItem[];
// 	hours: number;
// 	busyIds: string[];
// 	isChecking: boolean;
// 	onAdd: (eq: CartItem["equipment"]) => void;
// 	onRemove: (id: string) => void;
// }) {
// 	const [mobileOpen, setMobileOpen] = useState(true);
// 	const activeCount = items.filter((i) => i.quantity > 0).length;
// 	const hasAnyBusy = busyIds.some((id) =>
// 		items.find((i) => i.equipment.id === id && i.quantity > 0)
// 	);

// 	// Заголовок строки с количеством + индикатор проверки
// 	const header = (
// 		<div className="flex items-center gap-1.5">
// 			<span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">
// 				Техника
// 			</span>
// 			<span className="text-primary font-black text-sm leading-none">
// 				{activeCount}
// 			</span>
// 			{isChecking && (
// 				<span
// 					className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0"
// 					title="Проверяем доступность…"
// 				/>
// 			)}
// 		</div>
// 	);

// 	// Общий контент списка (используется и на desktop, и внутри Collapsible)
// 	const listContent = (
// 		<div className="space-y-0.5 w-full">
// 			{items.length === 0 ? (
// 				<p className="text-xs text-muted-foreground/30 text-center py-6">
// 					Нет позиций
// 				</p>
// 			) : (
// 				items.map((item) => (
// 					<OrderRow
// 						key={item.equipment.id}
// 						item={item}
// 						isBusy={busyIds.includes(item.equipment.id)}
// 						isChecking={isChecking}
// 						hours={hours}
// 						onAdd={() => onAdd(item.equipment)}
// 						onRemove={() => onRemove(item.equipment.id)}
// 					/>
// 				))
// 			)}

// 			{/* Плашка занятых */}
// 			{hasAnyBusy && !isChecking && (
// 				<div className="mt-1.5 p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center gap-2">
// 					<AlertCircle size={10} className="text-amber-400 shrink-0" />
// 					<p className="text-[10px] font-bold text-amber-400">
// 						{busyIds.length} {formatPlural(busyIds.length, "items")} недоступно
// 					</p>
// 				</div>
// 			)}
// 		</div>
// 	);

// 	return (
// 		<>
// 			{/* ── Десктоп: всегда открыт, фиксированная высота = родитель ── */}
// 			<div className="hidden md:flex flex-col h-full">
// 				<div className="mb-1.5 shrink-0">{header}</div>
// 				{/* overflow-y-auto: скролл если позиций много */}
// 				<div className="overflow-y-auto flex-1 no-scrollbar">{listContent}</div>
// 			</div>

// 			{/* ── Мобиль: Collapsible ── */}
// 			<Collapsible
// 				open={mobileOpen}
// 				onOpenChange={setMobileOpen}
// 				className="md:hidden w-full"
// 			>
// 				<CollapsibleTrigger asChild>
// 					<Button
// 						variant="ghost"
// 						type="button"
// 						className="flex items-center justify-between w-full py-2.5 px-1 text-left"
// 					>
// 						{header}
// 						<ChevronDown
// 							size={13}
// 							className={cn(
// 								"rounded-xl text-muted-foreground transition-transform duration-200",
// 								mobileOpen && "rotate-180"
// 							)}
// 						/>
// 					</Button>
// 				</CollapsibleTrigger>
// 				<CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
// 					<div className="pb-2">{listContent}</div>
// 				</CollapsibleContent>
// 			</Collapsible>
// 		</>
// 	);
// }

// // ─── SummaryRow ───────────────────────────────────────────────────────────────
// function SummaryRow({
// 	label,
// 	value,
// 	isYellow,
// 	color,
// }: {
// 	label: string;
// 	value: React.ReactNode;
// 	isYellow?: boolean;
// 	color?: string;
// }) {
// 	return (
// 		<div className="flex justify-between items-center">
// 			<span className="text-xs font-bold uppercase opacity-40">{label}</span>
// 			<div className="flex-1 border-b border-dotted border-foreground/10 mx-3 mb-1" />
// 			<span
// 				className={cn(
// 					"text-sm font-black italic",
// 					isYellow ? "text-yellow-500" : color || "text-foreground"
// 				)}
// 			>
// 				{value}
// 			</span>
// 		</div>
// 	);
// }

// // ─── Основная страница ────────────────────────────────────────────────────────
// export default function CheckoutPage() {
// 	const router = useRouter();
// 	const { items, addItem, removeOne, clearCart } = useCartStore();
// 	const { user } = useAuth();
// 	const applicationStatus = useApplicationStore((s) => s.status);

// 	const [isSubmitting, setIsSubmitting] = useState(false);
// 	const [isChecking, setIsChecking] = useState(false);
// 	const [busyIds, setBusyIds] = useState<string[]>([]);
// 	const [showAuth, setShowAuth] = useState(false);
// 	const [showDeposit, setShowDeposit] = useState(false);
// 	// true → показываем SuccessScreen вместо пустой корзины
// 	const [bookingDone, setBookingDone] = useState(false);

// 	const defaultStart = useMemo(() => {
// 		const d = addHours(startOfHour(new Date()), 1);
// 		const h = d.getHours();
// 		if (h < WORK_START) d.setHours(WORK_START, 0, 0, 0);
// 		if (h >= WORK_END) {
// 			d.setDate(d.getDate() + 1);
// 			d.setHours(WORK_START, 0, 0, 0);
// 		}
// 		return d;
// 	}, []);
// 	const defaultEnd = useMemo(() => addHours(defaultStart, 4), [defaultStart]);

// 	const [date, setDate] = useState<DateRange | undefined>({
// 		from: defaultStart,
// 		to: defaultEnd,
// 	});
// 	const [startTime, setStartTime] = useState(
// 		clampTime(format(defaultStart, "HH:mm"))
// 	);
// 	const [endTime, setEndTime] = useState(
// 		clampTime(format(defaultEnd, "HH:mm"))
// 	);

// 	const math = useMemo(() => {
// 		const empty = {
// 			totalRental: 0,
// 			days: 0,
// 			hours: 0,
// 			totalDeposit: 0,
// 			totalRV: 0,
// 			startFull: null as Date | null,
// 			endFull: null as Date | null,
// 		};
// 		if (!date?.from || !date?.to) return empty;
// 		const start = combineDateAndTime(date.from, startTime);
// 		const end = combineDateAndTime(date.to, endTime);
// 		if (!start || !end) return empty;
// 		const ms = end.getTime() - start.getTime();
// 		const totalHours = Math.max(0, ms / (1000 * 60 * 60));
// 		const active = items.filter((i) => i.quantity > 0);
// 		return {
// 			totalRental: active.reduce(
// 				(s, i) => s + calculateItemPrice(i.equipment, totalHours) * i.quantity,
// 				0
// 			),
// 			totalDeposit: active.reduce(
// 				(s, i) => s + (i.equipment.deposit || 0) * i.quantity,
// 				0
// 			),
// 			totalRV: active.reduce(
// 				(s, i) => s + (i.equipment.replacement_value || 0) * i.quantity,
// 				0
// 			),
// 			hours: totalHours,
// 			days: Math.floor(totalHours / 24),
// 			startFull: start,
// 			endFull: end,
// 		};
// 	}, [date, startTime, endTime, items]);

// 	// Фоновая проверка доступности (NProgress — toploader)
// 	useEffect(() => {
// 		let cancelled = false;
// 		async function check() {
// 			const ids = items
// 				.filter((i) => i.quantity > 0)
// 				.map((i) => i.equipment.id);
// 			if (!math.startFull || !math.endFull || ids.length === 0) {
// 				setBusyIds([]);
// 				return;
// 			}
// 			setIsChecking(true);
// 			NProgress.start();
// 			try {
// 				const r = await checkAvailabilityAction(
// 					ids,
// 					math.startFull.toISOString(),
// 					math.endFull.toISOString()
// 				);
// 				if (!cancelled) setBusyIds(r.busyIds ?? []);
// 			} finally {
// 				if (!cancelled) {
// 					setIsChecking(false);
// 					NProgress.done();
// 				}
// 			}
// 		}
// 		check();
// 		return () => {
// 			cancelled = true;
// 		};
// 	}, [math.startFull, math.endFull, items]);

// 	const activeItems = items.filter((i) => i.quantity > 0);
// 	const hasAnyBusy = busyIds.length > 0;
// 	const isCanBook =
// 		math.totalRental > 0 && !hasAnyBusy && !!math.startFull && !!math.endFull;
// 	const isLoggedIn = !!user;

// 	const handleBookClick = () => {
// 		if (!isCanBook) return;
// 		if (!isLoggedIn) {
// 			setShowAuth(true);
// 			return;
// 		}
// 		setShowDeposit(true);
// 	};

// 	const handleConfirm = async () => {
// 		if (!isCanBook || !math.startFull || !math.endFull) return;
// 		setIsSubmitting(true);
// 		try {
// 			const r = await createBookingAction({
// 				items: activeItems.map((i) => ({
// 					id: i.equipment.id,
// 					price_to_pay: calculateItemPrice(i.equipment, math.hours),
// 					quantity: i.quantity,
// 				})),
// 				startDate: math.startFull.toISOString(),
// 				endDate: math.endFull.toISOString(),
// 				totalPrice: math.totalRental,
// 				hasInsurance: true,
// 				totalReplacementValue: math.totalRV,
// 			});
// 			if (r.success) {
// 				setShowDeposit(false);
// 				clearCart();
// 				// Показываем Success-экран, он сам сделает redirect через 2с
// 				setBookingDone(true);
// 			} else {
// 				toast.error(r.error || "Ошибка брони");
// 			}
// 		} catch {
// 			toast.error("Непредвиденная ошибка");
// 		} finally {
// 			setIsSubmitting(false);
// 		}
// 	};

// 	const durationLabel = useMemo(() => {
// 		const d = math.days;
// 		const remH = Math.round(math.hours % 24);
// 		const parts: string[] = [];
// 		if (d > 0) parts.push(formatPlural(d, "days"));
// 		if (remH > 0) parts.push(`${remH} ч.`);
// 		return parts.join(" ") || "—";
// 	}, [math]);

// 	// ── SuccessScreen: заменяет страницу после успешного бронирования ─────────
// 	if (bookingDone) {
// 		return (
// 			<SuccessScreen
// 				title="Заказ оформлен!"
// 				description="Переходим в личный кабинет…"
// 				redirectTo="/dashboard"
// 				delay={2000}
// 			/>
// 		);
// 	}

// 	// ── Пустая корзина (без брони) ────────────────────────────────────────────
// 	if (items.length === 0) {
// 		return (
// 			<div className="container mx-auto py-40 text-center space-y-6">
// 				<h1 className="text-6xl font-black uppercase italic opacity-10">
// 					Пусто
// 				</h1>
// 				<Button
// 					onClick={() => router.push("/equipment")}
// 					variant="outline"
// 					className="rounded-full"
// 				>
// 					Вернуться в каталог
// 				</Button>
// 			</div>
// 		);
// 	}

// 	// ── Общая кнопка бронирования (desktop → внутри карточки, mobile → FAB) ──
// 	const bookButton = (
// 		<Button
// 			className={cn(
// 				"inline-flex items-center justify-center gap-2",
// 				"w-full h-14 rounded-2xl text-base font-black uppercase italic shadow-md",
// 				"bg-primary text-primary-foreground duration-300",
// 				"hover:scale-[1.01] active:scale-95 transition-all will-change-transform",
// 				"whitespace-nowrap overflow-hidden"
// 			)}
// 			onClick={handleBookClick}
// 			disabled={!isCanBook || isSubmitting}
// 		>
// 			{isSubmitting ? (
// 				<RainbowSpinner size={16} />
// 			) : !isLoggedIn ? (
// 				<>
// 					<Lock size={14} className="mr-2" />
// 					Войти и забронировать
// 				</>
// 			) : (
// 				<>
// 					Забронировать <ArrowRight className="ml-2" size={16} />
// 				</>
// 			)}
// 		</Button>
// 	);

// 	return (
// 		<div className="min-h-screen pb-28 md:pb-20">
// 			<div className="container mx-auto px-4 lg:px-6 pt-8">
// 				<div className="flex-col gap-2 mb-8">
// 					<h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none ">
// 						Оформление{" "}
// 					</h1>
// 					<span className="pl-2 text-primary text-md not-italic">
// 						{formatPlural(activeItems.length, "items")}
// 					</span>
// 				</div>

// 				<div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:items-stretch">
// 					{/* ── ЛЕВАЯ СЕКЦИЯ: Период аренды + Список позиций ────── */}
// 					<section className="relative glass-card bg-muted-foreground/10 lg:col-span-3 p-4 md:p-6 rounded-[2rem] border border-white/10 backdrop-blur-3xl flex flex-col">
// 						{/* Заголовки колонок (только desktop — в одну строку) */}
// 						<div className="hidden md:flex items-end gap-4 mb-4 shrink-0">
// 							{/* Ширина левой подколонки (календарь) — w-auto, задаётся самим календарём */}
// 							<div className="shrink-0">
// 								<div className="flex items-center gap-2 text-primary">
// 									<Package size={13} />
// 									<h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-50">
// 										Период аренды
// 									</h3>
// 								</div>
// 							</div>
// 							{/* Заголовок правой подколонки (техника) */}
// 							<div className="flex-1 flex items-center gap-2 text-primary">
// 								<List size={13} />
// 								<h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-50">
// 									Список техники
// 								</h3>
// 							</div>
// 						</div>

// 						{/* Мобильный заголовок */}
// 						<div className="md:hidden flex items-center gap-2 text-primary mb-3 shrink-0">
// 							<Package size={13} />
// 							<h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-50">
// 								Детали заказа
// 							</h3>
// 						</div>

// 						{/*
// 							Двухколоночный layout внутри левой секции.
// 							• md:flex-row — рядом: [календарь + время | список позиций]
// 							• flex-col — стопкой: [календарь + время] [список позиций (collapsible)]
// 							flex-1 + min-h-0 нужны чтобы дочерние flex-1 корректно растягивались.
// 						*/}
// 						<div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 min-h-0">
// 							{/* Подколонка: Календарь + Время (ширина = auto по содержимому) */}
// 							<div className="md:w-auto shrink-0">
// 								<div className="rounded-xl overflow-hidden bg-foreground/10 border border-white/10 w-fit mx-auto">
// 									<Calendar
// 										mode="range"
// 										captionLayout="dropdown"
// 										selected={date}
// 										onSelect={setDate}
// 										modifiersClassNames={{
// 											booked: "[&>button]:line-through opacity-100",
// 										}}
// 										locale={ru}
// 										disabled={(d) =>
// 											d < new Date(new Date().setHours(0, 0, 0, 0))
// 										}
// 										className="p-3"
// 									/>
// 									{/* Время — прямо под календарём в том же блоке */}
// 									<div className="flex gap-2 p-2 pt-0">
// 										<TimeInput
// 											label="Начало"
// 											value={startTime}
// 											onChange={(v) => setStartTime(clampTime(v))}
// 										/>
// 										<TimeInput
// 											label="Конец"
// 											value={endTime}
// 											onChange={(v) => setEndTime(clampTime(v))}
// 										/>
// 									</div>
// 								</div>
// 							</div>

// 							{/*
// 								Подколонка: Список позиций
// 								• md: flex-1 + min-w-0 → занимает всё оставшееся место, длинные
// 								  названия обрезаются (truncate внутри OrderRow)
// 								• < md: w-full, тянется на всю ширину внутри Collapsible
// 							*/}
// 							<div className="flex-1 min-w-0 min-h-0 flex flex-col">
// 								<OrderList
// 									items={items}
// 									hours={math.hours}
// 									busyIds={busyIds}
// 									isChecking={isChecking}
// 									onAdd={(eq) => addItem(eq)}
// 									onRemove={(id) => removeOne(id)}
// 								/>
// 							</div>
// 						</div>

// 						<p className="relative text-[9px] px-5 py-0.5 text-muted-foreground/50 font-bold uppercase flex items-center gap-1 mt-2 md:mt-4 rounded-xl bg-background/50 shadow-inset w-full justify-center text-center z-10 backdrop-blur-2xl">
// 							Забрать или вернуть заказ можно в любой день с {WORK_START}
// 							:00 · до {WORK_END}:00
// 						</p>
// 					</section>

// 					{/* ── ПРАВАЯ СЕКЦИЯ: Сверка и кнопка ─────────────────── */}
// 					<section className="h-full glass-card bg-muted-foreground/10 lg:col-span-2 p-5 rounded-[2rem] border border-white/10 backdrop-blur-3xl flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
// 						<div className="flex items-center gap-2 text-primary">
// 							<CheckLine size={13} />
// 							<h3 className="text-[10px] font-black uppercase italic tracking-widest opacity-50">
// 								Сверка
// 							</h3>
// 						</div>

// 						{/* Даты */}
// 						<div className="space-y-2">
// 							{date?.from && date?.to ? (
// 								<>
// 									<SummaryRow
// 										label="Начало аренды"
// 										value={`${format(date.from, "d MMM", { locale: ru })} · ${startTime}`}
// 									/>
// 									<Separator className="bg-foreground/0 my-1!" />
// 									<SummaryRow
// 										label="Конец аренды"
// 										value={`${format(date.to, "d MMM", { locale: ru })} · ${endTime}`}
// 									/>
// 								</>
// 							) : (
// 								<div className="p-4 rounded-2xl bg-background/50 border border-white/5 flex items-center justify-center">
// 									<p className="text-xs text-muted-foreground">Выберите даты</p>
// 								</div>
// 							)}
// 						</div>

// 						<Separator className="bg-foreground/8" />

// 						{/* Стоимость */}
// 						<div className="space-y-2">
// 							<SummaryRow label="Время" value={durationLabel} />
// 							<Separator className="bg-foreground/0 my-1!" />
// 							<SummaryRow
// 								label="Аренда"
// 								value={`${Math.round(math.totalRental).toLocaleString("ru")}₽`}
// 							/>
// 							<Separator className="bg-foreground/0 my-1!" />
// 							<SummaryRow label="Страховка" value="0₽" color="text-green-400" />
// 							{math.totalDeposit > 0 && (
// 								<SummaryRow
// 									label="Залог"
// 									value={`${math.totalDeposit.toLocaleString("ru")}₽`}
// 									isYellow
// 								/>
// 							)}
// 						</div>

// 						<div className="my-4">
// 							<div className="flex justify-between items-end space-y-2">
// 								<span className="text-[10px] uppercase font-black opacity-40">
// 									К оплате
// 								</span>
// 								<span className="text-4xl font-black italic text-primary tracking-tighter">
// 									{Math.round(math.totalRental).toLocaleString("ru")}₽
// 								</span>
// 							</div>
// 						</div>
// 						{/* Кнопка — только на desktop (на mobile — FAB ниже) */}
// 						<div className="hidden md:block">{bookButton}</div>

// 						{isChecking && !hasAnyBusy && (
// 							<p className="text-[10px] text-muted-foreground/35 text-center font-bold uppercase flex items-center justify-center gap-1.5">
// 								<span className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
// 								Проверяем доступность…
// 							</p>
// 						)}
// 					</section>
// 				</div>
// 			</div>

// 			{/* ── МОБИЛЬНЫЙ FAB — кнопка бронирования ─────────────────── */}
// 			<div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/85 backdrop-blur-xl border-t border-foreground/10 overflow-hidden">
// 				<div className="w-full px-4 py-3 box-border">
// 					{/* <div className="md:hidden fixed bottom-0 inset-x-0 z-50 px-4 py-3 bg-background/85 backdrop-blur-xl border-t border-white/10 "> */}
// 					{bookButton}
// 					{isChecking && !hasAnyBusy && (
// 						<p className="text-[9px] text-muted-foreground/30 text-center font-bold uppercase flex items-center justify-center gap-1 mt-1.5">
// 							<span className="w-1 h-1 rounded-full bg-primary/30 animate-pulse" />
// 							Проверяем доступность…
// 						</p>
// 					)}
// 				</div>
// 			</div>

// 			{/* Диалоги */}
// 			<AuthModal
// 				open={showAuth}
// 				onOpenChange={setShowAuth}
// 				onSuccess={() => setShowDeposit(true)}
// 			/>
// 			<DepositModal
// 				open={showDeposit}
// 				onOpenChange={setShowDeposit}
// 				deposit={math.totalDeposit}
// 				onConfirm={handleConfirm}
// 				pending={isSubmitting}
// 				applicationStatus={applicationStatus}
// 			/>
// 		</div>
// 	);
// }
