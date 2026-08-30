import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, HeartHandshake, Medal, ShieldAlert, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { formatDate, greeting, monthLabel } from "@/lib/app";
import { EmptyState, ListSkeleton, PageHeader, SantriRow, ScoreBadge, StatCard } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SantriOS" },
      { name: "description", content: "Ringkasan perkembangan santri hari ini." },
      { property: "og:title", content: "Dashboard — SantriOS" },
      { property: "og:description", content: "Ringkasan perkembangan santri hari ini." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, email } = useSession();
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [santri, ach, inc, guid, warn] = await Promise.all([
        supabase.from("santri").select("id", { count: "exact", head: true }).eq("status", "Aktif"),
        supabase.from("achievements").select("id", { count: "exact", head: true }).gte("tanggal", since),
        supabase.from("incidents").select("id", { count: "exact", head: true }).gte("tanggal", since),
        supabase.from("guidance").select("id", { count: "exact", head: true }).eq("status", "Active"),
        supabase.from("early_warnings").select("id", { count: "exact", head: true }).eq("status", "Open"),
      ]);
      return {
        santri: santri.count ?? 0,
        achievements: ach.count ?? 0,
        incidents: inc.count ?? 0,
        guidance: guid.count ?? 0,
        warnings: warn.count ?? 0,
      };
    },
  });

  const top = useQuery({
    queryKey: ["dashboard-top"],
    queryFn: async () =>
      (
        await supabase
          .from("v_santri_overview")
          .select("id, nama, nis, kelas_nama, growth_score")
          .eq("status", "Aktif")
          .order("growth_score", { ascending: false })
          .limit(5)
      ).data ?? [],
  });

  const warnings = useQuery({
    queryKey: ["dashboard-warnings"],
    queryFn: async () =>
      (
        await supabase
          .from("early_warnings")
          .select("id, severity, reason, created_at, santri:santri_id(id, nama, nis)")
          .eq("status", "Open")
          .order("created_at", { ascending: false })
          .limit(5)
      ).data ?? [],
  });

  const recent = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: async () =>
      (
        await supabase
          .from("point_ledger")
          .select("id, description, points, dimension, occurred_at, santri:santri_id(id, nama)")
          .order("occurred_at", { ascending: false })
          .limit(8)
      ).data ?? [],
  });

  const name = profile?.full_name?.split(" ")[0] || email?.split("@")[0] || "";

  return (
    <div className="rise-in">
      <PageHeader title={`${greeting()}, ${name}`} description={`Ringkasan ${monthLabel()}`} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Santri Aktif" value={stats.data?.santri ?? "—"} icon={<Users className="size-4" />} />
        <StatCard
          label="Prestasi 30 hari"
          value={stats.data?.achievements ?? "—"}
          tone="success"
          icon={<Medal className="size-4" />}
        />
        <StatCard
          label="Incident 30 hari"
          value={stats.data?.incidents ?? "—"}
          tone="warning"
          icon={<ShieldAlert className="size-4" />}
        />
        <StatCard label="Pembinaan Aktif" value={stats.data?.guidance ?? "—"} icon={<HeartHandshake className="size-4" />} />
        <StatCard
          label="Early Warning"
          value={stats.data?.warnings ?? "—"}
          tone="destructive"
          icon={<AlertTriangle className="size-4" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Aktivitas Terbaru</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/growth">Lihat semua</Link>
            </Button>
          </div>
          {recent.isLoading ? (
            <ListSkeleton />
          ) : !recent.data?.length ? (
            <EmptyState title="Belum ada aktivitas" description="Catat prestasi atau kejadian lewat tombol Record." />
          ) : (
            <ul className="space-y-2">
              {recent.data.map((r) => (
                <li key={r.id} className="surface flex items-center gap-3 p-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                      r.points >= 0 ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive"
                    }`}
                  >
                    {r.points > 0 ? `+${r.points}` : r.points}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {(r.santri as { nama?: string } | null)?.nama ?? "Santri"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{r.description}</p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {formatDate(r.occurred_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Top Growth</h2>
              <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
            </div>
            {top.isLoading ? (
              <ListSkeleton rows={3} />
            ) : (
              <ul className="space-y-2">
                {top.data?.map((s) => (
                  <li key={s.id as string}>
                    <SantriRow
                      id={s.id as string}
                      nama={s.nama ?? ""}
                      nis={s.nis}
                      meta={s.kelas_nama ?? ""}
                      right={<ScoreBadge score={s.growth_score} />}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="font-display mb-3 text-lg font-semibold">Perlu Perhatian</h2>
            {warnings.isLoading ? (
              <ListSkeleton rows={3} />
            ) : !warnings.data?.length ? (
              <EmptyState title="Semua aman" />
            ) : (
              <ul className="space-y-2">
                {warnings.data.map((w) => {
                  const s = w.santri as { id?: string; nama?: string; nis?: string } | null;
                  return (
                    <li key={w.id}>
                      <SantriRow
                        id={s?.id ?? ""}
                        nama={s?.nama ?? "Santri"}
                        nis={s?.nis ?? null}
                        meta={w.reason ?? ""}
                        right={
                          <Badge
                            variant="secondary"
                            className={w.severity === "high" ? "bg-destructive/12 text-destructive" : "bg-warning/15 text-warning"}
                          >
                            {w.severity}
                          </Badge>
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
