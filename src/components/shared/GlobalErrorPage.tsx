"use client";

import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Button } from "@/components/ui";

interface CustomErrorPageProps {
	readonly title: string;
	readonly message: string;
	readonly children?: React.ReactNode;
	readonly reset?: () => void;
}
const GlobalErrorPage = ({ title, message, reset }: CustomErrorPageProps) => {
	const router = useRouter();

	const handleRetry = () => {
		if (reset) {
			reset();
		} else {
			startTransition(() => {
				router.refresh();
			});
		}
	};

	return (
		<div className="min-h-[80vh] flex items-center justify-center p-4">
			<div className="relative group max-w-md w-full">
				<div className="absolute top-0 left-0 -inset-1 bg-linear-to-br from-yellow-500 to-primary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
				<div className="relative glass-container rounded-2xl p-8 bg-background/40 text-center space-y-6">
					<div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
						<AlertCircle className="w-10 h-10 text-red-400" />
					</div>

					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-foreground whitespace-pre-line">
							{title}
						</h2>
						<p className="text-muted-foreground text-sm whitespace-pre-line">
							{message}
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button onClick={handleRetry} variant="ghost">
							<RefreshCcw size="md" className="mr-2" />
							Повторить
						</Button>
						<Button asChild variant="ghost">
							<Link href="/">
								На главную
								<Home size="md" className="ml-2" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GlobalErrorPage;
