"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/utils";

interface UseOtpAuthReturn {
	isAuthenticated: boolean;
	isLoading: boolean;
	isSendingCode: boolean;
	isVerifyingCode: boolean;
	error: string | null;
	sendOtpCode: (contact: string, type: "phone" | "email") => Promise<boolean>;
	verifyOtpCode: (
		contact: string,
		code: string,
		type: "phone" | "email"
	) => Promise<boolean>;
	resendCode: () => Promise<void>;
}

export const useOtpAuth = (): UseOtpAuthReturn => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, _setIsLoading] = useState(false);
	const [isSendingCode, setIsSendingCode] = useState(false);
	const [isVerifyingCode, setIsVerifyingCode] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastContact, setLastContact] = useState<{
		value: string;
		type: "phone" | "email";
	} | null>(null);

	const supabase = createClient();

	const sendOtpCode = async (
		contact: string,
		type: "phone" | "email"
	): Promise<boolean> => {
		setIsSendingCode(true);
		setError(null);

		try {
			if (type === "email") {
				const { error } = await supabase.auth.signInWithOtp({
					email: contact,
					options: {
						shouldCreateUser: true,
					},
				});

				if (error) throw error;

				setLastContact({ value: contact, type });
				toast.success("Код отправлен на ваш email");
				return true;
			} else {
				// TODO: provider settings for SMS
				const { error } = await supabase.auth.signInWithOtp({
					phone: contact,
					options: {
						shouldCreateUser: true,
					},
				});

				if (error) throw error;

				setLastContact({ value: contact, type });
				toast.success("Код отправлен на ваш телефон");
				return true;
			}
		} catch (err) {
			const message = getErrorMessage(err) || "Ошибка при отправке кода";
			setError(message);
			toast.error(message);
			return false;
		} finally {
			setIsSendingCode(false);
		}
	};

	const verifyOtpCode = async (
		contact: string,
		code: string,
		type: "phone" | "email"
	): Promise<boolean> => {
		setIsVerifyingCode(true);
		setError(null);

		try {
			const { data, error } =
				type === "email"
					? await supabase.auth.verifyOtp({
							email: contact,
							token: code,
							type: "email",
						})
					: await supabase.auth.verifyOtp({
							phone: contact,
							token: code,
							type: "sms",
						});

			if (error) throw error;

			if (data.user) {
				setIsAuthenticated(true);
				toast.success("Успешная авторизация!");
				return true;
			}

			return false;
		} catch (err) {
			const message = getErrorMessage(err) || "Неверный код";
			setError(message);
			toast.error(message);
			return false;
		} finally {
			setIsVerifyingCode(false);
		}
	};

	const resendCode = async (): Promise<void> => {
		if (!lastContact) {
			toast.error("Нет сохраненного контакта для повторной отправки");
			return;
		}

		await sendOtpCode(lastContact.value, lastContact.type);
	};

	return {
		isAuthenticated,
		isLoading,
		isSendingCode,
		isVerifyingCode,
		error,
		sendOtpCode,
		verifyOtpCode,
		resendCode,
	};
};
