"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SuccessView } from "@/components/auth/forms/SuccessView";
import { UpdatePasswordForm } from "@/components/auth/forms/UpdatePasswordForm";
import { useAuth } from "@/hooks/useAuth";
import { ForgotPasswordForm } from "./forms/ForgotPasswordForm";
import { LoginForm } from "./forms/LoginForm";
import { OtpForm } from "./forms/OtpForm";
import { OtpLoginForm } from "./forms/OtpLoginForm";
import { RegisterForm } from "./forms/RegisterForm";

export function AuthFormController({ view }: { view: string }) {
	const { user } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (user && view !== "update-password") {
			const redirectUrl = searchParams.get("redirect") || "/dashboard";
			router.push(redirectUrl);
		}
	}, [user, router, view, searchParams]);

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={view}
				initial={{ x: 20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: -20, opacity: 0 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="w-full"
			>
				{/* Вход с паролем (по умолчанию) */}
				{view === "login" && <LoginForm />}
				{/* Регистрация с паролем */}
				{view === "register" && <RegisterForm />}
				{/* Ввод почты для сброса пароля */}
				{view === "forgot" && <ForgotPasswordForm />}
				{/* Форма смены пароля (попадаем сюда по ссылке из почты) */}
				{view === "update-password" && <UpdatePasswordForm />}
				{/* Вход по коду (OTP) - ввод emailе */}
				{(view === "contact" || view === "otp-login") && <OtpLoginForm />}
				{/* Вход по коду: ввод цифр */}
				{view === "otp" && <OtpForm />}
				{/* Экран успеха (опционально) */}
				{view === "success" && <SuccessView />}
			</motion.div>
		</AnimatePresence>
	);
}
