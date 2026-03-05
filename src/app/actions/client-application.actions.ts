"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
	type ClientFormValues,
	clientFormSchema,
	type IndividualClient,
	individualClientSchema,
} from "@/schemas";
import type { AllowedUpdateField } from "@/types";

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

export type UpdateApplicationDataPayload = {
	field: AllowedUpdateField;
	value: unknown;
};

export type UpdateApplicationDataResult =
	| { success: true }
	| { success: false; error: string };

export async function updateApplicationDataAction(
	payload: UpdateApplicationDataPayload
): Promise<UpdateApplicationDataResult> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { success: false, error: "Не авторизован" };

	// 1. Load current application — must be in an approved/reviewed state
	const { data: row, error: fetchErr } = await supabase
		.from("client_applications")
		.select("application_data, status")
		.eq("user_id", user.id)
		.single();

	if (fetchErr || !row) {
		return { success: false, error: "Анкета не найдена" };
	}

	const allowedStatuses = [
		"approved",
		"standard",
		"reviewing",
		"clarification",
		"pending",
		"rejected",
	];
	if (!allowedStatuses.includes(row.status)) {
		return {
			success: false,
			error: "Статус анкеты не позволяет вносить изменения",
		};
	}

	// 2. Deep-merge the new value into the existing JSONB at the given path
	const current = row.application_data as IndividualClient;
	const updated = deepSet(current, payload.field, payload.value);

	// 3. Re-validate the full schema so we never store invalid data
	const parsed = individualClientSchema.safeParse(updated);
	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0]?.message ?? "Ошибка валидации";
		return { success: false, error: firstIssue };
	}

	// 4. Persist — status stays untouched (use a dedicated column to track updates)
	const { error: upsertErr } = await supabase
		.from("client_applications")
		.update({
			application_data: parsed.data,
			// Mark that client data was self-updated so admins can see it
			updated_at: new Date().toISOString(),
			// Optional: if you add a `data_updated_by_client_at` column, set it here too
		})
		.eq("user_id", user.id);

	if (upsertErr) return { success: false, error: upsertErr.message };

	// 5. Notify admins via a dedicated notifications table
	//    (create this table if it doesn't exist — see migration note below)
	await supabase.from("admin_notifications").insert({
		type: "application_data_updated",
		user_id: user.id,
		payload: {
			field: payload.field,
			// Do NOT include the actual value here — just the field name and timestamp
			// so admins know to look at the application without storing sensitive data twice
		},
		created_at: new Date().toISOString(),
		is_read: false,
	});

	revalidatePath("/dashboard/profile");
	return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Immutably sets a deeply-nested value by dot-path.
 * E.g. deepSet(obj, "a.b.c", 42) → { ...obj, a: { ...obj.a, b: { ...obj.a.b, c: 42 } } }
 */
function deepSet(
	obj: Record<string, unknown>,
	path: string,
	value: unknown
): Record<string, unknown> {
	const keys = path.split(".");
	const [head, ...rest] = keys;
	if (!head) return obj;
	if (rest.length === 0) {
		return { ...obj, [head]: value };
	}
	return {
		...obj,
		[head]: deepSet(
			(obj[head] as Record<string, unknown>) ?? {},
			rest.join("."),
			value
		),
	};
}
