import type { Metadata } from "next";
import { ClientForm } from "@/components/forms";

export const metadata: Metadata = {
	title: "Верификация профиля | Linza",
	description: "Заполните анкету для аренды без залога",
};

export default function VerificationPage() {
	return <ClientForm />;
}
