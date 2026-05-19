import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const uploadDir = path.join(process.cwd(), "public", "uploads", "builds");

export async function GET() {
  try {
    const builds = await prisma.build.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(builds);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to fetch builds" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const year = String(formData.get("year") || "");
    const name = String(formData.get("name") || "");
    const model = String(formData.get("model") || "");
    const power = Number(formData.get("power") || 0);
    const parts = Number(formData.get("parts") || 0);
    const image = formData.get("image") as File | null;

    if (!year || !name || !model || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await mkdir(uploadDir, { recursive: true });

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = image.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const newBuild = await prisma.build.create({
      data: {
        year,
        name,
        model,
        power,
        parts,
        image: `/uploads/builds/${fileName}`,
      },
    });

    return NextResponse.json(newBuild, { status: 201 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to create build" },
      { status: 500 }
    );
  }
}