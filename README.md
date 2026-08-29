# SportBook - Sistem Booking Lapangan Olahraga

Platform booking lapangan olahraga secara online. Cari lapangan, pilih jadwal, dan lakukan booking dalam beberapa langkah mudah.

## Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Base UI (shadcn/ui)
- **Database:** MySQL
- **ORM:** Prisma 5
- **Authentication:** NextAuth.js v5 (JWT Strategy)
- **Validation:** Zod
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Password Hashing:** bcryptjs

## Requirements

- Node.js 18+ (recommended: 20+)
- MySQL database
- npm

## Installation

```bash
# Clone repository
git clone <repository-url>
cd sportbook

# Install dependencies
npm install
```

## Environment Setup

```bash
# Copy .env.example to .env
cp .env.example .env
```

Edit `.env` file:

```env
DATABASE_URL="mysql://root:password@localhost:3306/sportbook"
AUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE sportbook;
```

### 2. Push Schema to Database

```bash
npm run db:push
```

### 3. Seed Database

```bash
npm run db:seed
```

## Development

```bash
npm run dev
# Open http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run prisma:studio` | Open Prisma Studio |

## Demo Account

### Admin
- **Email:** admin@sportbook.local
- **Password:** Admin123!

### User
- **Email:** user@sportbook.local
- **Password:** User123!

## Features

### Public
- Halaman home dengan hero image dan kategori olahraga
- Browse dan cari lapangan olahraga
- Filter berdasarkan tipe olahraga dan harga
- Lihat detail lapangan dan jadwal tersedia

### User (Login)
- Booking lapangan olahraga
- Pilih tanggal dan jam
- Melakukan pembayaran
- Melihat riwayat booking
- Membatalkan booking
- Update profil

### Admin
- Dashboard dengan statistik
- Kelola lapangan (CRUD)
- Kelola jadwal lapangan
- Kelola booking semua user
- Kelola user

## Project Structure

```
sportbook/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Login, Register
│   │   ├── (public)/          # Public routes (fields)
│   │   ├── (user)/            # User routes (booking, profile)
│   │   ├── admin/             # Admin dashboard & management
│   │   └── api/               # API routes
│   ├── actions/               # Server Actions
│   ├── components/
│   │   ├── ui/                # UI components (Button, Input, Sheet, etc.)
│   │   ├── layout/            # Navbar, Session Provider
│   │   ├── fields/            # Field Card, Filters
│   │   ├── booking/           # Booking components
│   │   └── admin/             # Admin components
│   ├── lib/                   # Utilities (prisma, auth, utils)
│   ├── validations/           # Zod schemas
│   └── types/                 # TypeScript types
└── .env.example
```

## Booking Flow

```
Browse Lapangan → Pilih Lapangan → Pilih Tanggal & Jam
→ Ringkasan Booking → Checkout → Pembayaran
→ Booking Terkonfirmasi
```

## Database Models

| Model | Description |
|-------|-------------|
| **User** | Akun pengguna dengan role (USER/ADMIN) |
| **Field** | Data lapangan olahraga |
| **Schedule** | Slot waktu yang tersedia |
| **Booking** | Data booking user |
| **BookingItem** | Item per jam yang dibooking |
| **Payment** | Data pembayaran |

## License

MIT
