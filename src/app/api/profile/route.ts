import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

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
        likes: videos.reduce(
          (total, post) => total + post.likes.length,
          0
        ),
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

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const userId = decoded.id || decoded.userId;

    const formData = await req.formData();

    const username = String(formData.get("username") || "");
    const bio = String(formData.get("bio") || "");

    const avatar = formData.get("avatar") as File | null;
   
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    let avatarUrl: string | undefined;

    if (avatar && avatar.size > 0) {
      const bytes = await avatar.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${avatar.name}`;
      await writeFile(path.join(uploadDir, fileName), buffer);
      avatarUrl = `/uploads/${fileName}`;
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