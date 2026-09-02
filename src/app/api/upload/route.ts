import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { requireAuth } from "@/lib/permissions";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const CLOUDINARY_FOLDERS: Record<string, string> = {
  proof: "sportbook/proofs",
  field: "sportbook/fields",
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
    const filename = `${prefix}-${uniqueSuffix}`;
    const folder = CLOUDINARY_FOLDERS[type] || "sportbook/proofs";

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          resource_type: "image",
          format: "jpg",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      filename: `${filename}.jpg`,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengupload file" },
      { status: 500 }
    );
  }
}
