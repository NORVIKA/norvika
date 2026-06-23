import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = createSupabaseServerClient();
  const { data: leads } = await supabase
    .from("client_leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Leads clients</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Coordonnées soumises via la page /bienvenue — {leads?.length ?? 0} entrée(s)
      </p>
      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--hairline)] bg-white">
        {!leads?.length ? (
          <p className="p-6 text-sm text-[var(--muted-foreground)]">Aucun lead pour l&apos;instant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--hairline)] bg-[var(--cream)]">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-[var(--muted-foreground)]">Prénom</th>
                <th className="px-6 py-3 text-left font-medium text-[var(--muted-foreground)]">Courriel</th>
                <th className="px-6 py-3 text-left font-medium text-[var(--muted-foreground)]">Téléphone</th>
                <th className="px-6 py-3 text-left font-medium text-[var(--muted-foreground)]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)]">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-[var(--cream)]">
                  <td className="px-6 py-4 text-[var(--foreground)]">{l.prenom}</td>
                  <td className="px-6 py-4"><a href={`mailto:${l.courriel}`} className="text-[var(--brand)] hover:underline">{l.courriel}</a></td>
                  <td className="px-6 py-4 text-[var(--foreground)]">{l.telephone}</td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{new Date(l.created_at).toLocaleDateString("fr-CA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
