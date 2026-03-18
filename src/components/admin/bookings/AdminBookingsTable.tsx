"use client";

import {
	Ban,
	Calendar,
	ChevronDown,
	ChevronsUpDown,
	ChevronUp,
	Clock,
	Download,
	Eye,
	Filter,
	MoreVertical,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatusAction } from "@/actions/booking-actions";
import {
	Badge,
	Button,
	Card,
	CardContent,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Input,
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
} from "@/components/ui";
import { BOOKING_STATUS_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

export interface AdminBookingRow {
	id: string;
	status: BookingStatus;
	totalAmount: number;
	createdAt: string;
	startDate: string;
	endDate: string;
	insuranceIncluded: boolean | null;
	totalReplacementValue: number | null;
	cancellationReason: string | null;
	cancelledAt: string | null;
	// Joined
	clientName: string | null;
	clientEmail: string | null;
	equipmentTitles: string[];
	itemCount: number;
}

// Allowed status transitions for admin
const NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
	PENDING_REVIEW: ["WAIT_PAYMENT", "READY_TO_RENT", "CANCELLED"],
	WAIT_PAYMENT: ["READY_TO_RENT", "CANCELLED"],
	READY_TO_RENT: ["ACTIVE", "CANCELLED"],
	ACTIVE: ["COMPLETED"],
	COMPLETED: [],
	CANCELLED: [],
	EXPIRED: ["PENDING_REVIEW", "CANCELLED"],
};

