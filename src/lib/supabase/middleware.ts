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
					cookiesToSet.forEach(({ name, value }) => {
						request.cookies.set(name, value);
					});
					supabaseResponse = NextResponse.next({ request });
					cookiesToSet.forEach(({ name, value, options }) => {
						supabaseResponse.cookies.set(name, value, options);
					});
				},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();
	const url = request.nextUrl.clone();
	const { pathname } = url;

	// Paths
	const isAuthRoute = pathname.startsWith("/auth");
	const isAdminRoute = pathname.startsWith("/admin");
	const isProtectedRoute =
		pathname.startsWith("/dashboard") || pathname.startsWith("/booking");

	// 1. Redirect unauthorized
	if (!user && (isProtectedRoute || isAdminRoute)) {
		url.pathname = "/auth/login";
		url.searchParams.set("redirect", pathname);
		return { supabaseResponse: NextResponse.redirect(url), user: null };
	}

	// 2.Checking ROLES in the database for the admin panel
	if (user && isAdminRoute) {
		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single();

		const role = profile?.role;

		if (role !== "admin" && role !== "manager") {
			url.pathname = "/dashboard";
			return { supabaseResponse: NextResponse.redirect(url), user };
		}
	}

	// 3. Redirect authorized users from login pages
	if (user && isAuthRoute) {
		url.pathname = "/dashboard";
		return { supabaseResponse: NextResponse.redirect(url), user };
	}

	return { supabase, user, supabaseResponse };
}
