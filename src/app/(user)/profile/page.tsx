import { requireAuth } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Shield } from "lucide-react";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Profil Saya</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Telepon</p>
              <p className="font-medium">-</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
