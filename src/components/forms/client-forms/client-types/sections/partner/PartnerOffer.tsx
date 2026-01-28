import { HandHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartnerOfferProps {
	onBecomePartner?: (() => void) | undefined;
}

export function PartnerOffer({ onBecomePartner }: PartnerOfferProps) {
	return (
		<div className="pt-8 border-t border-dashed">
			<div className="bg-linear-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-6 rounded-xl border-2 border-primary/20">
				<div className="flex items-start gap-4">
					<Sparkles className="h-12 w-12 text-primary shrink-0" />
					<div className="flex-1">
						<h3 className="text-xl font-bold mb-2">
							Хотите сдавать технику в субаренду?
						</h3>
						<p className="text-muted-foreground mb-4">
							Станьте нашим партнером и зарабатывайте на своей технике! Это
							просто, выгодно и безопасно.
						</p>
						<Button
							type="button"
							onClick={onBecomePartner}
							size="lg"
							className="w-full md:w-auto"
						>
							<HandHeart className="h-5 w-5 mr-2" />
							Стать партнером
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
