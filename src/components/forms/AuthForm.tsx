"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/auth";
import {
	type LoginFormValues,
	loginSchema,
	type RegisterFormValues,
	registerSchema,
} from "@/schemas/auth-schemas";
import { getErrorMessage } from "@/utils/error-handler";

type AuthFormProps = {
	mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const loginForm = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const registerForm = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
			phone: "",
			confirmPassword: "",
		},
	});

	const form = mode === "login" ? loginForm : registerForm;

	async function onSubmit(values: LoginFormValues | RegisterFormValues) {
		setIsLoading(true);
		setError("");

		try {
			if (mode === "login") {
				const loginValues = values as LoginFormValues;

				await signIn(loginValues.email, loginValues.password);
				router.push("/dashboard");
				router.refresh();
			} else {
				const registerValues = values as RegisterFormValues;
				await signUp(
					registerValues.email,
					registerValues.password,
					registerValues.name,
					registerValues.phone
				);
				router.push("/dashboard?welcome=true");
				router.refresh();
			}
		} catch (err) {
			setError(getErrorMessage(err) || "Произошла ошибка при авторизации");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="w-full max-w-md mx-auto space-y-6">
			<div className="text-center">
				<h1 className="text-3xl font-bold">
					{mode === "login" ? "Вход в аккаунт" : "Регистрация"}
				</h1>
				<p className="mt-2 text-gray-600">
					{mode === "login" ? "Введите свои данные для входа" : "Создайте аккаунт для бронирования"}
				</p>
			</div>

			{error && (
				<div className="rounded-lg bg-red-50 p-4">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}

			{mode === "login" ? (
				<Form {...(form as UseFormReturn<LoginFormValues>)}>
					<LoginFormContent
						form={form as UseFormReturn<LoginFormValues>}
						onSubmit={onSubmit}
						isLoading={isLoading}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
					/>
				</Form>
			) : (
				<Form {...(form as UseFormReturn<RegisterFormValues>)}>
					<RegisterFormContent
						form={form as UseFormReturn<RegisterFormValues>}
						onSubmit={onSubmit}
						isLoading={isLoading}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
						showConfirmPassword={showConfirmPassword}
						setShowConfirmPassword={setShowConfirmPassword}
					/>
				</Form>
			)}

			<div className="relative text-center">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t"></div>
				</div>
				<div className="relative inline-flex bg-white px-4 text-sm text-gray-500">
					{mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
				</div>
			</div>

			<Button
				variant="outline"
				className="w-full"
				onClick={() => router.push(mode === "login" ? "/auth/register" : "/auth/login")}
			>
				{mode === "login" ? "Создать аккаунт" : "Войти в аккаунт"}
			</Button>

			{mode === "register" && (
				<div className="space-y-4">
					{/* Requirements for password */}
					<div className="rounded-lg bg-blue-50 p-4">
						<h4 className="text-sm font-medium text-blue-800 mb-2">Требования к паролю:</h4>
						<ul className="text-xs text-blue-700 space-y-1">
							<li>• Минимум 8 символов</li>
							<li>• Хотя бы одна заглавная буква (A-Z или А-Я)</li>
							<li>• Хотя бы одна строчная буква (a-z или а-я)</li>
							<li>• Хотя бы одна цифра</li>
							<li>
								• Можно использовать специальные символы: !@#$%^&*()_+-=[]{"{}"};':"\|,. `{">"}` or
								`&gt;`?
							</li>
						</ul>
					</div>

					<div className="text-center text-sm text-gray-600">
						<p>
							Нажимая «Зарегистрироваться», вы соглашаетесь с{" "}
							<Link href="/terms" className="text-blue-600 hover:underline">
								Условиями использования
							</Link>
							и
							<Link href="/privacy" className="text-blue-600 hover:underline">
								Политикой конфиденциальности
							</Link>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

// Login Form component
type LoginFormContentProps = {
	form: UseFormReturn<LoginFormValues>;
	onSubmit: (values: LoginFormValues | RegisterFormValues) => Promise<void>;
	isLoading: boolean;
	showPassword: boolean;
	setShowPassword: (show: boolean) => void;
};

function LoginFormContent({
	form,
	onSubmit,
	isLoading,
	showPassword,
	setShowPassword,
}: LoginFormContentProps) {
	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<FormField
				control={form.control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Email</FormLabel>
						<FormControl>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input type="email" placeholder="email@example.com" className="pl-10" {...field} />
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Пароль</FormLabel>
						<FormControl>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									type={showPassword ? "text" : "password"}
									placeholder="Введите пароль"
									className="pl-10 pr-10"
									{...field}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="text-right">
				<Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
					Забыли пароль?
				</Link>
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? (
					<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
				) : (
					"Войти"
				)}
			</Button>
		</form>
	);
}

// Registration Form component
type RegisterFormContentProps = {
	form: UseFormReturn<RegisterFormValues>;
	onSubmit: (values: LoginFormValues | RegisterFormValues) => Promise<void>;
	isLoading: boolean;
	showPassword: boolean;
	setShowPassword: (show: boolean) => void;
	showConfirmPassword: boolean;
	setShowConfirmPassword: (show: boolean) => void;
};

function RegisterFormContent({
	form,
	onSubmit,
	isLoading,
	showPassword,
	setShowPassword,
	showConfirmPassword,
	setShowConfirmPassword,
}: RegisterFormContentProps) {
	const formatPhoneNumber = (value: string) => {
		const numbers = value.replace(/\D/g, "");
		if (numbers.length <= 1) return "";

		let formatted = "+7";
		if (numbers.length > 1) {
			formatted += ` (${numbers.substring(1, 4)}`;
		}
		if (numbers.length > 4) {
			formatted += `) ${numbers.substring(4, 7)}`;
		}
		if (numbers.length > 7) {
			formatted += `-${numbers.substring(7, 9)}`;
		}
		if (numbers.length > 9) {
			formatted += `-${numbers.substring(9, 11)}`;
		}
		return formatted;
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Имя</FormLabel>
						<FormControl>
							<div className="relative">
								<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input placeholder="Иван Иванов" className="pl-10" {...field} />
							</div>
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
						<FormLabel>Телефон</FormLabel>
						<FormControl>
							<div className="relative">
								<Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									placeholder="+7 (999) 999-99-99"
									className="pl-10"
									{...field}
									onChange={(e) => {
										const formatted = formatPhoneNumber(e.target.value);
										if (formatted.length <= 18) {
											field.onChange(formatted);
										}
									}}
									value={field.value}
								/>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Email</FormLabel>
						<FormControl>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input type="email" placeholder="email@example.com" className="pl-10" {...field} />
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Пароль</FormLabel>
						<FormControl>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									type={showPassword ? "text" : "password"}
									placeholder="Придумайте пароль"
									className="pl-10 pr-10"
									{...field}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="confirmPassword"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Подтвердите пароль</FormLabel>
						<FormControl>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Повторите пароль"
									className="pl-10 pr-10"
									{...field}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? (
					<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
				) : (
					"Зарегистрироваться"
				)}
			</Button>
		</form>
	);
}
