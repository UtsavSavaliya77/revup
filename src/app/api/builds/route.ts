import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

async function uploadBuildImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "revup/builds",
        resource_type: "image",
        public_id: `build-${Date.now()}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function GET() {
  try {
    const builds = await prisma.build.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(builds);
  } catch (error) {
    console.error("GET_BUILDS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch builds" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const year = String(formData.get("year") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const model = String(formData.get("model") || "").trim();
    const power = Number(formData.get("power") || 0);
    const parts = Number(formData.get("parts") || 0);
    const image = formData.get("image") as File | null;

    if (!year || !name || !model || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed.",
        },
        { status: 400 }
      );
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be less than 10MB." },
        { status: 400 }
      );
    }

    const uploadResult = await uploadBuildImage(image);
    const imageUrl = uploadResult.secure_url;

    const newBuild = await prisma.build.create({
      data: {
        year,
        name,
        model,
        power,
        parts,
        image: imageUrl,
      },
    });

    return NextResponse.json(newBuild, { status: 201 });
  } catch (error) {
    console.error("CREATE_BUILD_ERROR", error);

    return NextResponse.json(
      { error: "Failed to create build" },
      { status: 500 }
    );
  }
}