function StatusBadge({ status }: { status: BookingStatus }) {
	const cfg = BOOKING_STATUS_CONFIG[status] ?? {
		label: status,
		color: "bg-foreground/8 text-foreground/50",
		dot: "bg-foreground/30",
	};
	return (
		<Badge
			variant="outline"
			className={cn("text-[10px] gap-1.5 border font-semibold", cfg.color)}
		>
			<span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
			{cfg.label}
		</Badge>
	);
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortField = "createdAt" | "startDate" | "totalAmount" | "status";
type SortDir = "asc" | "desc";

function SortIcon({
	field,
	active,
	dir,
}: {
	field: SortField;
	active: SortField;
	dir: SortDir;
}) {
	if (field !== active)
		return <ChevronsUpDown size={12} className="opacity-30" />;
	return dir === "asc" ? (
		<ChevronUp size={12} className="text-primary" />
	) : (
		<ChevronDown size={12} className="text-primary" />
	);
}

// ─── Booking detail drawer ────────────────────────────────────────────────────

function BookingDetailPanel({
	booking,
	onClose,
	onStatusUpdate,
}: {
	booking: AdminBookingRow;
	onClose: () => void;
	onStatusUpdate: (id: string, status: BookingStatus) => void;
}) {
	const [isPending, startTransition] = useTransition();
	const nextStatuses = NEXT_STATUSES[booking.status] ?? [];

	const handleStatusChange = (newStatus: BookingStatus) => {
		startTransition(async () => {
			const r = await updateBookingStatusAction(booking.id, newStatus);
			if (r.success) {
				onStatusUpdate(booking.id, newStatus);
				toast.success(`Статус → ${BOOKING_STATUS_CONFIG[newStatus].label}`);
			} else {
				toast.error(r.error ?? "Ошибка обновления статуса");
			}
		});
	};

	const startDate = new Date(booking.startDate).toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
	const endDate = new Date(booking.endDate).toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

	return (
		<div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-foreground/8 shadow-2xl z-50 flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-foreground/8">
				<div>
					<p className="font-bold text-sm">Бронирование</p>
					<p className="text-xs text-muted-foreground font-mono">
						{booking.id.slice(0, 8)}…
					</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="p-1.5 rounded-lg hover:bg-foreground/8"
				>
					<X size={15} />
				</button>
			</div>

			<div className="flex-1 overflow-y-auto divide-y divide-foreground/5">
				{/* Status */}
				<div className="p-4 space-y-3">
					<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Статус
					</p>
					<StatusBadge status={booking.status} />
					{nextStatuses.length > 0 && (
						<div className="space-y-1.5 pt-1">
							<p className="text-xs text-muted-foreground">Перевести в:</p>
							<div className="flex flex-wrap gap-1.5">
								{nextStatuses.map((s) => (
									<button
										key={s}
										type="button"
										disabled={isPending}
										onClick={() => handleStatusChange(s)}
										className={cn(
											"text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors",
											BOOKING_STATUS_CONFIG[s].color,
											"hover:opacity-80 disabled:opacity-40"
										)}
									>
										{BOOKING_STATUS_CONFIG[s].label}
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Client */}
				<div className="p-4 space-y-1">
					<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Клиент
					</p>
					<p className="font-semibold text-sm">
						{booking.clientName || "Без имени"}
					</p>
					<p className="text-xs text-muted-foreground">
						{booking.clientEmail || "—"}
					</p>
				</div>

				{/* Dates */}
				<div className="p-4 space-y-1">
					<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Период
					</p>
					<p className="text-sm font-semibold flex items-center gap-2">
						<Calendar size={13} className="text-muted-foreground" />
						{startDate} — {endDate}
					</p>
				</div>

				{/* Equipment */}
				<div className="p-4 space-y-2">
					<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Техника ({booking.itemCount} позиций)
					</p>
					<div className="space-y-1">
						{booking.equipmentTitles.map((title, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static list
							<p key={i} className="text-sm text-foreground/80 truncate">
								{title}
							</p>
						))}
					</div>
				</div>

				{/* Financial */}
				<div className="p-4 space-y-2">
					<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Финансы
					</p>
					<div className="space-y-1">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Сумма аренды</span>
							<span className="font-bold">
								{booking.totalAmount.toLocaleString("ru-RU")} ₽
							</span>
						</div>
						{booking.totalReplacementValue ? (
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">
									Залог (стоимость замены)
								</span>
								<span className="font-bold">
									{booking.totalReplacementValue.toLocaleString("ru-RU")} ₽
								</span>
							</div>
						) : null}
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Страховка</span>
							<span
								className={cn(
									"font-bold text-xs",
									booking.insuranceIncluded
										? "text-green-400"
										: "text-muted-foreground"
								)}
							>
								{booking.insuranceIncluded ? "Включена" : "Нет"}
							</span>
						</div>
					</div>
				</div>

				{/* Cancellation */}
				{booking.cancellationReason && (
					<div className="p-4 space-y-1">
						<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
							<Ban size={10} /> Причина отмены
						</p>
						<p className="text-sm text-foreground/70">
							{booking.cancellationReason}
						</p>
					</div>
				)}

				{/* Meta */}
				<div className="p-4 space-y-1">
					<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
						<Clock size={10} /> Создан
					</p>
					<p className="text-xs text-muted-foreground">
						{new Date(booking.createdAt).toLocaleString("ru-RU")}
					</p>
				</div>
			</div>
		</div>
	);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminBookingsTable({
	initialBookings,
}: {
	initialBookings: AdminBookingRow[];
}) {
	const [bookings, setBookings] = useState(initialBookings);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>(
		"all"
	);
	const [sortField, setSortField] = useState<SortField>("createdAt");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
	const [activeBooking, setActiveBooking] = useState<AdminBookingRow | null>(
		null
	);
	const [showFilters, setShowFilters] = useState(false);
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDir("desc");
		}
	};

	const handleStatusUpdate = useCallback(
		(id: string, status: BookingStatus) => {
			setBookings((prev) =>
				prev.map((b) => (b.id === id ? { ...b, status } : b))
			);
			if (activeBooking?.id === id) {
				setActiveBooking((b) => (b ? { ...b, status } : b));
			}
		},
		[activeBooking]
	);

	const handleExport = () => {
		const rows = [
			[
				"ID",
				"Клиент",
				"Email",
				"Статус",
				"Сумма",
				"Начало",
				"Конец",
				"Техника",
			],
			...filtered.map((b) => [
				b.id,
				b.clientName ?? "",
				b.clientEmail ?? "",
				BOOKING_STATUS_CONFIG[b.status]?.label ?? b.status,
				b.totalAmount,
				b.startDate,
				b.endDate,
				b.equipmentTitles.join("; "),
			]),
		];
		const csv = rows.map((r) => r.join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success("CSV экспортирован");
	};

	// ── Filter + sort ──────────────────────────────────────────────────────────
	const filtered = bookings
		.filter((b) => {
			if (statusFilter !== "all" && b.status !== statusFilter) return false;
			if (search) {
				const q = search.toLowerCase();
				const matchesClient =
					b.clientName?.toLowerCase().includes(q) ||
					b.clientEmail?.toLowerCase().includes(q);
				const matchesEquipment = b.equipmentTitles.some((t) =>
					t.toLowerCase().includes(q)
				);
				const matchesId = b.id.toLowerCase().includes(q);
				if (!matchesClient && !matchesEquipment && !matchesId) return false;
			}
			if (dateFrom && new Date(b.startDate) < new Date(dateFrom)) return false;
			if (dateTo && new Date(b.endDate) > new Date(dateTo)) return false;
			return true;
		})
		.sort((a, b) => {
			let cmp = 0;
			if (sortField === "totalAmount") {
				cmp = a.totalAmount - b.totalAmount;
			} else if (sortField === "status") {
				cmp = a.status.localeCompare(b.status);
			} else {
				cmp =
					new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
			}
			return sortDir === "asc" ? cmp : -cmp;
		});

	const totalAmount = filtered.reduce((s, b) => s + b.totalAmount, 0);
	const pendingCount = filtered.filter(
		(b) => b.status === "PENDING_REVIEW"
	).length;

	return (
		<div className="space-y-4">
			{/* Controls */}
			<Card>
				<CardContent className="p-3">
					<div className="flex flex-col sm:flex-row gap-3">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
							<Input
								placeholder="Поиск по клиенту, технике, ID..."
								className="pl-9 h-9"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>

						{/* Status filter */}
						<Select
							value={statusFilter}
							onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
						>
							<SelectTrigger className="h-9 w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Все статусы</SelectItem>
								{(Object.keys(BOOKING_STATUS_CONFIG) as BookingStatus[]).map(
									(s) => (
										<SelectItem key={s} value={s}>
											{BOOKING_STATUS_CONFIG[s].label}
										</SelectItem>
									)
								)}
							</SelectContent>
						</Select>

						{/* Filter toggle */}
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-2"
							onClick={() => setShowFilters((v) => !v)}
						>
							<Filter size={13} />
							Фильтры
							{(dateFrom || dateTo) && (
								<span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center">
									!
								</span>
							)}
						</Button>

						{/* Export */}
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-2"
							onClick={handleExport}
						>
							<Download size={13} />
							CSV
						</Button>
					</div>

					{/* Extended filters */}
					{showFilters && (
						<div className="mt-3 pt-3 border-t border-foreground/5 flex flex-wrap gap-3 items-end">
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground font-medium">
									Дата начала аренды от
								</p>
								<Input
									type="date"
									className="h-8 text-xs w-40"
									value={dateFrom}
									onChange={(e) => setDateFrom(e.target.value)}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground font-medium">до</p>
								<Input
									type="date"
									className="h-8 text-xs w-40"
									value={dateTo}
									onChange={(e) => setDateTo(e.target.value)}
								/>
							</div>
							{(dateFrom || dateTo) && (
								<Button
									variant="ghost"
									size="sm"
									className="h-8 text-xs text-muted-foreground gap-1"
									onClick={() => {
										setDateFrom("");
										setDateTo("");
									}}
								>
									<X size={11} /> Сбросить даты
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Summary strip */}
			<div className="flex items-center gap-4 text-sm text-muted-foreground px-1">
				<span>
					Найдено:{" "}
					<strong className="text-foreground">{filtered.length}</strong>
				</span>
				{pendingCount > 0 && (
					<span className="text-amber-400 font-medium flex items-center gap-1">
						<Clock size={12} /> {pendingCount} ожидает проверки
					</span>
				)}
				<span className="ml-auto font-bold text-foreground">
					{totalAmount.toLocaleString("ru-RU")} ₽
				</span>
			</div>

			{/* Table */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow className="border-foreground/5">
							<TableHead
								className="cursor-pointer select-none hover:text-foreground transition-colors"
								onClick={() => handleSort("createdAt")}
							>
								<span className="flex items-center gap-1">
									Дата{" "}
									<SortIcon
										field="createdAt"
										active={sortField}
										dir={sortDir}
									/>
								</span>
							</TableHead>
							<TableHead>Клиент</TableHead>
							<TableHead>Техника</TableHead>
							<TableHead
								className="cursor-pointer select-none hover:text-foreground transition-colors"
								onClick={() => handleSort("startDate")}
							>
								<span className="flex items-center gap-1">
									Период{" "}
									<SortIcon
										field="startDate"
										active={sortField}
										dir={sortDir}
									/>
								</span>
							</TableHead>
							<TableHead
								className="cursor-pointer select-none hover:text-foreground transition-colors"
								onClick={() => handleSort("totalAmount")}
							>
								<span className="flex items-center gap-1">
									Сумма{" "}
									<SortIcon
										field="totalAmount"
										active={sortField}
										dir={sortDir}
									/>
								</span>
							</TableHead>
							<TableHead
								className="cursor-pointer select-none hover:text-foreground transition-colors"
								onClick={() => handleSort("status")}
							>
								<span className="flex items-center gap-1">
									Статус{" "}
									<SortIcon field="status" active={sortField} dir={sortDir} />
								</span>
							</TableHead>
							<TableHead className="text-right">Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.map((booking) => {
							const createdDate = new Date(
								booking.createdAt
							).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
							const startDate = new Date(booking.startDate).toLocaleDateString(
								"ru-RU",
								{ day: "numeric", month: "short" }
							);
							const endDate = new Date(booking.endDate).toLocaleDateString(
								"ru-RU",
								{
									day: "numeric",
									month: "short",
								}
							);

							return (
								<TableRow
									key={booking.id}
									className={cn(
										"border-foreground/5 cursor-pointer hover:bg-foreground/3 transition-colors",
										activeBooking?.id === booking.id && "bg-foreground/5"
									)}
									onClick={() => setActiveBooking(booking)}
								>
									<TableCell className="text-xs text-muted-foreground whitespace-nowrap">
										{createdDate}
									</TableCell>
									<TableCell>
										<p className="text-sm font-medium truncate max-w-32">
											{booking.clientName || "Без имени"}
										</p>
										<p className="text-[11px] text-muted-foreground truncate max-w-32">
											{booking.clientEmail || "—"}
										</p>
									</TableCell>
									<TableCell>
										<p className="text-sm truncate max-w-36 text-muted-foreground">
											{booking.equipmentTitles[0] ?? "—"}
										</p>
										{booking.itemCount > 1 && (
											<p className="text-[10px] text-muted-foreground/60">
												+{booking.itemCount - 1} поз.
											</p>
										)}
									</TableCell>
									<TableCell className="text-xs text-muted-foreground whitespace-nowrap">
										{startDate} — {endDate}
									</TableCell>
									<TableCell className="font-bold text-sm whitespace-nowrap">
										{booking.totalAmount.toLocaleString("ru-RU")} ₽
									</TableCell>
									<TableCell>
										<StatusBadge status={booking.status} />
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
												<DropdownMenuItem
													onClick={() => setActiveBooking(booking)}
												>
													<Eye className="w-4 h-4 mr-2" /> Подробнее
												</DropdownMenuItem>
												{(NEXT_STATUSES[booking.status] ?? []).length > 0 && (
													<>
														<DropdownMenuSeparator />
														{(NEXT_STATUSES[booking.status] ?? []).map((s) => (
															<DropdownMenuItem
																key={s}
																onClick={async () => {
																	const r = await updateBookingStatusAction(
																		booking.id,
																		s
																	);
																	if (r.success) {
																		handleStatusUpdate(booking.id, s);
																		toast.success(
																			`Статус → ${BOOKING_STATUS_CONFIG[s].label}`
																		);
																	} else {
																		toast.error(r.error ?? "Ошибка");
																	}
																}}
																className={
																	s === "CANCELLED" ? "text-red-500" : ""
																}
															>
																{s === "CANCELLED" ? (
																	<Ban className="w-4 h-4 mr-2" />
																) : (
																	<RefreshCw className="w-4 h-4 mr-2" />
																)}
																→ {BOOKING_STATUS_CONFIG[s].label}
															</DropdownMenuItem>
														))}
													</>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				{filtered.length === 0 && (
					<div className="text-center py-12 text-muted-foreground text-sm">
						Бронирования не найдены
					</div>
				)}
			</Card>

			{/* Detail panel */}
			{activeBooking && (
				<>
					<button
						type="button"
						className="fixed inset-0 bg-black/40 z-40"
						onClick={() => setActiveBooking(null)}
					/>
					<BookingDetailPanel
						booking={activeBooking}
						onClose={() => setActiveBooking(null)}
						onStatusUpdate={handleStatusUpdate}
					/>
				</>
			)}
		</div>
	);
}
