// Middleware (middleware.ts) handles all auth checks and redirects for /admin.
// This layout simply renders children.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
