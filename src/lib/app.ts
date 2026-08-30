import { supabase } from "@/integrations/supabase/client";

export const DIMENSIONS = [
  { key: "achievement_score", label: "Prestasi" },
  { key: "discipline_score", label: "Disiplin" },
  { key: "character_score", label: "Karakter" },
  { key: "contribution_score", label: "Kontribusi" },
  { key: "leadership_score", label: "Kepemimpinan" },
  { key: "growth_score_metric", label: "Perkembangan" },
] as const;

export const GUIDANCE_STATUS = ["Planned", "Active", "Follow-up", "Completed", "Closed"] as const;
export const SANTRI_STATUS = ["Aktif", "Cuti", "Alumni", "Keluar"] as const;

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function monthLabel(date = new Date()) {
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export function scoreTone(score?: number | null) {
  const s = score ?? 0;
  if (s >= 80) return "success";
  if (s >= 65) return "info";
  if (s >= 50) return "warning";
  return "destructive";
}

export async function logActivity(
  actorId: string | undefined,
  action: string,
  entity: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
) {
  if (!actorId) return;
  await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action,
    entity,
    entity_id: entityId ?? null,
    metadata: metadata as never,
  });
}

export async function notifySelf(
  userId: string | undefined,
  title: string,
  message: string,
  type: string,
  entityType?: string,
  entityId?: string,
) {
  if (!userId) return;
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
  });
}

export function csvDownload(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
