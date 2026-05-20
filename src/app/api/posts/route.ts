import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 60;

async function uploadToCloudinary(file: File, mediaType: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const resourceType =
    mediaType === "video" || mediaType === "reel" ? "video" : "image";

  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "revup/posts",
        resource_type: resourceType,
        public_id: `post-${Date.now()}`,
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
    console.error("FETCH_POSTS_ERROR", error);

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
    const caption = String(formData.get("caption") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const mediaType = String(formData.get("mediaType") || "").trim();
    const tagsRaw = String(formData.get("tags") || "");
    const userId = String(formData.get("userId") || "").trim();

    if (!file || !caption || !category || !userId || !mediaType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    // const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v",
      "video/mov",
    ];

    if (mediaType === "image" && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Only JPG, PNG, and WEBP are allowed." },
        { status: 400 }
      );
    }

    if (
      (mediaType === "video" || mediaType === "reel") &&
      !allowedVideoTypes.includes(file.type)
    ) {
      return NextResponse.json(
        { error: "Invalid video format. Only MP4, WEBM, and MOV are allowed." },
        { status: 400 }
      );
    }

    const maxSize =
      mediaType === "video" || mediaType === "reel"
        ? 50 * 1024 * 1024
        : 50 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error:
            mediaType === "video" || mediaType === "reel"
              ? "Video size must be less than 50MB."
              : "Image size must be less than 10MB.",
        },
        { status: 400 }
      );
    }

    let tags: string[] = [];

    try {
      tags = tagsRaw ? JSON.parse(tagsRaw) : [];
    } catch {
      tags = [];
    }

    const uploadResult = await uploadToCloudinary(file, mediaType);
    const fileUrl = uploadResult.secure_url;

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
    console.error("CREATE_POST_ERROR", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}