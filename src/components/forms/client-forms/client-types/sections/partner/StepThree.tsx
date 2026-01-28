import { AlertCircle, CheckCircle2, Handshake } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { EquipmentFields } from "@/components/forms/client-forms/client-types/sections/partner/EquipmentFields";
import { Section } from "@/components/shared/Section";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { ClientFormValues } from "@/schemas";

interface StepThreeProps {
	form: UseFormReturn<ClientFormValues>;
}

export function StepThree({ form }: StepThreeProps) {
	return (
		<div className="space-y-8">
			{/* Заголовок */}
			<div className="text-center">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
					<Handshake className="h-10 w-10 text-primary" />
				</div>
				<h2 className="text-3xl font-bold mb-2">Партнерская программа</h2>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					Сдавайте свою технику в аренду и получайте стабильный доход. Мы берем
					на себя все заботы по поиску клиентов, оформлению и страхованию.
				</p>
			</div>

			{/* Преимущества */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-green-50 dark:bg-green-950 p-6 rounded-xl border border-green-200 dark:border-green-800">
					<CheckCircle2 className="h-10 w-10 text-green-600 mb-3" />
					<h4 className="font-semibold mb-2">Пассивный доход</h4>
					<p className="text-sm text-muted-foreground">
						Ваша техника работает и приносит деньги, даже когда вы отдыхаете
					</p>
				</div>

				<div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
					<CheckCircle2 className="h-10 w-10 text-blue-600 mb-3" />
					<h4 className="font-semibold mb-2">Полное страхование</h4>
					<p className="text-sm text-muted-foreground">
						Вся техника застрахована от повреждений и кражи на полную стоимость
					</p>
				</div>

				<div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
					<CheckCircle2 className="h-10 w-10 text-purple-600 mb-3" />
					<h4 className="font-semibold mb-2">Без хлопот</h4>
					<p className="text-sm text-muted-foreground">
						Мы занимаемся поиском клиентов, проверкой и всем документооборотом
					</p>
				</div>
			</div>

			{/* Условия партнерства */}
			<Section title="Условия сотрудничества">
				{/* ✅ Убрали AlertDialog, используем обычный div */}
				<div className="bg-amber-50 dark:bg-amber-950 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
					<div className="flex items-start gap-3">
						<AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
						<div className="space-y-2 text-sm">
							<p className="font-semibold text-amber-900 dark:text-amber-100">
								Основные условия:
							</p>
							<ul className="list-disc list-inside space-y-1 ml-2 text-amber-800 dark:text-amber-200">
								<li>Комиссия сервиса составляет 30% от стоимости аренды</li>
								<li>
									Выплаты производятся в течение 3 рабочих дней после возврата
									техники
								</li>
								<li>Техника должна быть исправна и соответствовать описанию</li>
								<li>
									Минимальная оценочная стоимость единицы техники - 10 000 ₽
								</li>
								<li>
									Вы можете забрать технику на личное использование в любое
									время (при отсутствии активных броней)
								</li>
								<li>Все споры решаются в досудебном порядке</li>
							</ul>
						</div>
					</div>
				</div>

				<FormField
					control={form.control}
					name="partnerAgreement"
					render={({ field }) => (
						<FormItem className="flex items-start space-x-3 space-y-0 border-2 border-primary p-4 rounded-lg bg-primary/5 mt-4">
							<FormControl>
								<Checkbox
									checked={field.value ?? false}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1">
								<FormLabel className="font-semibold text-base">
									Я ознакомлен и согласен с условиями партнерского
									сотрудничества *
								</FormLabel>
								<p className="text-sm text-muted-foreground">
									Нажимая на эту галочку, вы подтверждаете, что прочитали и
									согласны с{" "}
									<a
										href="/partnership-terms"
										target="_blank"
										className="text-primary underline"
										rel="noopener noreferrer"
									>
										полными условиями партнерства
									</a>
								</p>
								<FormMessage />
							</div>
						</FormItem>
					)}
				/>
			</Section>

			{/* Форма добавления техники */}
			<EquipmentFields form={form} />

			{/* Информационная панель */}
			<div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
				<div className="flex items-start gap-3">
					<AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
					<div className="space-y-2">
						<p className="font-semibold text-blue-900 dark:text-blue-100">
							Что будет дальше?
						</p>
						<ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
							<li>Вы отправляете заявку с информацией о технике</li>
							<li>
								Наш менеджер свяжется с вами в течение 24 часов для уточнения
								деталей
							</li>
							<li>Мы проведем осмотр техники (возможен выезд к вам)</li>
							<li>
								После подписания договора техника появится в каталоге аренды
							</li>
							<li>Вы начинаете получать доход от сдачи техники в аренду!</li>
						</ol>
					</div>
				</div>
			</div>

			{/* Дополнительная информация */}
			<div className="bg-linear-to-br from-primary/5 to-purple-500/5 p-6 rounded-xl border border-primary/20">
				<h4 className="font-semibold mb-3 flex items-center">
					<span className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-2 text-sm">
						?
					</span>
					Часто задаваемые вопросы
				</h4>
				<div className="space-y-3 text-sm">
					<details className="group">
						<summary className="font-medium cursor-pointer hover:text-primary list-none">
							<span className="inline-flex items-center">
								<span className="mr-2">▸</span>
								Что делать, если техника повредилась во время аренды?
							</span>
						</summary>
						<p className="mt-2 text-muted-foreground pl-6">
							Все случаи повреждений покрываются страховкой. Мы компенсируем
							ремонт или полную стоимость техники в случае невозможности
							восстановления.
						</p>
					</details>

					<details className="group">
						<summary className="font-medium cursor-pointer hover:text-primary list-none">
							<span className="inline-flex items-center">
								<span className="mr-2">▸</span>
								Могу ли я установить свою цену аренды?
							</span>
						</summary>
						<p className="mt-2 text-muted-foreground pl-6">
							Да, вы указываете желаемую стоимость, но мы рекомендуем
							ориентироваться на рыночные цены для лучшей востребованности
							техники.
						</p>
					</details>

					<details className="group">
						<summary className="font-medium cursor-pointer hover:text-primary list-none">
							<span className="inline-flex items-center">
								<span className="mr-2">▸</span>
								Как часто можно забирать технику для личного использования?
							</span>
						</summary>
						<p className="mt-2 text-muted-foreground pl-6">
							В любое время, когда техника свободна и нет активных броней.
							Просто уведомите нас за 24 часа через личный кабинет.
						</p>
					</details>
				</div>
			</div>
		</div>
	);
}
