import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DIMENSIONS, formatDate, initials } from "@/lib/app";
import { EmptyState, ListSkeleton, ScoreRing } from "@/components/common";
import { QuickRecord } from "@/components/quick-record";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/santri/$id")({
  head: () => ({
    meta: [
      { title: "Profil Santri — SantriOS" },
      { name: "description", content: "Student 360: skor, prestasi, kedisiplinan, dan pembinaan." },
      { property: "og:title", content: "Profil Santri — SantriOS" },
      { property: "og:description", content: "Student 360: skor, prestasi, kedisiplinan, dan pembinaan." },
    ],
  }),
  component: Student360,
});

function Student360() {
  const { id } = Route.useParams();
  const [quick, setQuick] = useState(false);
  const [qr, setQr] = useState(false);

  const santri = useQuery({
    queryKey: ["santri", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("v_santri_overview").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const timeline = useQuery({
    queryKey: ["santri-timeline", id],
    queryFn: async () =>
      (
        await supabase
          .from("point_ledger")
          .select("id, description, points, dimension, occurred_at, source_type")
          .eq("santri_id", id)
          .order("occurred_at", { ascending: false })
          .limit(50)
      ).data ?? [],
  });

  const achievements = useQuery({
    queryKey: ["santri-ach", id],
    queryFn: async () =>
      (
        await supabase
          .from("achievements")
          .select("id, event_name, hasil, tanggal, points, organizer")
          .eq("santri_id", id)
          .order("tanggal", { ascending: false })
      ).data ?? [],
  });

  const incidents = useQuery({
    queryKey: ["santri-inc", id],
    queryFn: async () =>
      (
        await supabase
          .from("incidents")
          .select("id, deskripsi, tanggal, points, status, tindakan_awal")
          .eq("santri_id", id)
          .order("tanggal", { ascending: false })
      ).data ?? [],
  });

  const guidance = useQuery({
    queryKey: ["santri-guid", id],
    queryFn: async () =>
      (
        await supabase
          .from("guidance")
          .select("id, goal, approach, status, start_date, coach, guidance_followups(id, tanggal, observation, progress)")
          .eq("santri_id", id)
          .order("start_date", { ascending: false })
      ).data ?? [],
  });

  if (santri.isLoading) return <ListSkeleton rows={6} />;
  const s = santri.data;
  if (!s) return <EmptyState title="Santri tidak ditemukan" />;

  return (
    <div className="rise-in">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/santri">
          <ArrowLeft className="size-4" aria-hidden />
          Santri
        </Link>
      </Button>

      <div className="surface p-4 lg:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-secondary text-lg">{initials(s.nama ?? "")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-xl font-semibold lg:text-2xl">{s.nama}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {s.nis} · {s.kelas_nama} · {s.asrama_nama} {s.kamar_nama ? `· ${s.kamar_nama}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{s.status}</Badge>
              <Badge variant="secondary">{s.total_achievements ?? 0} prestasi</Badge>
              <Badge variant="secondary">{s.total_incidents ?? 0} incident</Badge>
              <Badge variant="secondary">{s.active_guidance ?? 0} pembinaan</Badge>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ScoreRing score={Number(s.growth_score ?? 0)} />
            <span className="text-[11px] text-muted-foreground">Growth Score</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setQuick(true)}>
            <Plus className="size-4" aria-hidden />
            Catat
          </Button>
          <Button size="sm" variant="outline" onClick={() => setQr(true)}>
            <QrCode className="size-4" aria-hidden />
            QR
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((d) => {
            const value = Number((s as Record<string, unknown>)[d.key] ?? 0);
            return (
              <div key={d.key}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-medium tabular-nums">{Math.round(value)}</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="journey" className="mt-6">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="achievements">Prestasi</TabsTrigger>
          <TabsTrigger value="incidents">Incident</TabsTrigger>
          <TabsTrigger value="guidance">Pembinaan</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="mt-4">
          {timeline.isLoading ? (
            <ListSkeleton />
          ) : !timeline.data?.length ? (
            <EmptyState title="Belum ada perjalanan" description="Catatan akan muncul di sini." />
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-5">
              {timeline.data.map((t) => (
                <li key={t.id} className="relative">
                  <span
                    className={`absolute top-1.5 -left-[26px] size-2.5 rounded-full ${
                      t.points >= 0 ? "bg-success" : "bg-destructive"
                    }`}
                  />
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(t.occurred_at)} · {t.dimension} ·{" "}
                    <span className={t.points >= 0 ? "text-success" : "text-destructive"}>
                      {t.points > 0 ? `+${t.points}` : t.points}
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-4 space-y-2">
          {!achievements.data?.length && <EmptyState title="Belum ada prestasi" />}
          {achievements.data?.map((a) => (
            <div key={a.id} className="surface p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.event_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[a.hasil, a.organizer].filter(Boolean).join(" · ")} — {formatDate(a.tanggal)}
                  </p>
                </div>
                <Badge className="bg-success/12 text-success">+{a.points}</Badge>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="incidents" className="mt-4 space-y-2">
          {!incidents.data?.length && <EmptyState title="Tidak ada incident" />}
          {incidents.data?.map((i) => (
            <div key={i.id} className="surface p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{i.deskripsi}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(i.tanggal)} · {i.status}
                  </p>
                </div>
                <Badge className="bg-destructive/12 text-destructive">{i.points}</Badge>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="guidance" className="mt-4 space-y-2">
          {!guidance.data?.length && <EmptyState title="Belum ada pembinaan" />}
          {guidance.data?.map((g) => (
            <div key={g.id} className="surface p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{g.goal}</p>
                <Badge variant="secondary">{g.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {g.approach} · {formatDate(g.start_date)} {g.coach ? `· ${g.coach}` : ""}
              </p>
              {!!g.guidance_followups?.length && (
                <ul className="mt-3 space-y-1.5 border-l border-border pl-3">
                  {g.guidance_followups.map((f) => (
                    <li key={f.id} className="text-xs">
                      <span className="text-muted-foreground">{formatDate(f.tanggal)}</span> — {f.observation}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <QuickRecord open={quick} onOpenChange={setQuick} santriId={id} />

      <Dialog open={qr} onOpenChange={setQr}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>QR Santri</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 pb-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(String(s.qr_token ?? ""))}`}
              alt={`QR untuk ${s.nama}`}
              width={220}
              height={220}
              loading="lazy"
              className="rounded-lg"
            />
            <p className="text-center text-xs text-muted-foreground">Pindai untuk membuka profil santri.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
