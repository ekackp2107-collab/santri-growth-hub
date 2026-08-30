import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/app";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const results = useQuery({
    queryKey: ["global-search", term],
    enabled: open,
    queryFn: async () => {
      const t = term.trim();
      let q = supabase.from("v_santri_overview").select("id, nama, nis, kelas_nama, asrama_nama").limit(8);
      if (t) q = q.or(`nama.ilike.%${t}%,nis.ilike.%${t}%`);
      const santri = (await q).data ?? [];
      const ach = t
        ? ((await supabase.from("achievements").select("id, event_name").ilike("event_name", `%${t}%`).limit(5)).data ?? [])
        : [];
      return { santri, ach };
    },
  });

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput placeholder="Cari santri, prestasi..." value={term} onValueChange={setTerm} />
      <CommandList>
        <CommandEmpty>Belum ada hasil</CommandEmpty>
        {!!results.data?.santri.length && (
          <CommandGroup heading="Santri">
            {results.data.santri.map((s) => (
              <CommandItem
                key={s.id as string}
                value={s.id as string}
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: "/santri/$id", params: { id: s.id as string } });
                }}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-secondary text-[10px]">{initials(s.nama ?? "")}</AvatarFallback>
                </Avatar>
                <span className="truncate">{s.nama}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {s.kelas_nama} · {s.asrama_nama}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {!!results.data?.ach.length && (
          <CommandGroup heading="Prestasi">
            {results.data.ach.map((a) => (
              <CommandItem
                key={a.id}
                value={a.id}
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: "/achievements" });
                }}
              >
                <span className="truncate">{a.event_name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
