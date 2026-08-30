import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { csvDownload, SANTRI_STATUS } from "@/lib/app";
import { EmptyState, ListSkeleton, PageHeader, SantriRow, ScoreBadge } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/_authenticated/santri/")({
  head: () => ({
    meta: [
      { title: "Santri — SantriOS" },
      { name: "description", content: "Direktori santri dengan pencarian dan filter." },
      { property: "og:title", content: "Santri — SantriOS" },
      { property: "og:description", content: "Direktori santri dengan pencarian dan filter." },
    ],
  }),
  component: SantriListPage,
});

function SantriListPage() {
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [kelas, setKelas] = useState("all");
  const [asrama, setAsrama] = useState("all");
  const [page, setPage] = useState(0);

  const master = useQuery({
    queryKey: ["santri-master"],
    queryFn: async () => {
      const [k, a] = await Promise.all([
        supabase.from("kelas").select("id, nama").eq("aktif", true).order("nama"),
        supabase.from("asrama").select("id, nama").eq("aktif", true).order("nama"),
      ]);
      return { kelas: k.data ?? [], asrama: a.data ?? [] };
    },
  });

  const list = useQuery({
    queryKey: ["santri-list", term, status, kelas, asrama, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      let q = supabase
        .from("v_santri_overview")
        .select("id, nama, nis, kelas_nama, asrama_nama, growth_score, status", { count: "exact" })
        .order("nama")
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (status !== "all") q = q.eq("status", status);
      if (kelas !== "all") q = q.eq("kelas_id", kelas);
      if (asrama !== "all") q = q.eq("asrama_id", asrama);
      if (term.trim()) q = q.or(`nama.ilike.%${term.trim()}%,nis.ilike.%${term.trim()}%`);
      const { data, count } = await q;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  async function exportCsv() {
    const { data } = await supabase
      .from("v_santri_overview")
      .select("nis, nama, kelas_nama, asrama_nama, growth_score, total_achievements, total_incidents")
      .order("nama");
    csvDownload("santri.csv", (data ?? []) as Record<string, unknown>[]);
  }

  const total = list.data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="rise-in">
      <PageHeader
        title="Santri"
        description={`${total} santri terdaftar`}
        action={
          <Button variant="outline" size="sm" onClick={() => void exportCsv()}>
            <Download className="size-4" aria-hidden />
            Export
          </Button>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Cari nama atau NIS"
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setPage(0);
            }}
            className="pl-9"
            aria-label="Cari santri"
          />
        </div>
        <Select
          value={kelas}
          onValueChange={(v) => {
            setKelas(v);
            setPage(0);
          }}
        >
          <SelectTrigger aria-label="Kelas">
            <SelectValue placeholder="Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kelas</SelectItem>
            {master.data?.kelas.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={asrama}
          onValueChange={(v) => {
            setAsrama(v);
            setPage(0);
          }}
        >
          <SelectTrigger aria-label="Asrama">
            <SelectValue placeholder="Asrama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua asrama</SelectItem>
            {master.data?.asrama.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
        >
          <SelectTrigger aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            {SANTRI_STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {list.isLoading ? (
        <ListSkeleton rows={8} />
      ) : !list.data?.rows.length ? (
        <EmptyState title="Santri tidak ditemukan" description="Coba ubah kata kunci atau filter." />
      ) : (
        <ul className="space-y-2">
          {list.data.rows.map((s) => (
            <li key={s.id as string}>
              <SantriRow
                id={s.id as string}
                nama={s.nama ?? ""}
                nis={s.nis}
                meta={[s.kelas_nama, s.asrama_nama].filter(Boolean).join(" · ")}
                right={<ScoreBadge score={s.growth_score} />}
              />
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Sebelumnya
          </Button>
          <span className="text-xs text-muted-foreground">
            Halaman {page + 1} / {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  );
}
