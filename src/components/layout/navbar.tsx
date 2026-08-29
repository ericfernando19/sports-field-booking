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
          <SheetTrigger render={<div className="md:hidden inline-flex items-center justify-center rounded-lg hover:bg-muted hover:text-foreground cursor-pointer" />} nativeButton={false} className="md:hidden">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-4 mt-4">
                {session ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{session.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 text-sm hover:text-primary"
                      >
                        <User className="h-4 w-4" />
                        Profil
                      </Link>
                      {session.user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 text-sm hover:text-primary"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: "/login" });
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 mt-4"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button render={<Link href="/login" onClick={() => setOpen(false)} />} nativeButton={false} className="w-full">
                      Masuk
                    </Button>
                    <Button render={<Link href="/register" onClick={() => setOpen(false)} />} variant="outline" nativeButton={false} className="w-full">
                      Daftar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
