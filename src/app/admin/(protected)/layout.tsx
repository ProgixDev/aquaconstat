import { AdminHeader, requireAdminSession } from "@/features/admin";

/**
 * Everything under /admin except the login page.
 *
 * The session check here is defence in depth and UX — it is NOT the
 * authorization boundary. Next can skip rendering a layout when the client
 * claims (in an unauthenticated `Next-Router-State-Tree` header) that the
 * segment is already mounted, and generateMetadata runs outside it entirely.
 * The real gate lives next to the data, in features/admin/data.ts.
 */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  return (
    <div className="flex min-h-dvh flex-col">
      <AdminHeader />
      {children}
    </div>
  );
}
