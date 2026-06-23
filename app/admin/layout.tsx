import type { ReactNode } from "react";
import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/textes", label: "Mes textes" },
  { href: "/admin/couleurs", label: "Mes couleurs" },
  { href: "/admin/infos", label: "Mes informations" },
  { href: "/admin/messages", label: "Messages reçus" },
  { href: "/admin/leads", label: "Leads clients" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--cream)]">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[var(--hairline)] bg-white lg:flex lg:flex-col">
        <div className="border-b border-[var(--hairline)] px-6 py-5">
          <Link href="/" className="text-base font-semibold text-[var(--foreground)]">
            Norvika
          </Link>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Administration</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--cream)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[var(--hairline)] px-4 py-4">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-[var(--hairline)] bg-white px-4 py-3 lg:hidden">
          <Link href="/" className="text-sm font-semibold text-[var(--foreground)]">Norvika Admin</Link>
          <AdminLogoutButton />
        </div>
        {/* Mobile nav */}
        <div className="overflow-x-auto border-b border-[var(--hairline)] bg-white px-4 lg:hidden">
          <nav className="flex gap-1 pb-2 pt-2">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--cream)]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
