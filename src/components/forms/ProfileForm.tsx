"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useCallback, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { type ProfileFormValues, refinedProfileSchema } from "@/schemas/profile-schemas";

interface ProfileFormProps {
	initialData?: Partial<ProfileFormValues>;
	onSubmit: (data: ProfileFormValues) => Promise<void>;
	mode?: "create" | "edit";
}

const TypedForm = Form as <T extends ProfileFormValues>(
	props: React.ComponentProps<typeof Form<T>>
) => React.ReactElement;

export function ProfileForm({ initialData, onSubmit, mode }: ProfileFormProps) {
	mode ?? "create";
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string>("");

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(refinedProfileSchema),
		defaultValues: {
			personal: {
				lastName: "",
				firstName: "",
				middleName: undefined,
			},
			passport: {
				series: "",
				number: "",
				issuedBy: "",
				issueDate: "",
				departmentCode: "",
			},
			email: "",
			phone: "",
			registrationAddress: {
				postalCode: "",
				region: "",
				city: "",
				street: "",
				house: "",
				district: undefined,
				building: undefined,
				apartment: undefined,
			},
			actualAddress: {
				postalCode: "",
				region: "",
				city: "",
				street: "",
				house: "",
				district: undefined,
				building: undefined,
				apartment: undefined,
			},
			sameAsRegistration: false,
			equipmentType: "car",
			equipmentTypeOther: undefined,
			rentalPeriod: "monthly",
			employment: {
				company: "",
				position: "",
				salary: 30000,
				website: "",
			},
			socialLinks: [],
			emergencyContact: {
				name: "",
				phone: "",
				relationship: "mother",
				relationshipOther: undefined,
			},
			referralSource: "search",
			referralSourceOther: undefined,
			promoCode: undefined,
			consentPersonalData: false,
			consentMarketing: false,
			...initialData,
		},
	});

	const watchSameAsRegistration = form.watch("sameAsRegistration");
	const watchEquipmentType = form.watch("equipmentType");
	const watchReferralSource = form.watch("referralSource");
	const watchEmergencyContactRelationship = form.watch("emergencyContact.relationship");

	// Address synchronization handler
	const handleSameAddressChange = useCallback(
		(checked: boolean) => {
			if (checked) {
				const registrationAddress = form.getValues("registrationAddress");
				form.setValue("actualAddress", registrationAddress);
			}
		},
		[form]
	);

	const handleFormSubmit = async (data: ProfileFormValues) => {
		setIsSubmitting(true);
		setError("");

		try {
			await onSubmit(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Произошла ошибка при сохранении анкеты");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Анкета клиента</CardTitle>
					<p className="text-sm text-muted-foreground">Заполните все поля для оформления аренды</p>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					<TypedForm {...form}>
						<form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
							{/* Раздел 1: Личные данные */}
							<Section title="Личные данные">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="personal.lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Фамилия *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="personal.firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Имя *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="personal.middleName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Отчество</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</Section>

							{/* Раздел 2: Паспортные данные */}
							<Section title="Паспортные данные">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
									<FormField
										control={form.control}
										name="passport.series"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Серия *</FormLabel>
												<FormControl>
													<Input {...field} maxLength={4} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="passport.number"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Номер *</FormLabel>
												<FormControl>
													<Input {...field} maxLength={6} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="passport.departmentCode"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Код подразделения *</FormLabel>
												<FormControl>
													<Input {...field} placeholder="XXX-XXX" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
									<FormField
										control={form.control}
										name="passport.issuedBy"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Кем выдан *</FormLabel>
												<FormControl>
													<Textarea {...field} rows={2} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="passport.issueDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Дата выдачи *</FormLabel>
												<FormControl>
													<Input {...field} placeholder="ДД.ММ.ГГГГ" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</Section>

							{/* Раздел 3: Контактные данные */}
							<Section title="Контактные данные">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email *</FormLabel>
												<FormControl>
													<Input type="email" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Телефон *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</Section>

							{/* Раздел 4: Адреса */}
							<Section title="Адреса">
								<div className="space-y-6">
									<div className="space-y-4">
										<h4 className="font-medium">Адрес регистрации *</h4>
										<AddressFields form={form} prefix="registrationAddress" />
									</div>

									<div className="flex items-center space-x-2">
										<FormField
											control={form.control}
											name="sameAsRegistration"
											render={({ field }) => (
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<Checkbox
															checked={field.value}
															onCheckedChange={(checked) => {
																field.onChange(checked);
																handleSameAddressChange(checked === true);
															}}
														/>
													</FormControl>
													<FormLabel className="cursor-pointer">
														Совпадает с адресом регистрации
													</FormLabel>
												</FormItem>
											)}
										/>
									</div>

									{!watchSameAsRegistration && (
										<div className="space-y-4">
											<h4 className="font-medium">Фактический адрес проживания *</h4>
											<AddressFields form={form} prefix="actualAddress" />
										</div>
									)}
								</div>
							</Section>

							{/* Раздел 5: Аренда техники */}
							<Section title="Аренда техники">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="equipmentType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Тип техники *</FormLabel>
												<FormControl>
													<select
														className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
														{...field}
													>
														<option value="car">Автомобиль</option>
														<option value="motorcycle">Мотоцикл</option>
														<option value="scooter">Скутер</option>
														<option value="bicycle">Велосипед</option>
														<option value="other">Другое</option>
													</select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="rentalPeriod"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Период аренды *</FormLabel>
												<FormControl>
													<select
														className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
														{...field}
													>
														<option value="daily">Посуточно</option>
														<option value="weekly">Понедельно</option>
														<option value="monthly">Помесячно</option>
														<option value="long_term">Долгосрочная</option>
													</select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{watchEquipmentType === "other" && (
									<div className="mt-4">
										<FormField
											control={form.control}
											name="equipmentTypeOther"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Укажите тип техники *</FormLabel>
													<FormControl>
														<Input {...field} placeholder="Например, квадроцикл, лодка и т.д." />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								)}
							</Section>

							{/* Раздел 6: Работа и доход */}
							<Section title="Работа и доход">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="employment.company"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Место работы *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="employment.position"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Должность *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="employment.salary"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Зарплата (₽) *</FormLabel>
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
										name="employment.website"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Сайт компании</FormLabel>
												<FormControl>
													<Input type="url" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</Section>

							{/* Раздел 7: Контактное лицо */}
							<Section title="Контактное лицо (на случай экстренной связи)">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="emergencyContact.name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Имя *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="emergencyContact.phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Телефон *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="emergencyContact.relationship"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Кем приходится *</FormLabel>
												<FormControl>
													<select
														className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
														{...field}
													>
														<option value="mother">Мать</option>
														<option value="father">Отец</option>
														<option value="spouse">Супруг(а)</option>
														<option value="sibling">Брат/Сестра</option>
														<option value="friend">Друг/Подруга</option>
														<option value="colleague">Коллега</option>
														<option value="other">Другое</option>
													</select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{watchEmergencyContactRelationship === "other" && (
									<div className="mt-4">
										<FormField
											control={form.control}
											name="emergencyContact.relationshipOther"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Укажите родство *</FormLabel>
													<FormControl>
														<Input {...field} placeholder="Например, сосед, родственник и т.д." />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								)}
							</Section>

							{/* Раздел 8: Дополнительная информация */}
							<Section title="Дополнительная информация">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="referralSource"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Откуда узнали о нас *</FormLabel>
												<FormControl>
													<select
														className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
														{...field}
													>
														<option value="search">Поиск в интернете</option>
														<option value="social">Социальные сети</option>
														<option value="friend">От друзей</option>
														<option value="ad">Реклама</option>
														<option value="other">Другое</option>
													</select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="promoCode"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Промо-код</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{watchReferralSource === "other" && (
									<div className="mt-4">
										<FormField
											control={form.control}
											name="referralSourceOther"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Укажите источник *</FormLabel>
													<FormControl>
														<Input {...field} placeholder="Например, рекомендация, улица и т.д." />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								)}
							</Section>

							{/* Раздел 9: Согласия */}
							<Section title="Согласия">
								<div className="space-y-4">
									<FormField
										control={form.control}
										name="consentPersonalData"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>
														Я даю согласие на обработку моих персональных данных *
													</FormLabel>
													<p className="text-sm text-muted-foreground">
														Все данные обрабатываются в соответствии с Федеральным законом №152-ФЗ
													</p>
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="consentMarketing"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Я согласен на получение рекламных материалов</FormLabel>
													<p className="text-sm text-muted-foreground">
														Вы можете отписаться в любое время
													</p>
												</div>
											</FormItem>
										)}
									/>
								</div>
							</Section>

							<div className="pt-6">
								<Button type="submit" disabled={isSubmitting} className="w-full">
									{isSubmitting ? "Сохранение..." : "Сохранить анкету"}
								</Button>
							</div>
						</form>
					</TypedForm>
				</CardContent>
			</Card>
		</div>
	);
}

// Вспомогательные компоненты
function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold">{title}</h3>
				<Separator className="mt-2" />
			</div>
			{children}
		</div>
	);
}

// Типизированный компонент для адресных полей
interface AddressFieldsProps {
	form: UseFormReturn<ProfileFormValues>;
	prefix: "registrationAddress" | "actualAddress";
}

function AddressFields({ form, prefix }: AddressFieldsProps) {
	const fields = [
		{ name: "postalCode", label: "Индекс *", type: "text" },
		{ name: "region", label: "Область *", type: "text" },
		{ name: "city", label: "Город *", type: "text" },
		{ name: "district", label: "Район", type: "text" },
		{ name: "street", label: "Улица *", type: "text" },
		{ name: "house", label: "Дом *", type: "text" },
		{ name: "building", label: "Корпус", type: "text" },
		{ name: "apartment", label: "Квартира", type: "text" },
	] as const;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{fields.map(({ name, label, type }) => (
				<FormField
					key={`${prefix}.${name}`}
					control={form.control}
					name={`${prefix}.${name}` as const}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{label}</FormLabel>
							<FormControl>
								<Input type={type} {...field} value={field.value || ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
		</div>
	);
}
