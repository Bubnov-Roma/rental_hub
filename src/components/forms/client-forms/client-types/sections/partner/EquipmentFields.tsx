import { Plus, Trash2 } from "lucide-react";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Section } from "@/components/shared";
import { Button } from "@/components/ui";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ClientFormValues } from "@/schemas";

interface EquipmentFieldsProps {
	form: UseFormReturn<ClientFormValues>;
}

export function EquipmentFields({ form }: EquipmentFieldsProps) {
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "partnerEquipment",
	});

	return (
		<Section title="Техника для субаренды">
			<p className="text-sm text-muted-foreground mb-4">
				Добавьте минимум 1 единицу техники.
			</p>

			<div className="space-y-6">
				{fields.map((field, index) => (
					<div
						key={field.id}
						className="border-2 border-primary/20 p-6 rounded-xl relative bg-linear-to-br from-primary/5 to-transparent"
					>
						<div className="absolute top-4 right-4">
							{fields.length > 1 && (
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={() => remove(index)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>

						<h4 className="font-semibold text-lg mb-4">Позиция {index + 1}</h4>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.title`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Название *</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Canon EOS R5" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.inventoryNumber`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Инвентарный номер *</FormLabel>
										<FormControl>
											<Input {...field} placeholder="INV-001" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.category`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Категория *</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Камера, Объектив..." />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.estimatedValue`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Оценочная стоимость (₽) *</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.dailyRate`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Стоимость в сутки (₽)</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.description`}
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Описание *</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												rows={3}
												placeholder="Подробное описание техники..."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.configuration`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Комплектация *</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Корпус, 2 батареи, зарядка (или пробел)"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.defects`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Дефекты *</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Нет (или пробел)" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`partnerEquipment.${index}.photo`}
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Фотография * (мин. 600px)</FormLabel>
										<FormControl>
											<ImageUploader
												currentImageUrl={
													typeof field.value === "string" ? field.value : ""
												}
												aspectRatio={16 / 9}
												onFileSelect={(file) => {
													field.onChange(file);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				))}

				<Button
					type="button"
					variant="outline"
					size="lg"
					onClick={() =>
						append({
							title: "",
							description: "",
							inventoryNumber: "",
							estimatedValue: 0,
							configuration: "",
							defects: "",
							photo: "",
							category: "",
							dailyRate: 0,
						})
					}
					className="w-full"
				>
					<Plus className="h-5 w-5 mr-2" />
					Добавить технику
				</Button>
			</div>
		</Section>
	);
}
