import { getSupportInfo } from "@/actions/support-actions";
import { ProfileViewClient } from "@/components/dashboard/profile/ProfileViewClient";

export default async function ProfilePage() {
	const support = await getSupportInfo();
	return <ProfileViewClient support={support} />;
}
