import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials, scoreTone } from "@/lib/app";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "destructive";
}) {
  return (
    <div className="surface p-4 lg:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p
        className={cn(
          "font-display mt-2 text-2xl font-semibold",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "destructive" && "text-destructive",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ScoreRing({ score, size = 92 }: { score: number; size?: number }) {
  const tone = scoreTone(score);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score));
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "info"
        ? "var(--primary)"
        : tone === "warning"
          ? "var(--warning)"
          : "var(--destructive)";

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Skor ${Math.round(score)}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="font-display absolute inset-0 flex items-center justify-center text-lg font-semibold">
        {Math.round(score)}
      </span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden />
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function SantriRow({
  id,
  nama,
  nis,
  meta,
  right,
}: {
  id: string;
  nama: string;
  nis?: string | null;
  meta?: string;
  right?: ReactNode;
}) {
  return (
    <Link
      to="/santri/$id"
      params={{ id }}
      className="surface flex items-center gap-3 p-3 transition-colors hover:bg-muted/60"
    >
      <Avatar className="size-10">
        <AvatarFallback className="bg-secondary text-xs">{initials(nama)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{nama}</p>
        <p className="truncate text-xs text-muted-foreground">{[nis, meta].filter(Boolean).join(" · ")}</p>
      </div>
      {right}
    </Link>
  );
}

export function ScoreBadge({ score }: { score?: number | null }) {
  const tone = scoreTone(score);
  return (
    <Badge
      variant="secondary"
      className={cn(
        "tabular-nums",
        tone === "success" && "bg-success/12 text-success",
        tone === "info" && "bg-primary/12 text-primary",
        tone === "warning" && "bg-warning/15 text-warning",
        tone === "destructive" && "bg-destructive/12 text-destructive",
      )}
    >
      {Math.round(score ?? 0)}
    </Badge>
  );
}
