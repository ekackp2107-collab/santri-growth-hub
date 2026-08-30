import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BarChart3,
  Bell,
  Brain,
  ChevronLeft,
  FileText,
  Home,
  LogOut,
  Medal,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  HeartHandshake,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { initials } from "@/lib/app";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { QuickRecord } from "@/components/quick-record";
import { GlobalSearch } from "@/components/global-search";

type NavItem = { to: string; label: string; icon: typeof Home; adminOnly?: boolean };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/santri", label: "Santri", icon: Users },
  { to: "/growth", label: "Growth", icon: TrendingUp },
  { to: "/achievements", label: "Prestasi", icon: Medal },
  { to: "/incidents", label: "Incident", icon: ShieldAlert },
  { to: "/guidance", label: "Pembinaan", icon: HeartHandshake },
  { to: "/recognition", label: "Recognition", icon: Award },
  { to: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { to: "/reports", label: "Laporan", icon: FileText },
  { to: "/insights", label: "AI Insight", icon: Brain },
  { to: "/settings", label: "Pengaturan", icon: Settings, adminOnly: true },
];

const MOBILE_NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/santri", label: "Santri", icon: Users },
  { to: "/growth", label: "Growth", icon: TrendingUp },
  { to: "/more", label: "Lainnya", icon: MoreHorizontal },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, email, role, isAdmin, userId } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const unread = useQuery({
    queryKey: ["notifications", "unread", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      return count ?? 0;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = NAV.filter((n) => !n.adminOnly || isAdmin);
  const name = profile?.full_name || email;

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
          {!collapsed && <span className="font-display text-lg font-semibold">SantriOS</span>}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Menu utama">
          {items.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="size-[18px] shrink-0" aria-hidden />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent/60"
            aria-label={collapsed ? "Buka menu" : "Tutup menu"}
          >
            <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} aria-hidden />
            {!collapsed && "Tutup"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Sparkles className="size-5 text-primary" aria-hidden />
            <span className="font-display font-semibold">SantriOS</span>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted lg:ml-0 lg:w-80"
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden lg:inline">Cari</span>
            <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] lg:inline">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/notifications" })}
              aria-label="Notifikasi"
              className="relative"
            >
              <Bell className="size-[18px]" aria-hidden />
              {!!unread.data && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
              )}
            </Button>
            <Button
              className="hidden lg:inline-flex"
              size="sm"
              onClick={() => setQuickOpen(true)}
            >
              <Plus className="size-4" aria-hidden />
              Record
            </Button>
            <div className="hidden items-center gap-2 pl-2 lg:flex">
              <Avatar className="size-8">
                <AvatarFallback className="bg-secondary text-xs">{initials(name || "S")}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <p className="max-w-[140px] truncate text-xs font-medium">{name}</p>
                <Badge variant="secondary" className="mt-0.5 h-4 px-1.5 text-[10px] capitalize">
                  {role ?? "-"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => void signOut()} aria-label="Keluar">
                <LogOut className="size-[18px]" aria-hidden />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-5 pb-28 lg:px-8 lg:pb-10">{children}</main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-end border-t border-border bg-background/95 pb-[max(env(safe-area-inset-bottom),0.35rem)] backdrop-blur lg:hidden"
          aria-label="Navigasi"
        >
          {MOBILE_NAV.slice(0, 2).map((n) => (
            <MobileTab key={n.to} {...n} active={pathname.startsWith(n.to)} />
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              aria-label="Tambah"
              className="-mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform active:scale-95"
            >
              <Plus className="size-6" aria-hidden />
            </button>
          </div>
          {MOBILE_NAV.slice(2).map((n) => (
            <MobileTab key={n.to} {...n} active={pathname.startsWith(n.to)} />
          ))}
        </nav>
      </div>

      <QuickRecord open={quickOpen} onOpenChange={setQuickOpen} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function MobileTab({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </Link>
  );
}
