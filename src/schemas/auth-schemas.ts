import * as z from "zod";

// Basic password schema
export const passwordSchema = z
	.string()
	.min(8, "Пароль должен содержать минимум 8 символов")
	.refine((password) => /[A-ZА-Я]/.test(password), {
		message: "Добавьте хотя бы одну заглавную букву",
	})
	.refine((password) => /[a-zа-я]/.test(password), {
		message: "Добавьте хотя бы одну строчную букву",
	})
	.refine((password) => /\d/.test(password), {
		message: "Добавьте хотя бы одну цифру",
	})
	.refine((password) => /^[A-Za-zА-Яа-я\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/.test(password), {
		message: "Используйте только буквы, цифры и специальные символы",
	});

// Base email schema
export const emailSchema = z.email("Введите корректный email").toLowerCase().trim();

// Base phone schema
export const phoneSchema = z
	.string()
	.min(10, "Введите корректный номер телефона")
	.regex(/^[\d\s+\-()]+$/, "Номер телефона должен содержать только цифры и специальные символы");

// Login schema
export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});
// Registration schema
export const registerSchema = loginSchema
	.extend({
		name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
		phone: phoneSchema,
		confirmPassword: passwordSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
