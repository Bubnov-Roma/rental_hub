import { type ZodType, z } from "zod";

const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
const phoneRegex = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
const nicknameRegex = /^@[a-zA-Z0-9._]{1,32}$/;
const tgRegex = /^(https?:\/\/t\.me\/|@)[a-zA-Z0-9_]{1,32}$/;
const vkRegex = /^(https?:\/\/vk\.com\/[a-zA-Z0-9_.]+|@[a-zA-Z0-9_.]+)$/;
const waRegex = /^(https?:\/\/wa\.me\/|7|8)\d{10}$/;

export const emailSchema = z.email("Введите корректный email").toLowerCase();

const dateSchema = z
	.string()
	.min(10, "Укажите дату")
	.regex(dateRegex, "ДД.ММ.ГГГГ")
	.refine(
		(val) => {
			const [day, month, year] = val.split(".").map(Number);
			if (!year || !month || !day) return false;
			const birthDate = new Date(year, month - 1, day);

			const today = new Date();

			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();

			if (
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
			) {
				age--;
			}

			return age >= 16 && age <= 100;
		},
		{
			message: "Введите корректную дату",
		}
	);

const phoneSchema = z
	.string()
	.min(1, "Укажите номер телефона")
	.transform((val) => val.replace(/\s/g, ""))
	.pipe(z.string().regex(phoneRegex, "Укажите полный номер"));

export const socialMediaSchema = z.discriminatedUnion("platform", [
	z.object({
		platform: z.literal("Telegram"),
		url: z.string().regex(tgRegex, "Введите ссылку t.me/... или @username"),
	}),
	z.object({
		platform: z.literal("VK"),
		url: z.string().regex(vkRegex, "Введите ссылку vk.com/... или @username"),
	}),
	z.object({
		platform: z.literal("Whatsapp"),
		url: z.string().regex(waRegex, "Введите номер (7...) или ссылку wa.me/..."),
	}),
	z.object({
		platform: z.enum(["Instagram", "Max", "Facebook"]),
		url: z.string().refine(
			(val) => {
				const isUrl = z.url().safeParse(val).success;
				const isNickname = nicknameRegex.test(val);
				return isUrl || isNickname;
			},
			{
				message: "Укажите корректную ссылку или @nickname",
			}
		),
	}),
]);

const personalDataSchema = z.object({
	name: z.string().min(6, "Введите полное ФИО"),
	birth: dateSchema,
	maritalStatus: z.enum(["single", "married"], {
		error: "Выберите вариант",
	}),
	email: emailSchema,
	phone: phoneSchema,
});

const passportSchema = z.object({
	seriesAndNumber: z
		.string()
		.transform((val) => val.replace(/\D/g, ""))
		.pipe(z.string().length(10, "Серия и номер - 10 цифр")),
	issueDate: dateSchema,
	issuedBy: z.string().min(10, "Укажите кем выдан документ"),
});

const emergencyContactSchema = z.object({
	name: z.string().min(2, "Укажите имя и статус"),
	relation: z.string().optional(),
	phone: phoneSchema,
});

export type SocialPlatform = z.infer<typeof socialMediaSchema>["platform"];

const professionalSchema = z.object({
	workplace: z.string().min(3, "Укажите место работы или 'фриланс'"),
	position: z
		.string()
		.min(2, "Укажите вашу должность")
		.optional()
		.or(z.literal("")),
	companyWebsite: z.url().optional().or(z.literal("")),
	monthlyIncome: z.string().min(4, "Укажите доход в месяц"),
	workPhone: phoneSchema.optional().or(z.literal("")),
});

const experienceSchema = z.object({
	equipment: z.preprocess(
		(val) => (val === undefined || val === null ? [] : val),
		z
			.array(
				z.enum([
					"nikon",
					"canon",
					"sony",
					"panasonic",
					"fujifilm",
					"blackmagic",
					"arri",
					"red",
					"gopro",
					"insta",
					"iphone",
					"hasselblad",
					"other",
				])
			)
			.min(1, "Выберите вариант")
	) as ZodType,
	photographyExperience: z.enum(["hobby", "0-3years", "3+years"], {
		error: "Выберите вариант",
	}),
});

const promoAndAgreementsSchema = z.object({
	promoCode: z.string().optional(),
	newsletter: z.boolean().optional(),
});

const bankDetailsSchema = z.object({
	accountNumber: z.string().min(20, "20 символов"),
	bankName: z.string().min(2, "Название банка"),
	bik: z.string().length(9, "БИК: 9 цифр"),
	corrAccount: z.string().min(20, "20 символов"),
});

