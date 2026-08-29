import { PrismaClient, Role, SportType, ScheduleStatus, BookingStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.payment.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.field.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const userPassword = await bcrypt.hash("User123!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin SportBook",
      email: "admin@sportbook.local",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "user@sportbook.local",
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log("Users created:", { admin: admin.email, user: user.email });

  const fields = await Promise.all([
    prisma.field.create({
      data: {
        name: "Lapangan Futsal Premium A",
        slug: "futsal-premium-a",
        sportType: SportType.FUTSAL,
        description: "Lapangan futsal sintetis premium dengan pencahayaan LED",
        location: "Jl. Sport Center No. 1, Jakarta Selatan",
        pricePerHour: 150000,
        facilities: "Ruang Ganti,Shower,Parkir Luas,Cafe,Wifi",
      },
    }),
    prisma.field.create({
      data: {
        name: "Lapangan Futsal Premium B",
        slug: "futsal-premium-b",
        sportType: SportType.FUTSAL,
        description: "Lapangan futsal sintetis standar nasional",
        location: "Jl. Sport Center No. 2, Jakarta Selatan",
        pricePerHour: 120000,
        facilities: "Ruang Ganti,Parkir Luas,Cafe",
      },
    }),
    prisma.field.create({
      data: {
        name: "Lapangan Badminton Indoor 1",
        slug: "badminton-indoor-1",
        sportType: SportType.BADMINTON,
        description: "Lapangan badminton indoor dengan AC dan pencahayaan maksimal",
        location: "Jl. Bulutangkis No. 10, Jakarta Pusat",
        pricePerHour: 75000,
        facilities: "AC,Parkir,Wifi,Minuman",
      },
    }),
    prisma.field.create({
      data: {
        name: "Lapangan Badminton Indoor 2",
        slug: "badminton-indoor-2",
        sportType: SportType.BADMINTON,
        description: "Lapangan badminton indoor standar kompetisi",
        location: "Jl. Bulutangkis No. 12, Jakarta Pusat",
        pricePerHour: 65000,
        facilities: "AC,Parkir,Minuman",
      },
    }),
    prisma.field.create({
      data: {
        name: "Lapangan Basket Outdoor",
        slug: "basket-outdoor",
        sportType: SportType.BASKETBALL,
        description: "Lapangan basket outdoor dengan ring resmi FIBA",
        location: "Jl. Basket Raya No. 5, Jakarta Barat",
        pricePerHour: 100000,
        facilities: "Parkir,Toilet,Air Minum",
      },
    }),
    prisma.field.create({
      data: {
        name: "Lapangan Tennis Court",
        slug: "tennis-court",
        sportType: SportType.TENNIS,
        description: "Lapangan tenis hard court dengan lampu malam",
        location: "Jl. Tennis komplek, Jakarta Timur",
        pricePerHour: 80000,
        facilities: "Parkir,Toilet,Wifi",
      },
    }),
    prisma.field.create({
      data: {
        name: "Lapangan Volley Indoor",
        slug: "volley-indoor",
        sportType: SportType.VOLLEYBALL,
        description: "Lapangan voli indoor standar PBSI",
        location: "Jl. Volley No. 8, Jakarta Utara",
        pricePerHour: 60000,
        facilities: "Parkir,Toilet",
      },
    }),
    prisma.field.create({
      data: {
        name: "Mini Soccer Arena",
        slug: "mini-soccer-arena",
        sportType: SportType.MINI_SOCCER,
        description: "Lapangan mini soccer rumput sintetis ukuran 40x20m",
        location: "Jl. Arena Sport No. 3, Tangerang",
        pricePerHour: 200000,
        facilities: "Ruang Ganti,Shower,Parkir Luas,Cafe,Wifi,Pemandu",
      },
    }),
  ]);

  console.log("Fields created:", fields.length);

  const today = new Date();
  const schedules = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);

    for (const field of fields) {
      const timeSlots = [
        { start: "07:00", end: "08:00" },
        { start: "08:00", end: "09:00" },
        { start: "09:00", end: "10:00" },
        { start: "10:00", end: "11:00" },
        { start: "13:00", end: "14:00" },
        { start: "14:00", end: "15:00" },
        { start: "15:00", end: "16:00" },
        { start: "16:00", end: "17:00" },
        { start: "17:00", end: "18:00" },
        { start: "18:00", end: "19:00" },
        { start: "19:00", end: "20:00" },
        { start: "20:00", end: "21:00" },
      ];

      for (const slot of timeSlots) {
        schedules.push({
          fieldId: field.id,
          date: date,
          startTime: slot.start,
          endTime: slot.end,
          price: field.pricePerHour,
          status: ScheduleStatus.AVAILABLE,
        });
      }
    }
  }

  await prisma.schedule.createMany({
    data: schedules,
    skipDuplicates: true,
  });

  console.log("Schedules created:", schedules.length);

  const firstField = fields[0];
  const firstSchedule = await prisma.schedule.findFirst({
    where: {
      fieldId: firstField.id,
      date: today,
      status: ScheduleStatus.AVAILABLE,
    },
  });

  if (firstSchedule) {
    const booking = await prisma.booking.create({
      data: {
        bookingCode: "SB-20260829-001",
        userId: user.id,
        fieldId: firstField.id,
        bookingDate: today,
        startTime: firstSchedule.startTime,
        endTime: firstSchedule.endTime,
        duration: 1,
        subtotal: firstSchedule.price,
        totalPrice: firstSchedule.price,
        status: BookingStatus.CONFIRMED,
      },
    });

    await prisma.bookingItem.create({
      data: {
        bookingId: booking.id,
        scheduleId: firstSchedule.id,
        startTime: firstSchedule.startTime,
        endTime: firstSchedule.endTime,
        price: firstSchedule.price,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionId: "TXN-DEMO-001",
        amount: firstSchedule.price,
        method: PaymentMethod.MOCK,
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });

    await prisma.schedule.update({
      where: { id: firstSchedule.id },
      data: { status: ScheduleStatus.BOOKED },
    });

    console.log("Sample booking created:", booking.bookingCode);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
