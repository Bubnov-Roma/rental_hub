"use client";

import { Briefcase, Building, Calendar, Mail, Phone, User } from "lucide-react";
import { VerificationBadge } from "@/components/forms";
import { RainbowSpinner } from "@/components/shared";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import type { ClientFormValues } from "@/schemas";
import { useApplicationStore } from "@/store";
import { getClientDisplayData, getPartnerEquipment, isPartner } from "@/utils";

export function ProfileDetails({ data }: { data: ClientFormValues | null }) {
	const status = useApplicationStore((state) => state.status);
	const isClientPartner = isPartner(data);

	const displayData = getClientDisplayData(data);

	if (!displayData) {
		return <RainbowSpinner />;
	}
	const equipment = getPartnerEquipment(data);

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
			<Card className="relative glass-card overflow-hidden rounded-none pt-4 pb-0 px-0">
				<div className="absolute top-0 right-0 p-6">
					<VerificationBadge isClientPartner={isClientPartner} />
				</div>

				<CardHeader className="border-b border-foreground/5 pb-8">
					<div className="flex items-center gap-6">
						<div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-foreground/10 flex items-center justify-center text-foreground/50 shadow-inner">
							{displayData.category === "individual" ? (
								<User size={40} />
							) : (
								<Building size={40} />
							)}
						</div>
						<div>
							<CardTitle className="text-2xl font-bold text-foreground uppercase tracking-tight">
								{displayData.name}
							</CardTitle>
							<CardDescription className="text-blue-400/80 font-mono mt-1">
								ID: CLIENT-
								{Math.random().toString(36).substring(2, 9).toUpperCase()}
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
					{/* Группа: Контакты */}
					<section className="space-y-4">
						<h4 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
							Contact Information
						</h4>
						<div className="space-y-3">
							<DetailRow
								icon={<Mail size={14} />}
								label="Email"
								value={displayData.email}
							/>
							<DetailRow
								icon={<Phone size={14} />}
								label="Phone"
								value={displayData.phone}
							/>
						</div>
					</section>

					{/* Группа: Документы / Компания */}
					<section className="space-y-4">
						<h4 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
							{displayData.category === "legal"
								? "Legal Entity Details"
								: "Identity Details"}
						</h4>
						<div className="space-y-3">
							{displayData.category === "legal" ? (
								<>
									<DetailRow
										icon={<Building size={14} />}
										label="Company"
										value={displayData.companyName}
									/>
									<DetailRow
										icon={<Briefcase size={14} />}
										label="INN"
										value={displayData.inn}
									/>
								</>
							) : (
								<>
									<DetailRow
										icon={<Briefcase size={14} />}
										label="Passport"
										value={displayData.passport}
									/>
									<DetailRow
										icon={<Calendar size={14} />}
										label="Birth Date"
										value={displayData.birth}
									/>
								</>
							)}
						</div>
					</section>
				</CardContent>

				{/* Партнерское оборудование */}
				{isClientPartner && equipment && equipment.length > 0 && (
					<div className="p-6 bg-blue-500/5 border-t border-foreground/5">
						<h4 className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-4">
							Partner Equipment
						</h4>
						<div className="text-sm text-foreground/60">
							{equipment.length} item(s) registered
						</div>
					</div>
				)}

				{status === "approved" && (
					<div className="p-6 bg-foreground/10 border-t border-foreground/5 flex justify-between items-center ">
						<Button
							variant="ghost"
							size="sm"
							className="text-blue-400 hover:text-blue-300 text-xs"
						>
							Редактировать данные
						</Button>
					</div>
				)}
			</Card>
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
	value: string | null;
}) {
	return (
		<div className="flex items-center justify-between group/row p-2 rounded-lg hover:bg-foreground/2 transition-colors">
			<div className="flex items-center gap-3">
				<span className="text-foreground/20 group-hover/row:text-blue-400/50 transition-colors">
					{icon}
				</span>
				<span className="text-sm text-foreground/40">{label}</span>
			</div>
			<span className="text-sm font-medium text-foreground/80">
				{value || "—"}
			</span>
		</div>
	);
}
