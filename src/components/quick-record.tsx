import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Award, HeartHandshake, Medal, Search, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { initials, logActivity, notifySelf } from "@/lib/app";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Kind = "achievement" | "incident" | "guidance" | "recognition";

const KINDS: { key: Kind; label: string; icon: typeof Medal }[] = [
  { key: "achievement", label: "Prestasi", icon: Medal },
  { key: "incident", label: "Incident", icon: ShieldAlert },
  { key: "guidance", label: "Pembinaan", icon: HeartHandshake },
  { key: "recognition", label: "Recognition", icon: Award },
];

const textField = z.string().trim().min(3, { message: "Terlalu pendek." }).max(500);

export function QuickRecord({
  open,
  onOpenChange,
  santriId,
  defaultKind,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  santriId?: string;
  defaultKind?: Kind;
}) {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<Kind | null>(defaultKind ?? null);
  const [selected, setSelected] = useState<{ id: string; nama: string; nis: string } | null>(null);
  const [term, setTerm] = useState("");
  const [main, setMain] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [error, setError] = useState("");

  const step = !kind ? 1 : !selected && !santriId ? 2 : 3;

  const santriList = useQuery({
    queryKey: ["quick-santri", term],
    enabled: open && step === 2,
    queryFn: async () => {
      let q = supabase.from("santri").select("id, nama, nis").eq("status", "Aktif").order("nama").limit(20);
      if (term.trim()) q = q.or(`nama.ilike.%${term.trim()}%,nis.ilike.%${term.trim()}%`);
      const { data } = await q;
      return data ?? [];
    },
  });

  const master = useQuery({
    queryKey: ["quick-master"],
    enabled: open,
    queryFn: async () => {
      const [ac, al, ic, il, badges] = await Promise.all([
        supabase.from("achievement_categories").select("id,nama").eq("aktif", true).order("nama"),
        supabase.from("achievement_levels").select("id,nama").eq("aktif", true).order("urutan"),
        supabase.from("incident_categories").select("id,nama").eq("aktif", true).order("nama"),
        supabase.from("incident_levels").select("id,nama").eq("aktif", true).order("urutan"),
        supabase.from("recognition_badges").select("id,nama").eq("aktif", true).order("nama"),
      ]);
      return {
        achievementCategories: ac.data ?? [],
        achievementLevels: al.data ?? [],
        incidentCategories: ic.data ?? [],
        incidentLevels: il.data ?? [],
        badges: badges.data ?? [],
      };
    },
  });

  function reset() {
    setKind(defaultKind ?? null);
    setSelected(null);
    setTerm("");
    setMain("");
    setCategoryId("");
    setLevelId("");
    setBadgeId("");
    setError("");
  }

  const save = useMutation({
    mutationFn: async () => {
      const target = santriId ?? selected?.id;
      if (!target || !kind) throw new Error("Data belum lengkap.");
      const parsed = textField.safeParse(main);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const value = parsed.data;

      if (kind === "achievement") {
        if (!categoryId || !levelId) throw new Error("Kategori dan tingkat wajib.");
        const { data, error } = await supabase
          .from("achievements")
          .insert({
            santri_id: target,
            category_id: categoryId,
            level_id: levelId,
            event_name: value,
            created_by: userId ?? null,
          })
          .select("id")
          .single();
        if (error) throw error;
        await logActivity(userId, "create", "achievements", data.id, { event_name: value });
        await notifySelf(userId, "Prestasi baru", value, "achievement", "achievement", data.id);
      } else if (kind === "incident") {
        if (!categoryId || !levelId) throw new Error("Kategori dan tingkat wajib.");
        const { data, error } = await supabase
          .from("incidents")
          .insert({
            santri_id: target,
            category_id: categoryId,
            level_id: levelId,
            deskripsi: value,
            created_by: userId ?? null,
          })
          .select("id")
          .single();
        if (error) throw error;
        await logActivity(userId, "create", "incidents", data.id, {});
        await notifySelf(userId, "Incident baru", value, "incident", "incident", data.id);
      } else if (kind === "guidance") {
        const { data, error } = await supabase
          .from("guidance")
          .insert({ santri_id: target, goal: value, status: "Active", created_by: userId ?? null })
          .select("id")
          .single();
        if (error) throw error;
        await logActivity(userId, "create", "guidance", data.id, {});
      } else {
        if (!badgeId) throw new Error("Badge wajib.");
        const { data, error } = await supabase
          .from("student_recognitions")
          .insert({ santri_id: target, badge_id: badgeId, alasan: value, created_by: userId ?? null })
          .select("id")
          .single();
        if (error) throw error;
        await logActivity(userId, "create", "student_recognitions", data.id, {});
      }
    },
    onSuccess: () => {
      toast.success("Tersimpan!");
      queryClient.invalidateQueries();
      reset();
      onOpenChange(false);
    },
    onError: (e: Error) => setError(e.message || "Belum tersimpan."),
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl sm:mx-auto sm:max-w-lg">
        <SheetHeader className="pb-0">
          <SheetTitle>{step === 1 ? "Tambah" : step === 2 ? "Pilih Santri" : KINDS.find((k) => k.key === kind)?.label}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-8">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setKind(k.key)}
                  className="surface flex min-h-24 flex-col items-start justify-between p-4 text-left transition-transform active:scale-[0.98]"
                >
                  <k.icon className="size-5 text-primary" aria-hidden />
                  <span className="text-sm font-medium">{k.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  placeholder="Cari"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="pl-9"
                  aria-label="Cari santri"
                />
              </div>
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {(santriList.data ?? []).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelected(s)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-muted"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-xs">{initials(s.nama)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.nama}</p>
                      <p className="text-xs text-muted-foreground">{s.nis}</p>
                    </div>
                  </button>
                ))}
                {!santriList.isLoading && !(santriList.data ?? []).length && (
                  <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              {selected && (
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-secondary text-[10px]">{initials(selected.nama)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">{selected.nama}</span>
                  <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(null)}>
                    Ubah
                  </Button>
                </div>
              )}

              {(kind === "achievement" || kind === "incident") && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Kategori</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {(kind === "achievement" ? master.data?.achievementCategories : master.data?.incidentCategories)?.map(
                          (c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nama}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tingkat</Label>
                    <Select value={levelId} onValueChange={setLevelId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {(kind === "achievement" ? master.data?.achievementLevels : master.data?.incidentLevels)?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {kind === "recognition" && (
                <div className="space-y-1.5">
                  <Label>Badge</Label>
                  <Select value={badgeId} onValueChange={setBadgeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      {master.data?.badges.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="quick-main">
                  {kind === "achievement" ? "Nama Kegiatan" : kind === "guidance" ? "Tujuan" : "Keterangan"}
                </Label>
                <Textarea
                  id="quick-main"
                  rows={3}
                  placeholder="Judul"
                  value={main}
                  onChange={(e) => setMain(e.target.value)}
                  aria-invalid={!!error}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <div className={cn("flex gap-2 pt-1")}>
                <Button type="button" variant="ghost" onClick={reset} className="flex-1">
                  Ulang
                </Button>
                <Button type="submit" className="flex-1" disabled={save.isPending}>
                  {save.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