const addressSchema = z.object({
	index: z.string().regex(/^\d{6}$/, "6 цифр"),
	country: z.string().min(2, "Укажите страну"),
	region: z.string().min(2, "Укажите регион"),
	city: z.string().min(2, "Укажите город"),
	address: z.string().min(2, "Укажите улицу, номер дома и квартиру"),
});
export type Address = z.infer<typeof addressSchema>;

const addressesBlockSchema = z
	.object({
		registration: addressSchema,
		actual: addressSchema.partial(),
		isSame: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (!data.isSame) {
			const actual = data.actual;
			const requiredFields: (keyof Address)[] = [
				"index",
				"region",
				"city",
				"country",
				"address",
			];

			requiredFields.forEach((field) => {
				if (!actual[field] || actual[field]?.trim() === "") {
					ctx.addIssue({
						code: "custom",
						message: "Обязательное поле",
						path: ["actual", field],
					});
				}
			});

			if (actual.index && actual.index.length !== 6) {
				ctx.addIssue({
					code: "custom",
					message: "6 цифр",
					path: ["actual", "index"],
				});
			}
		}
	});

const additionalSchema = z.object({
	work: professionalSchema,
	experience: experienceSchema,
	referralSource: z.enum(
		["search_engine", "vk", "website", "friends", "photo_school", "other"],
		{ error: "Выберите вариант" }
	),
	recommendation: z.string().optional(),
	photoSchool: z.string().optional(),
	referralSourceOther: z.string().optional(),
});

export const equipmentSchema = z.object({
	title: z.string().min(2, "Название позиции"),
	description: z.string().min(10, "Описание позиции"),
	inventoryNumber: z.string().min(1, "Инвентарный номер"),
	estimatedValue: z.number().min(0, "Оценочная стоимость"),
	configuration: z.string().min(1, "Комплектация (или пробел)"),
	defects: z.string().min(1, "Дефекты (или пробел)"),
	photo: z.url("Загрузите фото"),
	category: z.string().min(1, "Категория"),
	dailyRate: z.number().min(0, "Ориеентировочная стоимость в сутки").optional(),
});

export type EquipmentSchemaType = z.infer<typeof equipmentSchema>;

// --------------- Base Contacts for Individual ---------------
const individualContactsSchema = z.object({
	socials: z.array(socialMediaSchema).min(1, "Укажите хотя бы одну соцсеть"),
	emergency: z.array(emergencyContactSchema).min(2, "Минимум 2 контакта"),
});

//   --------------- INDIVIDUAL CLIENT SCHEMA ---------------

export const individualClientSchema = z.object({
	clientType: z.literal("individual"),
	applicationData: z.object({
		personalData: personalDataSchema,
		passport: passportSchema,
		contacts: individualContactsSchema,
		addresses: addressesBlockSchema,
	}),
	additional: additionalSchema,
	agreements: promoAndAgreementsSchema,
});

// --------------- INDIVIDUAL PARTNER SCHEMA ---------------
export const individualPartnerSchema = individualClientSchema.extend({
	clientType: z.literal("individual_partner"),
	isPartner: z.literal(true),
	partnerEquipment: z
		.array(equipmentSchema)
		.min(1, "Добавьте минимум 1 единицу техники"),
	partnerAgreement: z.boolean().refine((val) => val === true, {
		message: "Необходимо подтверждение согласия с условиями партнерства",
	}),
});

//        --------------- LEGAL CLIENT SCHEMA ---------------

export const legalClientSchema = z.object({
	clientType: z.literal("legal"),
	// Company
	company: z.object({
		companyName: z.string().min(2, "Наименование организации"),
		companyType: z.enum(["ip", "ooo", "nko", "ao"]),
		companyPhone: phoneSchema,
		companyEmail: emailSchema,
		companyWebsite: z.url().optional().or(z.literal("")),
	}),

	// Leader
	director: z.object({
		name: z.string().min(1, "ФИО руководителя"),
		nameGenitive: z.string().min(5, "ФИО в родительном падеже"),
		position: z.enum(["director", "general_director", "manager", "custom"]),
		customPosition: z.string().optional(),
		basedOn: z.enum(["charter", "power_of_attorney", "custom"]),
		customBasedOn: z.string().optional(),
	}),

	// Details
	details: z.object({
		inn: z.string().regex(/^\d{10}$|^\d{12}$/, "ИНН: 10 или 12 цифр"),
		ogrn: z.string().min(13, "ОГРН/ОГРНИП"),
		kpp: z.string().min(9, "КПП"),
		okpo: z.string().optional(),
	}),

	// Addresses
	address: addressesBlockSchema,

	// Bank
	bankDetails: bankDetailsSchema,

	// Contact person
	contactPerson: z.object({
		personalData: personalDataSchema,
		passport: passportSchema,
		registrationAddress: addressSchema,
		residentialAddress: addressSchema,
		sameAsRegistration: z.boolean().optional(),
		email: emailSchema,
		phone: phoneSchema,
	}),
	agreements: promoAndAgreementsSchema,
});
//   --------------- LEGAL PARTNER SCHEMA ---------------
export const legalPartnerSchema = legalClientSchema.extend({
	clientType: z.literal("legal_partner"),
	isPartner: z.literal(true),
	partnerEquipment: z
		.array(equipmentSchema)
		.min(1, "Добавьте минимум 1 единицу техники"),
	partnerAgreement: z.boolean().refine((val) => val === true, {
		message: "Необходимо подтверждение согласия с условиями партнерства",
	}),
});

