"use client";

import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/utils";

export function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [isSent, setIsSent] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const { error } = await supabase.auth.signInWithOtp({
				email: email,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
				},
			});

			if (error) throw error;

			setIsSent(true);
			toast.success("Ссылка для входа отправлена на почту");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Ошибка при отправке ссылки");
		} finally {
			setLoading(false);
		}
	};

	if (isSent) {
		return (
			<div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
				<div className="flex justify-center">
					<div className="relative">
						<div className="absolute inset-0 blur-xl bg-accent-glow/30 rounded-full" />
						<CheckCircle2 size={64} className="relative text-accent-glow" />
					</div>
				</div>
				<div className="space-y-2">
					<h3 className="text-xl font-bold text-foreground/70">
						Проверьте почту
					</h3>
					<p className="text-sm text-foreground/50">
						Мы отправили временную ссылку для входа на <br />
						<span className="foreground-white">{email}</span>
					</p>
				</div>
				<Button
					onClick={() => router.push("/auth?view=contact")}
					className="w-full h-12 rounded-2xl border"
				>
					Вернуться назад
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label className="text-sm font-medium text-foreground/70 ml-1">
						Введите почту для получения ссылки
					</Label>
					<div className="relative">
						<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30 z-1" />
						<Input
							type="email"
							placeholder="example@mail.com"
							className="glass-input w-full pl-12"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
				</div>
				<Button
					type="submit"
					className="glow-button w-full h-14"
					disabled={loading || !email}
				>
					{loading ? <Loader2 className="animate-spin" /> : "Отправить ссылку"}
				</Button>
			</form>

			<Button
				variant="glass"
				onClick={() => router.push("/auth?view=contact")}
				className="w-full h-14 flex items-center justify-center gap-2 text-sm text-foreground/50 hover:text-primary transition-colors"
			>
				<ArrowLeft size={16} /> Вернуться к входу
			</Button>
		</div>
	);
}
