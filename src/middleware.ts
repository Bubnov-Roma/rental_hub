import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

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
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					cookiesToSet.forEach(({ name, value, options }) => {
						response.cookies.set(name, value, options);
					});
				},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const protectedRoutes = ["/dashboard", "/booking"];
	const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];
	const { pathname } = request.nextUrl;

	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	if (!user && isProtectedRoute) {
		const redirectUrl = new URL("/auth/login", request.url);
		redirectUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(redirectUrl);
	}

	if (user && isAuthRoute) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}
	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
