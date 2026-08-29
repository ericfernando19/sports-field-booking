import { requireAuth } from "@/lib/permissions";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <>{children}</>;
}
