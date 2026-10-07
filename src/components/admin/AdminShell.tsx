import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ExternalLink,
  FileText,
  Handshake,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  Settings,
  Users,
  UserCog,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { LogoMark } from "@/components/site/Logo";
import { Toaster } from "@/components/ui/sonner";
import { EVENT } from "@/lib/event";
import { signOutReader } from "@/lib/reader.functions";
import { canAccess, type Staff } from "@/lib/staff";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, area: "admin", exact: true },
  { to: "/admin/registrations", label: "Registrations", icon: Users, area: "admin" },
  { to: "/admin/sponsors", label: "Sponsors", icon: Handshake, area: "admin" },
  { to: "/admin/speakers", label: "Speakers", icon: Mic, area: "admin" },
  { to: "/admin/blog", label: "Blog", icon: FileText, area: "blog" },
  { to: "/admin/faqs", label: "FAQ", icon: HelpCircle, area: "admin" },
  { to: "/admin/settings", label: "Site settings", icon: Settings, area: "admin" },
  { to: "/admin/team", label: "Team", icon: UserCog, area: "admin" },
] as const;

export function AdminShell({ staff, children }: { staff: Staff; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const signOut = useServerFn(signOutReader);
  const items = NAV.filter((item) => canAccess(staff.role, item.area));

  const nav = (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon, ...item }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: "exact" in item }}
          onClick={() => setMenuOpen(false)}
          className="flex min-h-12 items-center gap-3 rounded-md px-3 font-display font-semibold text-paper/75 transition hover:bg-paper/10 hover:text-paper data-[status=active]:bg-paper data-[status=active]:text-deep-blue"
        >
          <Icon className="h-5 w-5" aria-hidden="true" /> {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-paper/15 pt-4 text-sm">
      <p className="truncate px-3 text-paper/60" title={staff.email}>
        {staff.fullName ?? staff.email}
        <span className="ml-2 rounded bg-paper/10 px-1.5 py-0.5 text-xs uppercase">
          {staff.role}
        </span>
      </p>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center gap-3 rounded-md px-3 font-display text-paper/75 hover:bg-paper/10 hover:text-paper"
      >
        <ExternalLink className="h-5 w-5" aria-hidden="true" /> View site
      </a>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          await navigate({ to: "/admin/login" });
        }}
        className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 font-display text-paper/75 hover:bg-paper/10 hover:text-paper"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" /> Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-grey lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto bg-deep-blue p-4 text-paper lg:flex">
        <Brand />
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-deep-blue px-4 text-paper lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-12 w-12 items-center justify-center rounded-md hover:bg-paper/10"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-0 top-16 z-30 flex flex-col gap-6 overflow-y-auto bg-deep-blue p-4 text-paper lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

function Brand() {
  return (
    <Link to="/admin" className="flex min-h-12 items-center gap-3 font-display font-bold">
      <LogoMark className="h-9 w-9" />
      <span>
        {EVENT.name}
        <span className="block text-xs font-medium text-digital-lime">Dashboard</span>
      </span>
    </Link>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-deep-blue md:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
