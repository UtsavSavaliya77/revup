import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        likes: true,
        saves: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string;
    const category = formData.get("category") as string;
    const mediaType = formData.get("mediaType") as string;
    const tagsRaw = formData.get("tags") as string;
    const userId = formData.get("userId") as string;

    if (!file || !caption || !category || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;
    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

    const post = await prisma.post.create({
      data: {
        caption,
        category,
        tags,
        mediaType,
        mediaUrl: fileUrl,
        image: mediaType === "image" ? fileUrl : null,
        video: mediaType === "video" || mediaType === "reel" ? fileUrl : null,
        userId,
      },
    });

    return NextResponse.json({
      message: "Post uploaded",
      post,
    });
    
  } catch (error) {
    console.log("CREATE_POST_ERROR", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}