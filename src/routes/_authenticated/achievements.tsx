import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Medal, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { csvDownload, formatDate } from "@/lib/app";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/common";
import { QuickRecord } from "@/components/quick-record";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Prestasi — SantriOS" },
      { name: "description", content: "Achievement Wall: seluruh prestasi santri." },
      { property: "og:title", content: "Prestasi — SantriOS" },
      { property: "og:description", content: "Achievement Wall: seluruh prestasi santri." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ["achievements", term],
    queryFn: async () => {
      let q = supabase
        .from("achievements")
        .select(
          "id, event_name, hasil, organizer, tanggal, points, santri:santri_id(id, nama, nis), category:category_id(nama), level:level_id(nama)",
        )
        .order("tanggal", { ascending: false })
        .limit(60);
      if (term.trim()) q = q.ilike("event_name", `%${term.trim()}%`);
      return (await q).data ?? [];
    },
  });

  async function exportCsv() {
    const rows = (list.data ?? []).map((a) => ({
      tanggal: a.tanggal,
      santri: (a.santri as { nama?: string } | null)?.nama ?? "",
      kegiatan: a.event_name,
      hasil: a.hasil,
      poin: a.points,
    }));
    csvDownload("prestasi.csv", rows);
  }

  return (
    <div className="rise-in">
      <PageHeader
        title="Achievement Wall"
        description="Rayakan capaian santri"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void exportCsv()}>
              <Download className="size-4" aria-hidden />
              Export
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Tambah
            </Button>
          </div>
        }
      />

      <Input
        placeholder="Cari kegiatan"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="mb-4 max-w-sm"
        aria-label="Cari prestasi"
      />

      {list.isLoading ? (
        <ListSkeleton rows={6} />
      ) : !list.data?.length ? (
        <EmptyState title="Belum ada prestasi" description="Catat prestasi pertama santri." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.data.map((a) => {
            const s = a.santri as { id?: string; nama?: string; nis?: string } | null;
            return (
              <article key={a.id} className="surface flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Medal className="size-5 text-warning" aria-hidden />
                  <Badge className="bg-success/12 text-success">+{a.points}</Badge>
                </div>
                <h2 className="text-sm font-semibold">{a.event_name}</h2>
                <p className="text-xs text-muted-foreground">
                  {[(a.category as { nama?: string } | null)?.nama, (a.level as { nama?: string } | null)?.nama, a.hasil]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2 text-xs">
                  {s?.id ? (
                    <Link to="/santri/$id" params={{ id: s.id }} className="font-medium text-primary hover:underline">
                      {s.nama}
                    </Link>
                  ) : (
                    <span>{s?.nama}</span>
                  )}
                  <span className="text-muted-foreground">{formatDate(a.tanggal)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <QuickRecord open={open} onOpenChange={setOpen} defaultKind="achievement" />
    </div>
  );
}
