import Link from "next/link";
import { Search, Calendar, CreditCard, Volleyball } from "lucide-react";
import { Icon } from "lucide-react";
import { soccerBall, tennisBall, tennisRacket } from "@lucide/lab";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { FieldCard } from "@/components/fields/field-card";
import { getFeaturedFields } from "@/actions/field.actions";

export const dynamic = "force-dynamic";

function SoccerBallIcon({ className }: { className?: string }) {
  return <Icon iconNode={soccerBall} className={className} />;
}

function TennisRacketIcon({ className }: { className?: string }) {
  return <Icon iconNode={tennisRacket} className={className} />;
}

function TennisBallIcon({ className }: { className?: string }) {
  return <Icon iconNode={tennisBall} className={className} />;
}

const sportCategories = [
  { name: "Futsal", icon: SoccerBallIcon, href: "/fields?sportType=FUTSAL" },
  { name: "Bulu Tangkis", icon: TennisRacketIcon, href: "/fields?sportType=BADMINTON" },
  { name: "Basket", icon: Volleyball, href: "/fields?sportType=BASKETBALL" },
  { name: "Tenis", icon: TennisBallIcon, href: "/fields?sportType=TENNIS" },
  { name: "Voli", icon: Volleyball, href: "/fields?sportType=VOLLEYBALL" },
  { name: "Mini Soccer", icon: SoccerBallIcon, href: "/fields?sportType=MINI_SOCCER" },
];

const steps = [
  {
    icon: Search,
    title: "Pilih Lapangan",
    description: "Temukan lapangan olahraga favorit Anda dari berbagai pilihan yang tersedia.",
  },
  {
    icon: Calendar,
    title: "Pilih Jadwal",
    description: "Pilih tanggal dan jam yang sesuai dengan jadwal Anda.",
  },
  {
    icon: CreditCard,
    title: "Lakukan Pembayaran",
    description: "Bayar dengan mudah melalui berbagai metode pembayaran yang tersedia.",
  },
];

export default async function HomePage() {
  const featuredFields = await getFeaturedFields();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Booking Lapangan Olahraga
            <span className="text-white block mt-2">Jadi Lebih Mudah</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white max-w-2xl mx-auto">
            Cari lapangan, pilih jadwal, dan lakukan booking dalam beberapa langkah.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button render={<Link href="/fields" />} size="lg" variant="outline" nativeButton={false} className="border-white text-black hover:bg-white hover:text-black">
              <Search className="mr-2 h-5 w-5" />
              Cari Lapangan
            </Button>
          </div>
        </div>
      </section>

      {/* Sport Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Kategori Olahraga</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sportCategories.map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <category.icon className="h-10 w-10 text-primary mb-3" />
                    <span className="font-medium">{category.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Fields */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Lapangan Terbaru</h2>
            <Button render={<Link href="/fields" />} variant="outline" nativeButton={false}>
              Lihat Semua
            </Button>
          </div>
          {featuredFields.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center text-muted-foreground">
                Belum ada lapangan tersedia.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SportBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
