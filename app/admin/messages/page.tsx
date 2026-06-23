import { createSupabaseServerClient } from "@/lib/supabase-server";
import { MarkReadButton } from "./MarkReadButton";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = createSupabaseServerClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Messages reçus</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {messages?.filter((m) => !m.read).length ?? 0} message(s) non lu(s)
      </p>
      <div className="mt-8 space-y-4">
        {!messages?.length && (
          <p className="text-sm text-[var(--muted-foreground)]">Aucun message pour l&apos;instant.</p>
        )}
        {messages?.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl border p-6 ${m.read ? "border-[var(--hairline)] bg-white opacity-60" : "border-[var(--brand)]/30 bg-white"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--foreground)]">{m.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{m.email} {m.phone && `· ${m.phone}`}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">{m.message}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(m.created_at).toLocaleDateString("fr-CA")}
                </p>
                {!m.read && <MarkReadButton id={m.id} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
