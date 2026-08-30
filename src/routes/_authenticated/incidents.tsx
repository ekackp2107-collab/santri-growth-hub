import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { formatDate, logActivity } from "@/lib/app";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/common";
import { QuickRecord } from "@/components/quick-record";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["Open", "In Review", "Resolved", "Escalated"];

export const Route = createFileRoute("/_authenticated/incidents")({
  head: () => ({
    meta: [
      { title: "Incident — SantriOS" },
      { name: "description", content: "Catatan kedisiplinan dan tindak lanjutnya." },
      { property: "og:title", content: "Incident — SantriOS" },
      { property: "og:description", content: "Catatan kedisiplinan dan tindak lanjutnya." },
    ],
  }),
  component: IncidentsPage,
});

function IncidentsPage() {
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const { userId } = useSession();
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["incidents", status],
    queryFn: async () => {
      let q = supabase
        .from("incidents")
        .select(
          "id, deskripsi, tanggal, lokasi, points, status, tindakan_awal, santri:santri_id(id, nama, nis), category:category_id(nama), level:level_id(nama)",
        )
        .order("tanggal", { ascending: false })
        .limit(60);
      if (status !== "all") q = q.eq("status", status);
      return (await q).data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: string }) => {
      const { error } = await supabase.from("incidents").update({ status: next }).eq("id", id);
      if (error) throw error;
      await logActivity(userId, "update", "incidents", id, { status: next });
    },
    onSuccess: () => {
      toast.success("Status diperbarui");
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
    onError: () => toast.error("Gagal memperbarui"),
  });

  return (
    <div className="rise-in">
      <PageHeader
        title="Incident"
        description="Kedisiplinan dan penanganannya"
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
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {list.isLoading ? (
        <ListSkeleton rows={6} />
      ) : !list.data?.length ? (
        <EmptyState title="Tidak ada incident" description="Alhamdulillah, belum ada catatan." />
      ) : (
        <ul className="space-y-2">
          {list.data.map((i) => {
            const s = i.santri as { id?: string; nama?: string } | null;
            return (
              <li key={i.id} className="surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {s?.id ? (
                        <Link to="/santri/$id" params={{ id: s.id }} className="text-sm font-semibold hover:underline">
                          {s.nama}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold">{s?.nama}</span>
                      )}
                      <Badge variant="secondary">{(i.category as { nama?: string } | null)?.nama}</Badge>
                      <Badge className="bg-destructive/12 text-destructive">{i.points}</Badge>
                    </div>
                    <p className="mt-1 text-sm">{i.deskripsi}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(i.tanggal)} {i.lokasi ? `· ${i.lokasi}` : ""}
                      {i.tindakan_awal ? ` · ${i.tindakan_awal}` : ""}
                    </p>
                  </div>
                  <Select value={i.status} onValueChange={(next) => update.mutate({ id: i.id, next })}>
                    <SelectTrigger className="w-[140px]" aria-label="Ubah status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <QuickRecord open={open} onOpenChange={setOpen} defaultKind="incident" />
    </div>
  );
}
