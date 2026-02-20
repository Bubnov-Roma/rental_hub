import { Suspense } from "react";
import { AuthFormController } from "@/components/auth/AuthFormController";
import { RainbowSpinner } from "@/components/shared";

export default async function AuthPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const view = (params.view as string) || "login";

	return (
		<div className="container flex min-h-screen w-full items-top md:items-center justify-center py-12">
			<Suspense
				fallback={
					<div className="flex h-64 items-center justify-center">
						<RainbowSpinner />
					</div>
				}
			>
				<AuthFormController view={view} />
			</Suspense>
		</div>
	);
}
