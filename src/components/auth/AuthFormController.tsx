"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { SuccessView } from "@/components/auth/forms/SuccessView";
import { LoginForm } from "./forms/LoginForm";
import { UniversalAuthForm } from "./forms/UniversalAuthForm";

export function AuthFormController({ view }: { view: string }) {
	const { data: session } = useSession();
	const user = session?.user ?? null;
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		console.log("user:", user, "view:", view);
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
				{/* Вход с паролем */}
				{view === "login" && <LoginForm />}
				{/* Форма смены пароля */}
				{/* {view === "update-password" && <UpdatePasswordForm />} */}
				{/* Вход по MagicLink */}
				{view === "register" && <UniversalAuthForm />}
				{/* Экран успеха (опционально) */}
				{view === "success" && <SuccessView />}
			</motion.div>
		</AnimatePresence>
	);
}
