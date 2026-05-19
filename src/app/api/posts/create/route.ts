import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

type TokenPayload = {
  id: string;
};

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
      process.env.JWT_SECRET!
    ) as TokenPayload;

    const body = await req.json();

    const { caption, image, category } = body;

    if (!caption || !image) {
      return NextResponse.json(
        { message: "Caption and image required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        caption,
        image,
        category,
        userId: decoded.id,
      },
    });

    return NextResponse.json(
      {
        message: "Post created",
        post,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}