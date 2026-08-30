import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/app";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/common";
import { QuickRecord } from "@/components/quick-record";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/recognition")({
  head: () => ({
    meta: [
      { title: "Recognition — SantriOS" },
      { name: "description", content: "Apresiasi karakter dan kontribusi santri." },
      { property: "og:title", content: "Recognition — SantriOS" },
      { property: "og:description", content: "Apresiasi karakter dan kontribusi santri." },
    ],
  }),
  component: RecognitionPage,
});

function RecognitionPage() {
  const [open, setOpen] = useState(false);

  const badges = useQuery({
    queryKey: ["badges"],
    queryFn: async () =>
      (await supabase.from("recognition_badges").select("id, nama, deskripsi, points, dimension").eq("aktif", true).order("nama"))
        .data ?? [],
  });

  const given = useQuery({
    queryKey: ["recognitions"],
    queryFn: async () =>
      (
        await supabase
          .from("student_recognitions")
          .select("id, alasan, tanggal, points, santri:santri_id(id, nama), badge:badge_id(nama)")
          .order("tanggal", { ascending: false })
          .limit(40)
      ).data ?? [],
  });

  return (
    <div className="rise-in">
      <PageHeader
        title="Recognition"
        description="Apresiasi tulus, bukan sekadar angka"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Beri Apresiasi
          </Button>
        }
      />

      <h2 className="font-display mb-3 text-lg font-semibold">Badge</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {badges.data?.map((b) => (
          <div key={b.id} className="surface flex gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{b.nama}</p>
              <p className="text-xs text-muted-foreground">{b.deskripsi}</p>
              <Badge variant="secondary" className="mt-2">
                +{b.points} · {b.dimension}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display mt-8 mb-3 text-lg font-semibold">Terbaru</h2>
      {given.isLoading ? (
        <ListSkeleton rows={4} />
      ) : !given.data?.length ? (
        <EmptyState title="Belum ada apresiasi" />
      ) : (
        <ul className="space-y-2">
          {given.data.map((r) => {
            const s = r.santri as { id?: string; nama?: string } | null;
            return (
              <li key={r.id} className="surface flex items-center gap-3 p-3">
                <Award className="size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  {s?.id ? (
                    <Link to="/santri/$id" params={{ id: s.id }} className="text-sm font-medium hover:underline">
                      {s.nama}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium">{s?.nama}</span>
                  )}
                  <p className="truncate text-xs text-muted-foreground">
                    {(r.badge as { nama?: string } | null)?.nama} — {r.alasan}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(r.tanggal)}</span>
              </li>
            );
          })}
        </ul>
      )}

      <QuickRecord open={open} onOpenChange={setOpen} defaultKind="recognition" />
    </div>
  );
}
