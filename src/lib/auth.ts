import { supabase } from "./supabase";

export async function getCurrentUser() {
	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) throw error;

		if (!user) return null;

		// Получаем дополнительную информацию о пользователе
		const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();

		return {
			...user,
			profile,
		};
	} catch (error) {
		console.error("Error getting current user:", error);
		return null;
	}
}

export async function signIn(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw error;
	return data;
}

export async function signUp(email: string, password: string, name: string, phone: string) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				name,
				phone,
			},
		},
	});

	if (error) throw error;

	// Создаем профиль пользователя
	if (data.user) {
		await supabase.from("users").insert([
			{
				id: data.user.id,
				email,
				name,
				phone,
				avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
			},
		]);
	}

	return data;
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function resetPassword(email: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${window.location.origin}/reset-password`,
	});

	if (error) throw error;
}
