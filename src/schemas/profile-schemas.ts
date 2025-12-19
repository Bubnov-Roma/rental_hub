import * as z from "zod";

const baseProfileSchema = z.object({
	personal: z.object({
		lastName: z.string().min(1, "Фамилия должна содержать минимум 1 символ"),
		firstName: z.string().min(1, "Имя должно содержать минимум 1 символ"),
		middleName: z.string().optional(),
	}),

	passport: z.object({
		series: z.string().length(4, "Серия паспорта должна содержать 4 цифры"),
		number: z.string().length(6, "Номер паспорта должен содержать 6 цифр"),
		issuedBy: z.string().min(5, "Укажите кем выдан паспорт"),
		issueDate: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Дата должна быть в формате ДД.ММ.ГГГГ"),
		departmentCode: z
			.string()
			.regex(/^\d{3}-\d{3}$/, "Код подразделения должен быть в формате XXX-XXX"),
	}),

	email: z.string().email("Введите корректный email"),
	phone: z.string().min(10, "Введите корректный номер телефона"),

	registrationAddress: z.object({
		postalCode: z.string().regex(/^\d{6}$/, "Индекс должен содержать 6 цифр"),
		region: z.string().min(2, "Укажите область"),
		city: z.string().min(2, "Укажите город"),
		district: z.string().optional(),
		street: z.string().min(2, "Укажите улицу"),
		house: z.string().min(1, "Укажите номер дома"),
		building: z.string().optional(),
		apartment: z.string().optional(),
	}),

	actualAddress: z.object({
		postalCode: z.string().regex(/^\d{6}$/, "Индекс должен содержать 6 цифр"),
		region: z.string().min(2, "Укажите область"),
		city: z.string().min(2, "Укажите город"),
		district: z.string().optional(),
		street: z.string().min(2, "Укажите улицу"),
		house: z.string().min(1, "Укажите номер дома"),
		building: z.string().optional(),
		apartment: z.string().optional(),
	}),

	sameAsRegistration: z.boolean(),

	equipmentType: z.enum(["car", "motorcycle", "scooter", "bicycle", "other"]),
	equipmentTypeOther: z.string().optional(),
	rentalPeriod: z.enum(["daily", "weekly", "monthly", "long_term"]),

	employment: z.object({
		company: z.string().min(2, "Укажите место работы"),
		position: z.string().min(2, "Укажите должность"),
		salary: z
			.number()
			.min(15000, "Зарплата должна быть не менее 15000")
			.max(1000000, "Укажите реалистичную зарплату"),
		website: z.string().url("Введите корректный URL").optional().or(z.literal("")),
	}),

	socialLinks: z
		.array(
			z.object({
				url: z.string().url("Введите корректный URL"),
				type: z.enum(["vk", "telegram", "instagram", "whatsapp", "facebook", "other"]),
			})
		)
		.min(1, "Добавьте хотя бы одну соцсеть"),

	emergencyContact: z.object({
		name: z.string().min(2, "Укажите имя контактного лица"),
		phone: z.string().min(10, "Введите корректный номер телефона"),
		relationship: z.enum(["mother", "father", "spouse", "sibling", "friend", "colleague", "other"]),
		relationshipOther: z.string().optional(),
	}),

	referralSource: z.enum(["search", "social", "friend", "ad", "other"]),
	referralSourceOther: z.string().optional(),
	promoCode: z.string().optional(),
	consentPersonalData: z.boolean(),
	consentMarketing: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof baseProfileSchema>;

export const validatedProfileSchema = baseProfileSchema
	.refine((data) => data.consentPersonalData === true, {
		message: "Необходимо согласие на обработку персональных данных",
		path: ["consentPersonalData"],
	})
	.refine(
		(data) => {
			if (data.equipmentType === "other" && !data.equipmentTypeOther) {
				return false;
			}
			return true;
		},
		{
			message: "Укажите тип техники",
			path: ["equipmentTypeOther"],
		}
	)
	.refine(
		(data) => {
			if (data.referralSource === "other" && !data.referralSourceOther) {
				return false;
			}
			return true;
		},
		{
			message: "Укажите источник",
			path: ["referralSourceOther"],
		}
	)
	.refine(
		(data) => {
			if (
				data.emergencyContact.relationship === "other" &&
				!data.emergencyContact.relationshipOther
			) {
				return false;
			}
			return true;
		},
		{
			message: "Укажите родство",
			path: ["emergencyContact.relationshipOther"],
		}
	)
	.refine(
		(data) => {
			if (data.sameAsRegistration) {
				return JSON.stringify(data.registrationAddress) === JSON.stringify(data.actualAddress);
			}
			return true;
		},
		{
			message: "Адреса должны совпадать",
			path: ["actualAddress"],
		}
	);

export const refinedProfileSchema = validatedProfileSchema;
