"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  CalendarDays,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    icon: Dumbbell,
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
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

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
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-muted/30 flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <SheetTrigger>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
          <div className="lg:hidden" />
          <div className="hidden lg:block" />
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
        <main className="flex-1 p-4 lg:p-6 bg-muted/10">{children}</main>
      </div>
    </div>
  );
}
