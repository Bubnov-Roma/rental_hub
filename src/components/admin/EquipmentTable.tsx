"use client";

import {
	Edit,
	Eye,
	Filter,
	MoreVertical,
	Package,
	Search,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
	Badge,
	Button,
	Card,
	CardContent,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

interface Equipment {
	id: string;
	title: string;
	category: string;
	price_per_day: number;
	is_available: boolean;
	created_at: string;
	images?: { url: string }[];
}

export default function EquipmentTable({
	initialData,
}: {
	initialData: Equipment[];
}) {
	const [equipment, setEquipment] = useState(initialData);
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const supabase = createClient();

	const deleteEquipment = async (id: string) => {
		if (!confirm("Вы уверены?")) return;
		const { error } = await supabase.from("equipment").delete().eq("id", id);
		if (!error) {
			setEquipment((prev) => prev.filter((item) => item.id !== id));
		}
	};

	const categories = [...new Set(initialData.map((item) => item.category))];

	const filtered = equipment.filter((item) => {
		const matchesSearch = item.title
			.toLowerCase()
			.includes(search.toLowerCase());
		const matchesCategory =
			categoryFilter === "all" || item.category === categoryFilter;
		return matchesSearch && matchesCategory;
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center">
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<div className="flex-1">
							{/* <div className="relative"> */}
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Поиск..."
								className="pl-10"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex gap-2"></div>
					<select
						className="rounded-md border border-input bg-background px-3 py-2 text-sm"
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
					>
						<option value="all">Все категории</option>
						{categories.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
					<Button variant="outline">
						<Filter className="mr-2 h-4 w-4" />
						Фильтры
					</Button>
				</CardContent>
			</Card>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Название</TableHead>
							<TableHead>Категория</TableHead>
							<TableHead>Цена/день</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead className="text-right">Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.map((item) => (
							<TableRow key={item.id}>
								<TableCell className="flex items-center gap-3">
									<div className="h-10 w-10 relative overflow-hidden rounded-md bg-gray-100">
										{item.images?.[0]?.url ? (
											<Image
												src={item.images[0].url}
												alt=""
												fill
												className="object-cover"
											/>
										) : (
											<Package className="m-auto h-5 w-5 text-gray-400" />
										)}
									</div>
									<div>
										<p className="font-medium">{item.title}</p>
										<p className="text-xs text-gray-500">
											ID: {item.id.slice(0, 8)}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline">{item.category}</Badge>
								</TableCell>
								<TableCell>{item.price_per_day.toLocaleString()} ₽</TableCell>
								<TableCell>
									<Badge
										className={
											item.is_available
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}
									>
										{item.is_available ? "Доступно" : "Занято"}
									</Badge>
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Действия</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link href={`/equipment/${item.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													Просмотр
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/admin/equipment/${item.id}/edit`}>
													<Edit className="mr-2 h-4 w-4" />
													Редактировать
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-red-600"
												onClick={() => deleteEquipment(item.id)}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Удалить
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
