import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

type TokenPayload = {
  id?: string;
  userId?: string;
};

async function uploadToCloudinary(file: File, userId: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "revup/garage",
        public_id: `car-${userId}-${Date.now()}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let brand = "";
    let model = "";
    let year = "";
    let image = "";
    let specs: any = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      brand = String(formData.get("brand") || "").trim();
      model = String(formData.get("model") || "").trim();
      year = String(formData.get("year") || "").trim();

      const specsRaw = String(formData.get("specs") || "");

      try {
        specs = specsRaw ? JSON.parse(specsRaw) : null;
      } catch {
        specs = specsRaw || null;
      }

      const imageFile = formData.get("image") as File | null;

      if (imageFile && imageFile.size > 0) {
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];

        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json(
            {
              message:
                "Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed.",
            },
            { status: 400 }
          );
        }

        if (imageFile.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { message: "Image size must be less than 10MB." },
            { status: 400 }
          );
        }

        const uploadResult = await uploadToCloudinary(imageFile, userId);
        image = uploadResult.secure_url;
      }
    } else {
      const body = await req.json();

      brand = String(body.brand || "").trim();
      model = String(body.model || "").trim();
      year = String(body.year || "").trim();
      image = String(body.image || "").trim();
      specs = body.specs || null;
    }

    if (!brand || !model || !year) {
      return NextResponse.json(
        { message: "Brand, model and year are required" },
        { status: 400 }
      );
    }

    const car = await prisma.car.create({
      data: {
        brand,
        model,
        year: Number(year),
        image,
        specs,
        userId,
      } as any,
    });

    return NextResponse.json(
      {
        message: "Car added successfully",
        car,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_CAR_ERROR", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const cars = await prisma.car.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      cars,
    });
  } catch (error) {
    console.error("GET_CARS_ERROR", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}