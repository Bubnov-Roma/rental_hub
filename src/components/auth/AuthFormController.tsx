"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks";
import { ContactForm } from "./forms/ContactForm";
import { ForgotPasswordForm } from "./forms/ForgotPasswordForm";
import { OtpForm } from "./forms/OtpForm";
import { SuccessView } from "./forms/SuccessView";

export function AuthFormController({
	view,
	mode,
}: {
	view: string;
	mode: string;
}) {
	const user = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			const params = new URLSearchParams(window.location.search);
			const redirectUrl = params.get("redirect") || "/dashboard";
			router.push(redirectUrl);
		}
	}, [user, router]);

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={view}
				initial={{ x: 20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: -20, opacity: 0 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				{view === "otp" && <OtpForm />}
				{view === "forgot" && <ForgotPasswordForm />}
				{view === "success" && <SuccessView />}
				{view === "contact" && <ContactForm mode={mode} />}
			</motion.div>
		</AnimatePresence>
	);
}
