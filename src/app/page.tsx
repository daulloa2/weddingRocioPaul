// app/invitation/page.tsx
import InvitationClient from "@/components/InvitationClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const familyIdFromUrl = typeof sp.id === "string" ? sp.id : undefined;

  return <InvitationClient familyIdFromUrl={familyIdFromUrl} />;
}
