"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, User, LogOut, LayoutDashboard, CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/fields", label: "Lapangan" },
  ];

  if (session) {
    navLinks.push({ href: "/bookings", label: "Booking Saya" });
  }

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">Sport</span>Book
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-sm">{session.user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem render={<Link href="/profile" className="flex items-center gap-2" />}>
                  <User className="h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/bookings" className="flex items-center gap-2" />}>
                  <CalendarDays className="h-4 w-4" />
                  Booking Saya
                </DropdownMenuItem>
                {session.user?.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/admin" className="flex items-center gap-2" />}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard Admin
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button render={<Link href="/login" />} nativeButton={false}>Masuk</Button>
              <Button render={<Link href="/register" />} nativeButton={false}>Daftar</Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<div className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted hover:text-foreground cursor-pointer" />} nativeButton={false}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 px-6 py-4 border-b">
                <Link href="/" onClick={() => setOpen(false)} className="font-bold text-lg">
                  <span className="text-primary">Sport</span>Book
                </Link>
              </div>
              <nav className="flex-1 px-4 py-4">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4">
                  {session ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{session.user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profil
                      </Link>
                      <Link
                        href="/bookings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <CalendarDays className="h-4 w-4" />
                        Booking Saya
                      </Link>
                      {session.user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard Admin
                        </Link>
                      )}
                      <div className="border-t mt-2 pt-2">
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: "/login" });
                            setOpen(false);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 px-3">
                      <Button render={<Link href="/login" onClick={() => setOpen(false)} />} nativeButton={false} className="w-full h-9">
                        Masuk
                      </Button>
                      <Button render={<Link href="/register" onClick={() => setOpen(false)} />} variant="outline" nativeButton={false} className="w-full h-9">
                        Daftar
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
