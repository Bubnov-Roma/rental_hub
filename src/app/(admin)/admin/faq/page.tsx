import { getFaqItemsAction } from "@/actions/faq-actions";

export const revalidate = 3600; // cache 1 hour

export default async function FaqPage() {
	const items = await getFaqItemsAction();
	const active = items.filter((i) => i.isActive);

	const grouped = active.reduce<Record<string, typeof active>>((acc, item) => {
		const key = item.category ?? "Общие вопросы";
		if (!acc[key]) acc[key] = [];
		acc[key].push(item);
		return acc;
	}, {});

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-3xl px-4 py-20">
				<div className="mb-12 text-center">
					<h1 className="text-5xl font-black uppercase italic tracking-tight mb-4">
						Частые вопросы
					</h1>
					<p className="text-muted-foreground text-lg">
						Ответы на самые популярные вопросы об аренде оборудования
					</p>
				</div>

				{Object.keys(grouped).length === 0 ? (
					<p className="text-center text-muted-foreground">
						FAQ пока не заполнен
					</p>
				) : (
					<div className="space-y-10">
						{Object.entries(grouped).map(([category, categoryItems]) => (
							<section key={category}>
								<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 pb-2 border-b border-foreground/5">
									{category}
								</h2>
								<div className="space-y-3">
									{categoryItems.map((item) => (
										<details
											key={item.id}
											className="group rounded-2xl border border-foreground/8 bg-foreground/3 overflow-hidden"
										>
											<summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-foreground/5 transition-colors">
												<span className="text-sm font-semibold pr-4">
													{item.question}
												</span>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
												>
													<polyline points="6 9 12 15 18 9" />
												</svg>
											</summary>
											<div className="px-5 pb-5 pt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-foreground/5">
												{item.answer}
											</div>
										</details>
									))}
								</div>
							</section>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
