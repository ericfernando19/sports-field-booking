import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { requireAuth } from "@/lib/permissions";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const UPLOAD_DIRS: Record<string, string> = {
  proof: "proofs",
  field: "fields",
};

const CROP_WIDTH = 1280;
const CROP_HEIGHT = 720;

async function cropImage(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    return buffer;
  }

  const imgRatio = metadata.width / metadata.height;
  const targetRatio = CROP_WIDTH / CROP_HEIGHT;

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

  return image
    .extract({ left, top, width, height })
    .resize(CROP_WIDTH, CROP_HEIGHT)
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "proof";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    if (type === "field") {
      buffer = Buffer.from(await cropImage(buffer));
    }

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const prefix = type === "field" ? "field" : "proof";
    const filename = `${prefix}-${uniqueSuffix}.jpg`;

    const dirName = UPLOAD_DIRS[type] || "proofs";
    const uploadDir = path.join(process.cwd(), "public", "uploads", dirName);
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/${dirName}/${filename}`,
      filename,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengupload file" },
      { status: 500 }
    );
  }
}
