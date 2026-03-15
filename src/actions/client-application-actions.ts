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

type ActionResponse = {
	success: boolean;
	message?: string;
	errors?: Record<string, string[]>;
};

type UpdateApplicationDataPayload = {
	field: AllowedUpdateField;
	value: unknown;
};

type UpdateApplicationDataResult =
	| { success: true }
	| { success: false; error: string };

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

export async function saveDraftAction(
	data: Partial<ClientFormValues>
): Promise<{ success: boolean; error?: string }> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return { success: false, error: "Unauthorized" };

		await supabase
			.from("profiles")
			.upsert(
				{ id: user.id, email: user.email },
				{ onConflict: "id", ignoreDuplicates: true }
			);

		const { error } = await supabase.from("client_applications").upsert(
			{
				user_id: user.id,
				client_type: data.clientType ?? "individual",
				application_data: data,
				status: "draft",
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "user_id" }
		);

		if (error) {
			// Row exists with non-draft status — only patch data, keep status
			const { error: patchErr } = await supabase
				.from("client_applications")
				.update({
					application_data: data,
					updated_at: new Date().toISOString(),
				})
				.eq("user_id", user.id)
				.eq("status", "draft");

			if (patchErr) return { success: false, error: patchErr.message };
		}

		return { success: true };
	} catch (err) {
		console.error("saveDraftAction:", err);
		return { success: false, error: "Server error" };
	}
}

export async function loadDraftAction(): Promise<{
	data: Partial<ClientFormValues> | null;
	status: string | null;
}> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return { data: null, status: null };

		const { data } = await supabase
			.from("client_applications")
			.select("application_data, status")
			.eq("user_id", user.id)
			.maybeSingle();

		return {
			data: (data?.application_data as Partial<ClientFormValues>) ?? null,
			status: data?.status ?? null,
		};
	} catch {
		return { data: null, status: null };
	}
}

// ─── User admin actions ───────────────────────────────────────────────────────

export async function updateUserRoleAction(
	userId: string,
	role: string,
	permissions?: Record<string, boolean>
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const updates: Record<string, unknown> = { role };
	if (permissions !== undefined) updates.permissions = permissions;
	const { error } = await supabase
		.from("profiles")
		.update(updates)
		.eq("id", userId);
	if (error) return { success: false, error: error.message };
	revalidatePath("/admin/users");
	return { success: true };
}

export async function toggleUserBlockAction(
	userId: string,
	isBlocked: boolean,
	reason?: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const { error } = await supabase
		.from("profiles")
		.update({
			is_blocked: isBlocked,
			blocked_reason: isBlocked ? (reason ?? null) : null,
		})
		.eq("id", userId);
	if (error) return { success: false, error: error.message };
	revalidatePath("/admin/users");
	return { success: true };
}

export async function addUserAdminNoteAction(
	userId: string,
	note: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	const { error } = await supabase.from("user_admin_notes").insert({
		user_id: userId,
		author_id: user?.id ?? null,
		note: note.trim(),
	});
	if (error) return { success: false, error: error.message };
	return { success: true };
}

export async function getUserAdminNotesAction(userId: string) {
	const supabase = await createClient();
	const { data } = await supabase
		.from("user_admin_notes")
		.select("*, profiles!author_id(name)")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });
	return data ?? [];
}

export async function createUserDiscountAction(data: {
	user_id: string;
	type: "percent" | "fixed" | "promo";
	value: number;
	promo_code?: string | undefined;
	description?: string | undefined;
	valid_until?: string | undefined;
}): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	const { error } = await supabase.from("user_discounts").insert({
		...data,
		created_by: user?.id ?? null,
	});
	if (error) return { success: false, error: error.message };
	revalidatePath("/admin/users");
	return { success: true };
}