// --------------- GENERAL CLIENT SCHEMA ---------------
export const clientFormSchema = z.discriminatedUnion("clientType", [
	individualClientSchema,
	legalClientSchema,
	individualPartnerSchema,
	legalPartnerSchema,
]);

export type IndividualClient = z.infer<typeof individualClientSchema>;
export type LegalClient = z.infer<typeof legalClientSchema>;
export type IndividualPartner = z.infer<typeof individualPartnerSchema>;
export type LegalPartner = z.infer<typeof legalPartnerSchema>;
export type ClientFormValues = z.infer<typeof clientFormSchema>;

// const identitySchema = z
// 	.object({
// 		personalData: personalDataSchema,
// 		passport: passportSchema,
// 	})
// 	.superRefine((data, ctx) => {
// 		const birthStr = data.personalData?.birth;
// 		const issueStr = data.passport?.issueDate;

// 		// Проверяем только если обе даты заполнены
// 		if (birthStr?.length === 10 && issueStr?.length === 10) {
// 			const birth = parseDate(birthStr);
// 			const issue = parseDate(issueStr);

// 			if (birth && issue && issue <= birth) {
// 				ctx.addIssue({
// 					code: "custom",
// 					message: "Дата выдачи не может быть раньше даты рождения",
// 					// Путь теперь четкий, так как мы внутри этого объекта
// 					path: ["passport", "issueDate"],
// 				});
// 			}
// 		}
// 	});

// const applicationDataSchema = z.object({
// 	clientType: z.literal("individual"),
// 	personalData: personalDataSchema,
// 	passport: passportSchema,
// 	contacts: individualContactsSchema,
// 	addresses: addressesBlockSchema,
// });
// .superRefine(validatePassportDates);

//   --------------- INDIVIDUAL CLIENT DASE SCHEMA ---------------

// export const individualClientSchema = individualClientBaseSchema;

// const parseDate = (dateStr: string | undefined): Date | null => {
// 	if (!dateStr || dateStr.length < 10) return null;

// 	const parts = dateStr.split(".");
// 	if (
// 		parts.length !== 3 ||
// 		parts[0] === undefined ||
// 		parts[1] === undefined ||
// 		parts[2] === undefined
// 	) {
// 		return null;
// 	} else {
// 		const d = parseInt(parts[0], 10);
// 		const m = parseInt(parts[1], 10);
// 		const y = parseInt(parts[2], 10);

// 		// Проверяем, что все части — числа
// 		if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null;

// 		const date = new Date(y, m - 1, d);

// 		// Проверяем, что объект даты корректен (например, не 32.13.2024)
// 		return Number.isNaN(date.getTime()) ? null : date;
// 	}
// };

// type ApplicationDataBlock = {
// 	personalData: { birth: string };
// 	passport: { issueDate: string };
// };

// const validatePassportDates = (
// 	data: ApplicationDataBlock,
// 	ctx: z.RefinementCtx
// ) => {
// 	const birthStr = data.personalData?.birth;
// 	const issueStr = data.passport?.issueDate;

// 	if (birthStr?.length === 10 && issueStr?.length === 10) {
// 		const birth = parseDate(birthStr);
// 		const issue = parseDate(issueStr);

// 		if (birth && issue && issue <= birth) {
// 			ctx.addIssue({
// 				code: "custom",
// 				message: "Дата выдачи не может быть раньше даты рождения",
// 				path: ["passport", "issueDate"],
// 			});
// 		}
// 	}
// };

// const individualClientSchema = z.object({
// 	clientType: z.literal("individual"),
// 	applicationData: applicationDataSchema,
// 	additional: additionalSchema,
// 	agreements: promoAndAgreementsSchema,
// });
