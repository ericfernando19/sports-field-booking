import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { getFieldById } from "@/actions/field.actions";
import { BookingClient } from "@/components/booking/booking-client";

export const dynamic = "force-dynamic";

interface BookingPageProps {
  params: Promise<{ fieldId: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { fieldId } = await params;
  const field = await getFieldById(fieldId);

  if (!field) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Booking Lapangan</h1>
          <p className="text-muted-foreground mt-1">{field.name}</p>
        </div>

        <BookingClient field={field} />
      </div>
    </div>
  );
}
