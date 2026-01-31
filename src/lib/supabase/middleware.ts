import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					/* Устанавливаем куки в объект запроса */
					cookiesToSet.forEach(({ name, value }) => {
						request.cookies.set(name, value);
					});
					/* Создаем ответ Supabase */
					supabaseResponse = NextResponse.next({ request });
					/* Устанавливаем куки в ответ Supabase */
					cookiesToSet.forEach(({ name, value, options }) => {
						supabaseResponse.cookies.set(name, value, options);
					});
				},
			},
		}
	);

	try {
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError?.message.includes("fetch")) {
			return { supabaseResponse, user: null };
		}
		const url = request.nextUrl.clone();
		const { pathname } = url;
		/* Paths */
		const isAuthRoute = pathname.startsWith("/auth");
		const isAdminRoute = pathname.startsWith("/admin");
		const isProtectedRoute =
			pathname.startsWith("/dashboard") || pathname.startsWith("/booking");
		/* check network */
		if (userError?.message.includes("fetch")) {
			return { supabaseResponse, user: null };
		}
		/* Redirect unauthorized */
		if (!user && (isProtectedRoute || isAdminRoute)) {
			url.pathname = "/auth";
			url.searchParams.set("view", "contact");
			url.searchParams.set("redirect", pathname);
			return { supabaseResponse: NextResponse.redirect(url), user: null };
		}
		/* Checking roles in the database for the admin panel */
		if (user && isAdminRoute) {
			const { data: profile } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", user.id)
				.single();

			if (profile?.role !== "admin" && profile?.role !== "manager") {
				url.pathname = "/dashboard";
				return { supabaseResponse: NextResponse.redirect(url), user };
			}
		}
		/*  Redirect authorized users from login pages */
		if (user && isAuthRoute) {
			if (
				!pathname.startsWith("/auth/callback") &&
				!pathname.startsWith("/auth/confirm")
			) {
				url.pathname = "/dashboard";
				return { supabaseResponse: NextResponse.redirect(url), user };
			}
		}
		return { supabase, user, supabaseResponse };
	} catch {
		return { supabaseResponse, user: null };
	}
}
