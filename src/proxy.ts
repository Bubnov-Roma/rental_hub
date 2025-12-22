import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
	const { user, supabaseResponse } = await updateSession(request);

	const { pathname } = request.nextUrl;
	const protectedRoutes = ["/dashboard", "/booking"];
	const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];
	const adminRoutes = ["/admin"];

	if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
		const url = request.nextUrl.clone();
		url.pathname = "/auth/login";
		url.searchParams.set("redirect", pathname);
		return Response.redirect(url);
	}

	if (adminRoutes.some((route) => pathname.startsWith(route))) {
		const isAdmin = user?.app_metadata.role === "admin";

		if (!user || !isAdmin) {
			const url = request.nextUrl.clone();
			url.pathname = user ? "/dashboard" : "/auth/login";
			return Response.redirect(url);
		}
	}
	if (user && authRoutes.some((route) => pathname.startsWith(route))) {
		return Response.redirect(new URL("/dashboard", request.url));
	}

	return supabaseResponse;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
