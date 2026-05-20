import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";

async function uploadToCloudinary(file: File, userId: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "revup/profile",
        public_id: `profile-${userId}-${Date.now()}`,
        resource_type: "image",
        overwrite: true,
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
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = decoded.id || decoded.userId;

    const profile = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const videos = await prisma.post.findMany({
      where: { userId },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    const saved = await prisma.post.findMany({
      where: {
        saves: {
          some: {
            userId,
          },
        },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      profile: {
        ...profile,
        bio: (profile as any).bio || "",
        following: 0,
        followers: 0,
        likes: videos.reduce((total, post) => total + post.likes.length, 0),
        views: 0,
        videosCount: videos.length,
      },
      videos,
      saved,
    });
  } catch (error) {
    console.error("PROFILE API ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = decoded.id || decoded.userId;

    const formData = await req.formData();

    const username = String(formData.get("username") || "").trim();
    const bio = String(formData.get("bio") || "").trim();

    const avatar = formData.get("avatar") as File | null;

    let avatarUrl: string | undefined;

    if (avatar && avatar.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(avatar.type)) {
        return NextResponse.json(
          {
            error:
              "Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed.",
          },
          { status: 400 }
        );
      }

      if (avatar.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size must be less than 5MB." },
          { status: 400 }
        );
      }

      const uploadResult = await uploadToCloudinary(avatar, userId);
      avatarUrl = uploadResult.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        bio,
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      } as any,
    });

    return NextResponse.json({
      profile: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}