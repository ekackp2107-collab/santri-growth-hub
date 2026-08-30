import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { formatDate, GUIDANCE_STATUS, logActivity } from "@/lib/app";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/common";
import { QuickRecord } from "@/components/quick-record";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/guidance")({
  head: () => ({
    meta: [
      { title: "Pembinaan — SantriOS" },
      { name: "description", content: "Program pembinaan santri dan tindak lanjutnya." },
      { property: "og:title", content: "Pembinaan — SantriOS" },
      { property: "og:description", content: "Program pembinaan santri dan tindak lanjutnya." },
    ],
  }),
  component: GuidancePage,
});

const followupSchema = z.object({
  observation: z.string().trim().min(3, { message: "Terlalu pendek." }).max(500),
  next_action: z.string().trim().max(500).optional(),
});

function GuidancePage() {
  const [status, setStatus] = useState("Active");
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [observation, setObservation] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [error, setError] = useState("");
  const { userId } = useSession();
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["guidance", status],
    queryFn: async () => {
      let q = supabase
        .from("guidance")
        .select(
          "id, goal, approach, coach, status, start_date, target_date, santri:santri_id(id, nama), guidance_followups(id, tanggal, observation, next_action)",
        )
        .order("start_date", { ascending: false })
        .limit(60);
      if (status !== "all") q = q.eq("status", status);
      return (await q).data ?? [];
    },
  });

  const setStatusMut = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: string }) => {
      const { error: e } = await supabase.from("guidance").update({ status: next }).eq("id", id);
      if (e) throw e;
      await logActivity(userId, "update", "guidance", id, { status: next });
    },
    onSuccess: () => {
      toast.success("Status diperbarui");
      queryClient.invalidateQueries({ queryKey: ["guidance"] });
    },
    onError: () => toast.error("Gagal memperbarui"),
  });

  const addFollowup = useMutation({
    mutationFn: async () => {
      const parsed = followupSchema.safeParse({ observation, next_action: nextAction });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error: e } = await supabase.from("guidance_followups").insert({
        guidance_id: target!,
        observation: parsed.data.observation,
        next_action: parsed.data.next_action || null,
        created_by: userId ?? null,
      });
      if (e) throw e;
      await logActivity(userId, "create", "guidance_followups", target!, {});
    },
    onSuccess: () => {
      toast.success("Follow-up tersimpan");
      setTarget(null);
      setObservation("");
      setNextAction("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["guidance"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="rise-in">
      <PageHeader
        title="Pembinaan"
        description="Pendampingan berkelanjutan"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Tambah
          </Button>
        }
      />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="mb-4 max-w-[200px]" aria-label="Filter status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua status</SelectItem>
          {GUIDANCE_STATUS.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {list.isLoading ? (
        <ListSkeleton rows={5} />
      ) : !list.data?.length ? (
        <EmptyState title="Belum ada pembinaan" description="Mulai program pendampingan santri." />
      ) : (
        <ul className="space-y-3">
          {list.data.map((g) => {
            const s = g.santri as { id?: string; nama?: string } | null;
            return (
              <li key={g.id} className="surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {s?.id ? (
                      <Link to="/santri/$id" params={{ id: s.id }} className="text-sm font-semibold hover:underline">
                        {s.nama}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold">{s?.nama}</span>
                    )}
                    <p className="mt-1 text-sm">{g.goal}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[g.approach, g.coach, formatDate(g.start_date)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={g.status} onValueChange={(next) => setStatusMut.mutate({ id: g.id, next })}>
                      <SelectTrigger className="w-[140px]" aria-label="Ubah status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GUIDANCE_STATUS.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setTarget(g.id)}>
                      Follow-up
                    </Button>
                  </div>
                </div>

                {!!g.guidance_followups?.length && (
                  <ul className="mt-3 space-y-1.5 border-l border-border pl-3">
                    {g.guidance_followups.map((f) => (
                      <li key={f.id} className="text-xs">
                        <span className="text-muted-foreground">{formatDate(f.tanggal)}</span> — {f.observation}
                        {f.next_action && <span className="text-muted-foreground"> → {f.next_action}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!target} onOpenChange={(v) => !v && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Follow-up</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addFollowup.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="obs">Observasi</Label>
              <Textarea
                id="obs"
                rows={3}
                placeholder="Catatan"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                aria-invalid={!!error}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next">Tindak lanjut</Label>
              <Textarea
                id="next"
                rows={2}
                placeholder="Opsional"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={addFollowup.isPending}>
              {addFollowup.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <QuickRecord open={open} onOpenChange={setOpen} defaultKind="guidance" />
    </div>
  );
}
