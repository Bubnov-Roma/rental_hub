import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const next = searchParams.get("next") ?? "/dashboard";

	if (code) {
		const cookieStore = await cookies();
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL || "",
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options);
						});
					},
				},
			}
		);

		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			const isInternal = next.startsWith("/") && !next.startsWith("//");
			const safeNext = isInternal ? next : "/dashboard";
			return NextResponse.redirect(`${origin}${safeNext}`);
		} else {
			return NextResponse.redirect(
				`${origin}/auth?view=login&error=${encodeURIComponent(error.message)}`
			);
		}
	}
	return NextResponse.redirect(
		`${origin}/auth?view=login&error=auth_code_error`
	);
}
