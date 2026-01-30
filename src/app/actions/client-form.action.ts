"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type ClientFormValues, clientFormSchema } from "@/schemas";

export type ActionResponse = {
	success: boolean;
	message?: string;
	errors?: Record<string, string[]>;
};

export async function submitClientApplicationAction(
	data: ClientFormValues
): Promise<ActionResponse> {
	const result = clientFormSchema.safeParse(data);

	if (!result.success) {
		const formattedErrors = result.error.issues.reduce(
			(acc, issue) => {
				const path = issue.path.join(".");
				acc[path] = [issue.message];
				return acc;
			},
			{} as Record<string, string[]>
		);

		return {
			success: false,
			message: "Ошибка валидации данных",
			errors: formattedErrors,
		};
	}

	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { success: false, message: "Не авторизован" };

	try {
		const { data: profile } = await supabase
			.from("profiles")
			.select("id")
			.eq("id", user.id)
			.single();

		if (!profile) {
			// create profile if not exists
			await supabase.from("profiles").insert({
				id: user.id,
				email: user.email,
				name: user.user_metadata?.name || null,
			});
		}

		const { error } = await supabase.from("client_applications").upsert(
			{
				user_id: user.id,
				client_type: data.clientType, // 'individual' or 'legal'
				application_data: data, // save all object ClientFormValues from Zod in JSONB
				status: "pending", // update status to 'pending' on submission
				updated_at: new Date().toISOString(),
			},
			{
				onConflict: "user_id", // upsert based on user_id
			}
		);

		if (error) throw error;

		revalidatePath("/dashboard/profile");
		return { success: true, message: "Анкета успешно отправлена ✔️" };
	} catch (err) {
		console.error(err);
		return { success: false, message: "Ошибка сохранения в БД" };
	}
}
