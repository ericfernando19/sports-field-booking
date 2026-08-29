import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { type Role } from "@/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as Role,
  };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return user;
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  if (userRole === "ADMIN") return true;
  return userRole === requiredRole;
}

export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

export function isUser(role: Role): boolean {
  return role === "USER";
}
