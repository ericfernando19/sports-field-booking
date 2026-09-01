import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;

async function cropImage(inputPath: string, outputPath: string) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Tidak bisa membaca dimensi gambar");
  }

  const imgRatio = metadata.width / metadata.height;
  const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;

  let left: number;
  let top: number;
  let width: number;
  let height: number;

  if (imgRatio > targetRatio) {
    height = metadata.height;
    width = Math.round(metadata.height * targetRatio);
    left = Math.round((metadata.width - width) / 2);
    top = 0;
  } else {
    width = metadata.width;
    height = Math.round(metadata.width / targetRatio);
    left = 0;
    top = Math.round((metadata.height - height) / 2);
  }

  await image
    .extract({ left, top, width, height })
    .resize(TARGET_WIDTH, TARGET_HEIGHT)
    .jpeg({ quality: 90 })
    .toFile(outputPath);

  console.log(`  ✓ Cropped: ${path.basename(outputPath)}`);
}

async function main() {
  console.log("=== Re-crop Field Images ===\n");

  const fields = await prisma.field.findMany({
    where: {
      image: { not: null },
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  console.log(`Ditemukan ${fields.length} lapangan dengan gambar.\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const field of fields) {
    if (!field.image) {
      skipped++;
      continue;
    }

    const imagePath = path.join(process.cwd(), "public", field.image);

    if (!fs.existsSync(imagePath)) {
      console.log(`  ✗ File tidak ditemukan: ${field.image}`);
      failed++;
      continue;
    }

    try {
      const ext = path.extname(field.image);
      const baseName = path.basename(field.image, ext);
      const newPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "fields",
        `${baseName}-cropped.jpg`
      );

      await cropImage(imagePath, newPath);

      const newDbPath = `/uploads/fields/${baseName}-cropped.jpg`;

      await prisma.field.update({
        where: { id: field.id },
        data: { image: newDbPath },
      });

      success++;
    } catch (err: any) {
      console.log(`  ✗ Gagal crop ${field.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Selesai ===`);
  console.log(`Berhasil: ${success}`);
  console.log(`Dilewati: ${skipped}`);
  console.log(`Gagal: ${failed}`);

  await prisma.$disconnect();
}

main();
