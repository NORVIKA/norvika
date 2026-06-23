import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  const { count: leadsCount } = await supabase
    .from("client_leads")
    .select("*", { count: "exact", head: true });

  const cards = [
    { label: "Messages non lus", value: count ?? 0, href: "/admin/messages", cta: "Voir les messages" },
    { label: "Leads clients", value: leadsCount ?? 0, href: "/admin/leads", cta: "Voir les leads" },
  ];

  const links = [
    { href: "/admin/textes", label: "Modifier les textes" },
    { href: "/admin/couleurs", label: "Modifier les couleurs" },
    { href: "/admin/infos", label: "Modifier les informations" },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Tableau de bord</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">Bienvenue dans l&apos;administration Norvika.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-[var(--hairline)] bg-white p-6">
            <p className="text-sm text-[var(--muted-foreground)]">{c.label}</p>
            <p className="mt-2 text-4xl font-bold text-[var(--foreground)]">{c.value}</p>
            <Link href={c.href} className="mt-4 inline-block text-sm font-medium text-[var(--brand)] hover:underline">
              {c.cta} →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--hairline)] bg-white p-6">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Raccourcis</h2>
        <ul className="mt-4 space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-[var(--brand)] hover:underline">
                {l.label} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
