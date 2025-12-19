export interface UserProfile {
	id: string;
	email: string;
	name: string;
	phone: string;
	avatar_url?: string;
	created_at?: string;
	updated_at?: string;
}

export interface ExtendedUser {
	id: string;
	email?: string;
	phone?: string;
	app_metadata: Record<string, unknown>;
	user_metadata: Record<string, unknown>;
	aud: string;
	confirmation_sent_at?: string;
	recovery_sent_at?: string;
	email_change_sent_at?: string;
	new_email?: string;
	new_phone?: string;
	invited_at?: string;
	action_link?: string;
	email_confirmed_at?: string;
	phone_confirmed_at?: string;
	confirmed_at?: string;
	email_change_confirm_status?: number;
	banned_until?: string;
	reAuthentication_sent_at?: string;
	is_anonymous?: boolean;
	created_at: string;
	updated_at?: string;
	is_sso_user?: boolean;
	deleted_at?: string;
	profile: UserProfile | null;
}

export type CurrentUser = ExtendedUser | null;
