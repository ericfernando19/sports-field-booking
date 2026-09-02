"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  LandPlot,
  Calendar,
  CalendarDays,
  Users,
  CreditCard,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Lapangan",
    href: "/admin/fields",
    icon: LandPlot,
  },
  {
    label: "Jadwal",
    href: "/admin/schedules",
    icon: Calendar,
  },
  {
    label: "Booking",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    label: "Verifikasi Pembayaran",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

const pageTitle: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/fields": "Kelola Lapangan",
  "/admin/schedules": "Kelola Jadwal",
  "/admin/bookings": "Kelola Booking",
  "/admin/payments": "Verifikasi Pembayaran",
  "/admin/users": "Kelola Users",
};

function getPageTitle(pathname: string): string {
  if (pageTitle[pathname]) return pageTitle[pathname];
  if (pathname.startsWith("/admin/fields/new")) return "Tambah Lapangan Baru";
  if (pathname.includes("/edit")) return "Edit Lapangan";
  if (pathname.startsWith("/admin/bookings/") && pathname !== "/admin/bookings") return "Detail Booking";
  for (const [key, value] of Object.entries(pageTitle)) {
    if (pathname.startsWith(key)) return value;
  }
  return "Admin";
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">Sport</span>Book
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Admin</span>
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4 space-y-2">
        <Link
          href="/fields"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Kembali ke Situs
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 border-r bg-muted/30 flex-col z-20">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <SheetTrigger
            nativeButton={false}
            render={
              <div
                className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent bg-background px-2.5 font-medium text-sm hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 cursor-pointer outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-10 h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
          <h1 className="text-lg font-semibold">{getPageTitle(pathname)}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {session?.user?.email}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pt-20 px-4 pb-4 lg:px-6 lg:pb-6 bg-muted/10">{children}</main>
      </div>
    </div>
  );
}
